# Network operations — 2026-11-11

## Mobile reachability and capacity

- A 4G+ user on Hamrah Aval (AS197207) could open the site through VPN and got a browser connection error on the same phone without VPN. A matching Globalping test to GitHub Pages timed out before the first response byte. The API on the same network returned HTTP 200. A later repeat to GitHub succeeded, so the failure was intermittent in the measurements.
- Both `unicafeznu.ir` and `www.unicafeznu.ir` now point to the existing `unicafe-znu` Cloudflare Pages production project via proxied CNAMEs. Verified the latest homepage on the apex via normal HTTPS from AS197207 and a German probe. The `pages.dev` hostname is filtered by some DNS resolvers in Iran. Share the custom domain.
- GitHub Pages uses its project URL, `https://thelouismahdi.github.io/UniCafe.site/`, as an independent frontend. Keep its custom-domain field empty. Both sites use the same API and Supabase data. Browser IDs and admin sessions are per origin.
- Public catalog and comment reads start with the RPC itself, then can switch gateways on transport errors, 429 or 5xx. Each successful read selects that gateway for subsequent requests. An uncertain write is sent once. A later operation can select a gateway again.
- A visible menu refreshes its catalog every 60–75 seconds, with a fresh delay after each request to prevent overlapping background polls. Both gateways share the same Supabase project and Cloudflare account quota. Free Workers allows 100,000 requests per day. Pages static requests are unlimited. Check gateway invocations, Supabase egress, and database latency before increasing capacity.
- Supabase Free can pause after a week of inactivity. Pro starts at $25/month with one Micro project and daily backups. Workers Paid starts at $5/month. Supabase plan upgrades are organization-wide, so include the compute for any other active projects when estimating cost. [Supabase plans](https://supabase.com/pricing) · [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/)

## Publishing

1. Run `npm test` and `npm run build`.
2. Push to `main` to update GitHub Pages. The workflow reads the configured Pages URL and path, builds for that path, and verifies the deployment.
3. Upload the root contents of `dist/` to the existing Cloudflare Pages project `unicafe-znu` as a production deployment. Build with the default root path for Cloudflare. The project uses direct upload. Source, SQL and tests are excluded from `dist/`.
4. Run `node scripts/check-deployment.mjs https://unicafeznu.ir/` after the Cloudflare deployment to check all pages and assets, the live catalog and public access restrictions. Deploy changes to `worker/api.js` separately. Preserve the allowlist and database authorization.

The notes below record the previous topology and incident for reference.

## 2026-10-30 history

### Topology at the time

- Primary frontend: `https://unicafeznu.ir` → GitHub Pages. Four DNS-only apex A records point to GitHub's published Pages addresses; `www` is a DNS-only CNAME to `thelouismahdi.github.io`. Keep this arrangement for GitHub's certificate validation/renewal.
- Alternate frontend: `https://unicafe-znu.pages.dev` → existing Cloudflare Pages project. Same public build and production database; no data migration.
- API: `https://api.unicafeznu.ir` (Worker custom domain) and `https://unicafe-api.ghahremani-znjm.workers.dev` → `unicafe-api` Worker → fixed project `wqxichsticiklqhutpzx.supabase.co`.
- Browser races read-only `/health` requests, then pins a working API for that page. Votes, comments, memberships, Auth and admin requests are sent once. A timeout does not authorize retrying a possibly committed write. Reloading rechecks endpoint availability.
- Existing admin sessions on the official hostname keep their project-based storage key. Different frontend origins have separate browser storage and require their own admin sign-in; they share the server database.

### Diagnosis and applied fix

The official domain initially returned HTTP 200 but HTTPS failed certificate name validation. GitHub showed no issued certificate and disabled HTTPS enforcement. Re-saving the custom-domain association caused a new certificate to be approved for both apex and `www`; HTTPS enforcement is now true. Verified HTTPS 200, HTTP 301 to HTTPS, and `www` redirect to the apex, without bypassing certificate verification.

Browser database traffic previously went directly to `*.supabase.co`. It now uses the two Cloudflare API endpoints, removing that direct client dependency. The Worker has an exact RPC/Auth allowlist, JSON/body limits, exact-origin CORS, a fixed upstream/public key, admin JWT forwarding, and no response caching or private credentials. Database grants/RLS were not changed.

Tests through the local VPN proxy on `127.0.0.1:10808` succeeded for GitHub, `workers.dev`, and the Pages mirror. TLS to both UniCafe `.ir` hosts and an unrelated Iranian domain failed through that proxy, while the UniCafe hosts worked directly. Thus the current VPN also has a broader Iranian-domain connectivity problem. A server-side certificate fix alone cannot guarantee access through that VPN. The non-IR mirror is the tested alternate route. No VPN, OS DNS, or proxy settings were changed.

### Previous publishing procedure

1. Run `npm test` and `npm run build`.
2. Push frontend changes to `main`; the existing GitHub Actions workflow deploys and checks `https://unicafeznu.ir/`.
3. The existing Cloudflare Pages project is **direct upload**, not Git-connected. Upload the contents of `dist/` (or a ZIP with those files at its root) as a production deployment of `unicafe-znu` whenever updating the mirror. Source/SQL/tests and Worker source are not public-site artifacts.
4. Deploy Worker changes separately, using the dashboard's Edit code or an authorized Wrangler session with `worker/wrangler.jsonc`. The dashboard module is named `worker.js`; its contents match `worker/api.js`. Do not create a service-role key. No billed upgrade is required for this setup's current free-tier usage.
5. When adding another frontend origin, update the Worker origin allowlist and HTML/`_headers` CSP together. Keep `/health` unprivileged and RPC/admin permission checks in the database.

### Verification

- `npm test`: 11 passing tests, including real PostgreSQL authorization tests, proxy restrictions/CORS, existing admin sessions and no replay of failed writes.
- `node scripts/live-check.mjs`: exact 24-item catalog, independent browser IDs, add/switch/remove votes, private-table denial and public admin denial. Test votes are removed in `finally`. `API_URL` can select either API endpoint. Do not run vote smoke tests concurrently against totals that are changing.
- `node scripts/check-deployment.mjs https://unicafeznu.ir/`: all published pages/assets match `dist/`, custom 404, live catalog, and public permission checks. GitHub runner completed all checks successfully on 2026-10-30. A separate local run encountered an intermittent network timeout while downloading an image; it did not indicate a content mismatch.
- Use a real system proxy explicitly when comparing VPN vs direct, e.g. `curl.exe --proxy http://127.0.0.1:10808 ...` and `curl.exe --noproxy '*' ...`. A normal terminal request may ignore Windows' browser proxy. Never disable TLS validation to make a test pass.

Original hosting projects, production rows and owner settings were retained. QR generation and unrelated frontend redesign are outside this repair.
