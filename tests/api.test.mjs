import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest} from '../worker/api.js';

const key = 'sb_publishable_07suK4K6q-vF_AKjhEuJ6A_oiV1uOB3';
const request = (path, options = {}) => new Request(`https://api.unicafeznu.ir${path}`, {
  method:'POST', headers:{Origin:'https://unicafeznu.ir', apikey:key, 'Content-Type':'application/json'},
  body:'{}', ...options
});

test('API proxy preserves authorization, errors and CORS without caching private data', async () => {
  let calls = 0;
  const req = request('/rest/v1/rpc/admin_data');
  req.headers.set('Authorization', 'Bearer test-admin-token');
  req.headers.set('Cookie', 'must-not-forward=1');
  const response = await handleRequest(req, async (url, init) => {
    calls++;
    assert.equal(url, 'https://wqxichsticiklqhutpzx.supabase.co/rest/v1/rpc/admin_data');
    assert.equal(init.headers.get('Authorization'), 'Bearer test-admin-token');
    assert.equal(init.headers.get('apikey'), key);
    assert.equal(init.headers.get('Cookie'), null);
    assert.equal(init.redirect, 'manual');
    return Response.json({message:'permission denied'}, {status:403});
  });
  assert.equal(calls, 1);
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://unicafeznu.ir');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await response.json()).message, 'permission denied');
});

test('proxy rejects private tables, arbitrary hosts/routes/origins, malformed and oversized writes', async () => {
  const forbidden = () => { throw new Error('Must not contact upstream'); };
  for (const path of ['/rest/v1/club_members?select=*', '/rest/v1/rpc/is_admin',
    '/rest/v1/rpc/public_catalog?url=https://evil.invalid', '/auth/v1/admin/users', '//evil.invalid']) {
    assert.equal((await handleRequest(request(path), forbidden)).status, 404);
  }
  const invalidOrigin = request('/rest/v1/rpc/public_catalog');
  invalidOrigin.headers.set('Origin','https://evil.invalid');
  assert.equal((await handleRequest(invalidOrigin, forbidden)).status, 403);
  assert.equal((await handleRequest(request('/rest/v1/rpc/vote_drink',{body:'x'}), forbidden)).status, 400);
  assert.equal((await handleRequest(request('/rest/v1/rpc/vote_drink',{body:'x'.repeat(16385)}), forbidden)).status, 413);
  const missingKey = request('/rest/v1/rpc/public_catalog');
  missingKey.headers.delete('apikey');
  assert.equal((await handleRequest(missingKey, forbidden)).status, 401);
});

test('preflight and Auth refresh/logout work; network failures never retry writes', async () => {
  const preflight = await handleRequest(request('/auth/v1/token?grant_type=password', {method:'OPTIONS',body:null}));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  assert.equal((await handleRequest(request('/auth/v1/token?grant_type=refresh_token'), async () => Response.json({access_token:'test'}))).status, 200);
  assert.equal((await handleRequest(request('/auth/v1/logout'), async () => new Response(null,{status:204}))).status, 204);
  let calls = 0;
  const response = await handleRequest(request('/rest/v1/rpc/vote_drink'), async () => { calls++; throw new TypeError('network'); });
  assert.equal(response.status, 504);
  assert.equal(calls, 1);
});
