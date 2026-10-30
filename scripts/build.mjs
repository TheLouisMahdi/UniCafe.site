import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const root = fileURLToPath(new URL('../', import.meta.url));
const context = { window: {} };
vm.runInNewContext(await readFile(`${root}assets/config.js`, 'utf8'), context);
const cfg = context.window.UNICAFE_CONFIG;
if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(cfg.supabaseUrl) || !cfg.supabaseAnonKey) {
  throw new Error('Production build requires a real Supabase URL and public key.');
}
if (cfg.supabaseAnonKey.startsWith('sb_secret_')) throw new Error('Private key rejected');
if (cfg.apiUrl && cfg.apiUrl !== 'https://api.unicafeznu.ir') throw new Error('Unexpected API proxy origin');
if (cfg.apiFallbackUrl && cfg.apiFallbackUrl !== 'https://unicafe-api.ghahremani-znjm.workers.dev') throw new Error('Unexpected fallback API origin');
if (cfg.supabaseAnonKey.startsWith('ey')) {
  const claims = JSON.parse(Buffer.from(cfg.supabaseAnonKey.split('.')[1], 'base64url'));
  if (claims.role !== 'anon') throw new Error('Only an anon or publishable key may be shipped');
} else if (!cfg.supabaseAnonKey.startsWith('sb_publishable_')) throw new Error('Unexpected public key format');
await mkdir(`${root}dist/assets`, { recursive: true });
for (const file of ['index.html','drinks.html','about.html','club.html','contact.html','admin.html','404.html','_headers','_redirects','robots.txt']) {
  await copyFile(`${root}${file}`, `${root}dist/${file}`);
}
for (const file of await readdir(`${root}assets`)) await copyFile(`${root}assets/${file}`, `${root}dist/assets/${file}`);
const basePath = process.env.SITE_BASE_PATH || '/';
if (!/^\/(?:[a-zA-Z0-9._-]+\/)*$/.test(basePath)) throw new Error('Invalid site base path');
await writeFile(`${root}dist/404.html`, (await readFile(`${root}404.html`, 'utf8')).replaceAll('href="/assets/', `href="${basePath}assets/`).replace('href="/"', `href="${basePath}"`));
await writeFile(`${root}dist/.nojekyll`, '');
console.log('Static production assets prepared in dist. No tooling, SQL or reference files included.');
