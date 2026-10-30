# UniCafe deployment status

## Network repair — 2026-10-30 (supersedes historical host/domain notes below)

- Official domain `https://unicafeznu.ir/` is active on GitHub Pages, with a newly approved certificate for apex/`www` and HTTPS enforcement enabled. HTTP and `www` redirect to the HTTPS apex.
- Worker `unicafe-api` is live at `https://api.unicafeznu.ir` and `https://unicafe-api.ghahremani-znjm.workers.dev`. Browser health probes choose a reachable endpoint before any write; database authorization stays unchanged. Active dashboard Worker version after adding the mirror origin: `6ea30dbe`.
- Cloudflare Pages mirror `https://unicafe-znu.pages.dev/` was updated from the same public build. It is the alternate URL for the currently tested VPN, which drops TLS to Iranian domains (also reproduced on an unrelated `.ir` host).
- `npm test`: 11/11 passed. Live vote add/switch/remove and permission checks passed through the new API; test votes were removed. GitHub workflow https://github.com/TheLouisMahdi/UniCafe.site/actions/runs/41098351658 passed build/deploy/full published-host verification for commit `4282bf3`.
- No data/schema migration, new private credential, billed upgrade, DNS delegation change or local VPN/network-setting change was needed. See `NETWORK_OPERATIONS.md` for operations and verification limits.

## Historical go-live status — 2026-10-28

## Confirmed temporary live site

**https://thelouismahdi.github.io/UniCafe.site/** is live and verified over normal HTTPS. Source: https://github.com/TheLouisMahdi/UniCafe.site . The owner requested GitHub hosting while the purchased domain is inactive. The same real Supabase backend serves this site.

Admin: https://thelouismahdi.github.io/UniCafe.site/admin.html . Sign in with `poimu80@gmail.com` and the password already supplied by the owner. No password is written here or shipped to visitors.

## Completed

- Preserved the existing six-page static Persian RTL implementation, the 24 exact menu entries and order, original About story and real machine photos.
- Replaced public anonymous Supabase Auth with random persistent browser UUIDs and narrowly granted RPCs.
- Removed external JavaScript and font dependencies from the browser runtime.
- Added native HTTP/Auth handling, loading and error states, social metadata, admin noindex metadata, custom 404 and security headers.
- Added the popular-drinks view with global/per-drink result switches respected.
- Applied the tested SQL to the new, healthy Supabase UniCafe project `wqxichsticiklqhutpzx` (Mumbai, `ap-south-1`). The existing unrelated project was left intact.
- Configured verified owner Auth user `poimu80@gmail.com` on the server-only admin allowlist. The admin password is not in source or build output. Use the password supplied by the owner in this chat.
- Published the complete 32-file static build to Cloudflare Pages project `unicafe-znu`, account `8ddfca6c622149bac5bb6a4af708e7a0`. Cloudflare reported success; deployment label `07bdbc3f`.
- Published hostname: https://unicafe-znu.pages.dev/ . This is a deployment result, not a claim that this network can reach it.
- Added the free Cloudflare DNS zone for `unicafeznu.ir`, allowing search, agent and training crawlers. Configured proxied CNAMEs for both apex and `www` to `unicafe-znu.pages.dev`. No unrelated DNS/MX records were removed; the initial zone scan found zero records.
- Actual assigned nameservers: `bristol.ns.cloudflare.com` and `dan.ns.cloudflare.com`.

## Tests passed

- `npm test`: 6/6 tests, including CSV formula-injection protection. Includes exact menu/content checks plus executable PostgreSQL tests covering role grants, table denial, vote changes/removal, comment moderation, visibility switches, consent, privacy, verified-only administration, draws, duplicate winners and deletion.
- `npm run build`: success; only static public assets included. Missing configuration and private keys are rejected by the build.
- Real public API smoke test with two independent browser UUIDs: add, switch and remove vote; totals; private-table denial; admin RPC denial. Its votes were removed.
- Browser UI on the local static files connected to the real production database: all six pages; widths 320/360/390/430; 24 menu cards; mobile navigation; number-copy controls; real Auth admin login; public vote changes/removal; pending comment; manager approval; public approved comment; private anonymous message; club consent requirement and successful signup.
- Live admin RPC verification: global/per-drink result and comment hiding, voting closed per drink, duplicate phone receipt without overwriting/exposing members, rejection and deletion of a comment, random draw, persistent draw history, duplicate-winner exclusion and membership deletion. Only disposable QA data participated; no real prize or real customer was involved.
- Public API returned null counts when results were disabled and no comments when comment visibility was disabled. Switches were restored to enabled.

