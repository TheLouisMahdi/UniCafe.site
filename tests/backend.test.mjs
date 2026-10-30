import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackend} from '../assets/backend.js';

test('browser sends public RPC and existing admin session through the configured gateway', async () => {
  const originalFetch = globalThis.fetch;
  const project = 'https://example.supabase.co';
  const existingKey = `unicafe-admin:${project}`;
  const values = new Map([[existingKey, JSON.stringify({access_token:'existing-token',expires_at:Date.now()/1000+3600})]]);
  const storage = {getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const calls = [];
  globalThis.fetch = async (url, init) => {calls.push({url,init}); return Response.json({ok:true});};
  try {
    const backend = createBackend({supabaseUrl:project,apiUrl:'https://api.unicafeznu.ir',supabaseAnonKey:'public'},storage);
    assert.equal((await backend.rpc('public_catalog',{})).error, null);
    assert.equal((await backend.rpc('admin_data',{})).error, null);
    assert.equal(calls[0].url, 'https://api.unicafeznu.ir/rest/v1/rpc/public_catalog');
    assert.equal(calls[1].url, 'https://api.unicafeznu.ir/rest/v1/rpc/admin_data');
    assert.equal(calls[0].init.headers.Authorization, undefined);
    assert.equal(calls[1].init.headers.Authorization, 'Bearer existing-token');
    assert.equal(values.size, 1);
  } finally {globalThis.fetch = originalFetch;}
});

test('unreachable primary falls back before a write and never replays a failed write', async () => {
  const originalFetch = globalThis.fetch;
  const storage = {getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url === 'https://primary.invalid/health') throw new TypeError('blocked');
    if (url.endsWith('/health')) return Response.json({ok:true,service:'unicafe-api'});
    throw new TypeError('connection lost after write');
  };
  try {
    const backend = createBackend({supabaseUrl:'https://example.supabase.co',apiUrl:'https://primary.invalid',apiFallbackUrl:'https://fallback.invalid',supabaseAnonKey:'public'},storage);
    assert.ok((await backend.rpc('vote_drink',{})).error);
    assert.deepEqual(calls.filter(url=>!url.endsWith('/health')), ['https://fallback.invalid/rest/v1/rpc/vote_drink']);
  } finally {globalThis.fetch = originalFetch;}
});
