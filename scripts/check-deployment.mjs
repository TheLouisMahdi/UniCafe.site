import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import vm from 'node:vm';
import { flatDrinks } from '../assets/data.js';

const base = new URL(process.argv[2]);
assert.equal(base.protocol, 'https:');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function get(path, status = 200) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000), cache: 'no-store' });
  assert.equal(response.status, status, `${path}: HTTP ${response.status}`);
  assert.equal(new URL(response.url).protocol, 'https:');
  return Buffer.from(await response.arrayBuffer());
}
for (const name of ['index.html','drinks.html','about.html','club.html','contact.html','admin.html','404.html', ...(await readdir(new URL('../dist/assets/', import.meta.url))).map(n => `assets/${n}`)]) {
  const actual = await get(name);
  const expected = await readFile(new URL(`../dist/${name}`, import.meta.url));
  assert.equal(digest(actual), digest(expected), `Deployed content differs: ${name}`);
  console.log(`HTTPS/content PASS ${name}`);
}
const missing = (await get('missing-qa-page', 404)).toString();
assert.ok(missing.includes('UniCafe'));
const context = {window:{}};
vm.runInNewContext((await get('assets/config.js')).toString(), context);
const cfg = context.window.UNICAFE_CONFIG;
async function rpc(name, args = {}, allowed = true) {
  const response = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/${name}`, {method:'POST', headers:{apikey:cfg.supabaseAnonKey,'Content-Type':'application/json'}, body:JSON.stringify(args), signal:AbortSignal.timeout(30000)});
  assert.equal(response.ok, allowed, `${name}: ${response.status}`);
  return response.json();
}
const catalog = await rpc('public_catalog', {p_browser:randomUUID()});
assert.deepEqual(catalog.drinks.map(d => [d.code,d.name]), flatDrinks.map(d => [d.code,d.name]));
await rpc('admin_data', {}, false);
await rpc('admin_draw_winner', {}, false);
for (const table of ['club_members','anonymous_messages','admin_users','votes']) {
  const response = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?select=*`, {headers:{apikey:cfg.supabaseAnonKey}, signal:AbortSignal.timeout(30000)});
  assert.ok(!response.ok, `Private table exposed: ${table}`);
}
console.log('PASS: all six published pages/assets match the build over HTTPS, custom 404, exact live catalog, private data/admin denied publicly.');
