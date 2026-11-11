// Minimal Supabase HTTP client. Public actions never create Auth users.
export function createBackend({ supabaseUrl, supabaseAnonKey, apiUrl, apiFallbackUrl }, storage = sessionStorage) {
  const url = (apiUrl || supabaseUrl).replace(/\/$/, '');
  const gateways = [...new Set([url, apiFallbackUrl?.replace(/\/$/, '')].filter(Boolean))];
  const publicReads = new Set(['/rest/v1/rpc/public_catalog', '/rest/v1/rpc/get_public_comments']);
  const unavailable = 'اتصال به سرور برقرار نشد؛ کمی بعد دوباره تلاش کن.';
  let endpoint;
  let pendingSelection;
  function selectEndpoint() {
    if (endpoint || gateways.length === 1) return Promise.resolve(endpoint || url);
    return pendingSelection ||= Promise.any(gateways.map(async candidate => {
      const response = await fetch(`${candidate}/health`, {signal:AbortSignal.timeout(5000), cache:'no-store'});
      const health = await response.json();
      if (!response.ok || health.ok !== true || health.service !== 'unicafe-api') throw new Error('API unavailable');
      return candidate;
    })).then(candidate => endpoint = candidate, () => { throw new Error(unavailable); })
      .finally(() => { pendingSelection = undefined; });
  }
  // Preserve admin sessions when changing the network endpoint.
  const key = `unicafe-admin:${supabaseUrl.replace(/\/$/, '')}`;
  let current;
  try { current = JSON.parse(storage.getItem(key) || 'null'); } catch { current = null; }
  const persist = value => {
    current = value;
    if (value) storage.setItem(key, JSON.stringify(value));
    else storage.removeItem(key);
  };
  async function request(path, body, token = null, method = 'POST') {
    const readOnly = !token && publicReads.has(path);
    const candidates = readOnly ? [...new Set([endpoint, ...gateways].filter(Boolean))] : [await selectEndpoint()];
    const init = {
      method,
      headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(method === 'GET' ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store'
    };
    // Only the two public reads may try another gateway. A write may already have committed.
    for (const candidate of candidates) {
      let response, data;
      try {
        response = await fetch(`${candidate}${path}`, {
          ...init, signal: AbortSignal.timeout(readOnly ? 4500 : 15000)
        });
        data = readOnly ? await response.json() : await response.json().catch(() => null);
      } catch {
        if (endpoint === candidate) endpoint = undefined;
        continue;
      }
      if (response.status === 429 || response.status >= 500) {
        if (endpoint === candidate) endpoint = undefined;
        if (readOnly) continue;
      }
      if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || unavailable);
      if (readOnly) endpoint = candidate;
      return data;
    }
    throw new Error(unavailable);
  }
  async function adminToken() {
    if (!current) return null;
    if (current.expires_at * 1000 < Date.now() + 60000) {
      try {
        const renewed = await request('/auth/v1/token?grant_type=refresh_token', { refresh_token: current.refresh_token });
        persist({ ...renewed, expires_at: renewed.expires_at || Math.floor(Date.now() / 1000) + renewed.expires_in });
      } catch (error) { persist(null); throw error; }
    }
    return current.access_token;
  }
  return {
    async rpc(name, args) {
      try {
        const token = name.startsWith('admin_') ? await adminToken() : null;
        return { data: await request(`/rest/v1/rpc/${name}`, args, token), error: null };
      } catch (error) { return { data: null, error }; }
    },
    auth: {
      async signInWithPassword(credentials) {
        try {
          const result = await request('/auth/v1/token?grant_type=password', credentials);
          persist({ ...result, expires_at: result.expires_at || Math.floor(Date.now() / 1000) + result.expires_in });
          return { data: result, error: null };
        } catch (error) { return { data: null, error }; }
      },
      async getUser() {
        try { const token = await adminToken(); return { data: { user: token ? await request('/auth/v1/user', null, token, 'GET') : null } }; }
        catch { return { data: { user: null } }; }
      },
      async signOut() {
        const token = current?.access_token;
        persist(null);
        if (token) await request('/auth/v1/logout', {}, token).catch(() => {});
      }
    }
  };
}
