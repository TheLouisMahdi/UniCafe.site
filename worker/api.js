// Fixed upstream and narrow routes: this must never become an open proxy.
const UPSTREAM = 'https://wqxichsticiklqhutpzx.supabase.co';
const PUBLIC_KEY = 'sb_publishable_07suK4K6q-vF_AKjhEuJ6A_oiV1uOB3';
const ORIGINS = new Set([
  'https://unicafeznu.ir', 'https://www.unicafeznu.ir',
  'https://thelouismahdi.github.io',
  'http://localhost:8000', 'http://127.0.0.1:8000'
]);
const RPCS = new Set([
  'public_catalog', 'get_public_comments', 'vote_drink', 'send_comment',
  'send_message', 'join_club', 'admin_data', 'admin_set_drink',
  'admin_set_setting', 'admin_moderate_comment', 'admin_draw_winner',
  'admin_delete_member'
]);
const MAX_BODY = 16384;

export async function handleRequest(request, upstreamFetch = fetch) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff'
  });
  const reply = (status, message) => new Response(JSON.stringify({message}), {status, headers});
  if (origin && !ORIGINS.has(origin)) return reply(403, 'Origin not allowed');
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  if (url.protocol !== 'https:') return reply(426, 'HTTPS required');
  headers.set('Strict-Transport-Security', 'max-age=31536000');
  if (url.pathname === '/health' && request.method === 'GET') {
    return new Response(JSON.stringify({ok:true, service:'unicafe-api'}), {headers});
  }
  const rpc = /^\/rest\/v1\/rpc\/([a-z_]+)$/.exec(url.pathname);
  let method;
  if (rpc && RPCS.has(rpc[1]) && !url.search) method = 'POST';
  if (url.pathname === '/auth/v1/token' &&
      ['?grant_type=password', '?grant_type=refresh_token'].includes(url.search)) method = 'POST';
  if (url.pathname === '/auth/v1/user' && !url.search) method = 'GET';
  if (url.pathname === '/auth/v1/logout' && !url.search) method = 'POST';
  if (!method) return reply(404, 'Route not found');
  if (request.method === 'OPTIONS') {
    headers.set('Access-Control-Allow-Methods', `${method}, OPTIONS`);
    headers.set('Access-Control-Allow-Headers', 'apikey, authorization, content-type');
    headers.set('Access-Control-Max-Age', '600');
    return new Response(null, {status:204, headers});
  }
  if (request.method !== method) return reply(405, 'Method not allowed');
  if (request.headers.get('apikey') !== PUBLIC_KEY) return reply(401, 'Invalid public API key');
  let body;
  if (method === 'POST') {
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return reply(415, 'JSON required');
    }
    if (Number(request.headers.get('Content-Length')) > MAX_BODY) return reply(413, 'Request too large');
    const reader = request.body?.getReader();
    const chunks = [];
    let size = 0;
    if (reader) {
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY) { await reader.cancel(); return reply(413, 'Request too large'); }
        chunks.push(value);
      }
    }
    body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    try { JSON.parse(new TextDecoder().decode(body)); } catch { return reply(400, 'Invalid JSON'); }
  }
  const upstreamHeaders = new Headers({'apikey':PUBLIC_KEY, 'Content-Type':'application/json'});
  const token = request.headers.get('Authorization');
  if (token) upstreamHeaders.set('Authorization', token);
  try {
    // No retries: a timed-out write may already have committed in PostgreSQL.
    const response = await upstreamFetch(`${UPSTREAM}${url.pathname}${url.search}`, {
      method, headers:upstreamHeaders, body, redirect:'manual',
      signal:AbortSignal.timeout(12000), cache:'no-store'
    });
    if (response.status >= 300 && response.status < 400) return reply(502, 'Unexpected upstream redirect');
    if (response.status === 204) return new Response(null, {status:204, headers});
    return new Response(response.body, {status:response.status, headers});
  } catch {
    return reply(504, 'ارتباط با سرور موقتاً برقرار نیست؛ کمی بعد دوباره تلاش کن.');
  }
}

export default {fetch: request => handleRequest(request)};
ORIGINS.add('https://unicafe-znu.pages.dev');