## QA cleanup

All temporary votes, comments, club membership, the support message and drawing-history row were removed. The authenticated live backend confirmed zero votes, comments, members, messages and draws after cleanup. Public switches were restored to enabled.

## Official domain and remaining verification limits

1. IRNIC reports `unicafeznu.ir` as paid, reserved and awaiting domain approval. Public NS lookup returned NXDOMAIN. This is not a second payment requirement.
2. The owner reports that the IRNIC DNS form was saved. Saved delegation and domain activation still require independent verification. No security-question answer is stored in project files.
3. The present network resolves the Pages hostname to private address `10.10.34.35`. Public DNS-over-HTTPS returned Cloudflare A records, but an HTTPS request using those records failed at the network/TLS layer. TLS validation was not disabled; no computer DNS/proxy settings were changed.
4. Root/www Cloudflare Pages domain attachment, active DNS delegation, and official-domain HTTPS remain to be finished after domain approval. GitHub Pages HTTPS and production browser verification have now succeeded independently of these blockers.
5. No final QR has been generated. Generate the PNG/SVG only after the final official HTTPS hostname is verified. The existing QR generator preserves a white quiet zone.
6. Native phone dialer launch and a physical printed QR scan have not been verified on a phone.
7. The in-app browser's native confirmation stalled a draw UI test. The live draw API and history were independently verified through authenticated RPCs. This does not establish completion of that UI confirmation path.

## GitHub Pages deployment

At the owner's request, GitHub Pages is the temporary hosting target while the official domain awaits activation. Repository: https://github.com/TheLouisMahdi/UniCafe.site . Verified URL: https://thelouismahdi.github.io/UniCafe.site/ . GitHub Pages is configured for workflow deployment and HTTPS is enforced. No CNAME ties this temporary site to the inactive domain.

Workflow https://github.com/TheLouisMahdi/UniCafe.site/actions/runs/40663222354 completed successfully: build, deploy and verify. The latest build includes CSV hardening. No production password, private key or JWT is included.

Published-host checks passed both on the GitHub runner and from this environment: all six pages, the custom 404 and every public image/CSS/JS asset match the expected build over HTTPS; exact real 24-product catalog; public denial of admin RPCs and all private tables. The comparison ignores only Git's platform-specific CRLF/LF conversion in text files.

Additional production browser checks: initial no-login public access, real like/add/switch/remove, correct public totals, real owner admin sign-in, dashboard connection and zero QA records, logout, and all six pages at 320/360/390/430px without overflow or broken loaded images. The API smoke test independently exercised two random browser IDs and removed its votes. Existing live moderation, comments, messages, consent/privacy and drawing checks listed above apply to the same backend. No new disposable club/comment/message records were needed for this host change.

Proof files: `artifacts/github-live-mobile.png`, `artifacts/github-responsive.json`, and `artifacts/github-verification.log` (ignored local artifacts). QR generation for the final official domain remains deferred until that domain is active and verified.

## Resume

GitHub hosting is complete. When the official domain activates, verify the domain detail now shows the assigned Cloudflare nameservers. Finish root and www attachment in the existing Pages project, check delegation and HTTPS with normal certificate verification, run the published-site checks and generate the final QR. Update this status file. Do not recreate the Cloudflare or Supabase projects.


## Cup image refresh — 2026-10-28

Replaced the 149px poster-crop cup images with five independent, high-detail generated product images inspired by the owner's supplied poster. The teal blue cup is used on the homepage and hot-drinks category; the other categories use glass espresso, black latte-art, hazelnut latte and white porcelain cups. These are decorative illustrations. Real machine photos are preserved.

Web assets are 768px wide WebP, with separate 192px menu thumbnails (five thumbnails total 51,294 bytes). The teal asset retains alpha; the old radial mask that softened its edges was removed. Versioned filenames and module/CSS cache keys prevent stale images. The club background also uses the new arabica photo. Original PNG masters are retained locally under ignored `artifacts/cup-masters/`. Final prompts and file locations are recorded in `reference/cup-assets.md`.

Preview checks: homepage, drinks and club at 320/360/390/430/1440px; no horizontal overflow or broken loaded images, 24 unchanged menu entries, and no console errors. Existing owner-controlled visibility settings were respected. Publication uses the existing GitHub Pages workflow and public-host verification.
