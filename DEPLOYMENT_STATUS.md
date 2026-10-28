# UniCafe go-live status — 2026-10-28

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

## External blockers / not yet verified

1. IRNIC reports `unicafeznu.ir` as paid, reserved and awaiting domain approval. Public NS lookup returned NXDOMAIN. This is not a second payment requirement.
2. The owner reports that the IRNIC DNS form was saved. Saved delegation and domain activation still require independent verification. No security-question answer is stored in project files.
3. The present network resolves the Pages hostname to private address `10.10.34.35`. Public DNS-over-HTTPS returned Cloudflare A records, but an HTTPS request using those records failed at the network/TLS layer. TLS validation was not disabled; no computer DNS/proxy settings were changed.
4. Root/www Pages domain attachment, active DNS delegation, public HTTPS, redirects if needed, and production browser verification remain to be finished after the relevant external state permits them.
5. No final QR has been generated. Generate the PNG/SVG only after the final official HTTPS hostname is verified. The existing QR generator preserves a white quiet zone.
6. Native phone dialer launch and a physical printed QR scan have not been verified on a phone.
7. The in-app browser's native confirmation stalled a draw UI test. The live draw API and history were independently verified through authenticated RPCs. This does not establish completion of that UI confirmation path.

## GitHub Pages deployment

At the owner's request, GitHub Pages is the temporary hosting target while the official domain awaits activation. Repository: https://github.com/TheLouisMahdi/UniCafe.site . Intended Pages URL: https://thelouismahdi.github.io/UniCafe.site/ . A workflow tests, builds, deploys and checks actual published assets plus the real shared Supabase backend. GitHub activation and live verification are in progress. The latest build includes CSV hardening. No production password, private key or JWT is included.

## Resume

Confirm the IRNIC DNS form was saved; verify the domain detail now shows the assigned Cloudflare nameservers. Finish root and www attachment in the existing Pages project, check delegation and HTTPS with normal certificate verification, run the published-site checks and generate the final QR. Update this status file. Do not recreate the Cloudflare or Supabase projects.
