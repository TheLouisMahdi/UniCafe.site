# UniCafe

Six Persian RTL pages built with static HTML, CSS, native JavaScript and local images. The 24 menu codes, their order, the original story and the real vending-machine photos are preserved.

## Current deployment

- GitHub repository: https://github.com/TheLouisMahdi/UniCafe.site
- Verified live GitHub Pages address: https://thelouismahdi.github.io/UniCafe.site/ . HTTPS, published content, live voting, real admin sign-in and mobile layouts passed verification.
- Every push to `main` runs the six tests, builds only public static files, deploys to Pages, and verifies every published asset and live public backend permissions.
- The owner reports that the IRNIC nameservers were saved; the purchased domain is still awaiting activation. No custom domain is attached to GitHub Pages, so it works independently of registration.

- Cloudflare account: `8ddfca6c622149bac5bb6a4af708e7a0`
- Pages project: `unicafe-znu`
- Published Pages hostname: `https://unicafe-znu.pages.dev/`
- Initial Cloudflare deployment: `07bdbc3f`. GitHub Pages is now the active temporary host with the latest changes.
- Supabase project: `wqxichsticiklqhutpzx`, organization `hdezenphttwrlicbtqyx`, region Mumbai (`ap-south-1`).
- Intended official domain: `unicafeznu.ir`. Registration/DNS/HTTPS activation are still being checked. Do not print a QR until the final hostname is verified.
- The current network previously blocked the Cloudflare Pages hostname. The GitHub Pages hostname is reachable and has been verified in the browser and over normal HTTPS.

## Public access and privacy

No visitor account, anonymous Auth signup, CAPTCHA, OTP, IP restriction or fingerprint is used. A random UUID is kept in browser localStorage to support one editable vote per drink per browser. This is casual deduplication and does not prove one person equals one vote. Clearing browser data or using another device creates a new identifier.

Public operations use limited Supabase RPCs. All underlying tables have RLS enabled and direct browser-role access revoked. Public responses never return member details, support messages, browser IDs or unapproved comments. New comments explicitly start pending. Results and comment visibility are enforced by the database, globally and per drink.

Comments/messages have short per-browser cooldowns to prevent accidental repeated submissions. There is no IP-based rate limit. Platform-internal limits may still apply.

Club registration requires explicit consent, validates Iranian mobile numbers and keeps records private. Duplicate numbers receive the same neutral receipt and cannot overwrite another member. Phone ownership is not verified. Members can request deletion through either support number or the private message form; an authenticated manager deletes the membership. Deleted member details are removed from drawing history through the foreign key.

Admin sign-in uses real Supabase email/password Auth. Every privileged function requires a non-anonymous, email-confirmed user on the server-owned `admin_users` allowlist. Tokens are retained only in that admin tab's sessionStorage. No admin password, access token or private service key is shipped in site files.

The manager can moderate comments, control voting/results/comments globally and per drink, view private messages and members, delete memberships, export members and manually draw a winner. Draws are serialized and never run automatically. No member name or phone is returned through the public API.

## Development and publishing

```sh
npm ci
npm test
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. `assets/config.js` contains only the public project URL and publishable key. The production build rejects missing configuration and private keys.

```sh
npm run build
node scripts/live-check.mjs
```

GitHub Actions publishes only `dist/`. For a manual GitHub build, use `SITE_BASE_PATH=/UniCafe.site/` for the custom 404 links. Ordinary page and asset links work under either a subdirectory or the domain root. GitHub Pages ignores Cloudflare `_headers`; the HTML also sets a content security policy. Cloudflare remains prepared for the official domain. Upload only `dist/` to the existing Cloudflare Pages project. Do not upload the source root, SQL, tests, node_modules or private account material. The browser runtime has no third-party JavaScript or font dependency. Node/PGlite are development-only.

`supabase/schema.sql` is the tested initial schema for a new, empty project. It has been applied to UniCafe. Do not apply it to an unrelated project or an old schema that still uses Auth IDs for public records. Future production changes should be explicit migrations.

## Verification

`npm test` runs catalog/content checks and executable PostgreSQL tests for role grants, RLS restrictions, vote switching/removal, moderation, global/per-drink visibility, consent, duplicate privacy, verified-admin authorization, drawings and deletion.

`node scripts/live-check.mjs` tests the real public backend with two independent random identifiers and removes its own test votes. It requires voting/results to be enabled. It checks direct-table denial and public denial of privileged RPCs.

All six published GitHub pages have been checked at 320, 360, 390 and 430px. The real backend has been tested through browser UI and direct RPCs. Printing, native phone dialer launch, custom-domain HTTPS and final QR must be verified after domain activation. See `DEPLOYMENT_STATUS.md` for the final handoff status.

Support contacts remain Bahram Imani **09197489913** and Mehdi Ghahremani **09016688302**, with tel links and copy buttons.
