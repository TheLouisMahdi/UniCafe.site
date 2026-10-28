# UniCafe | Codex implementation handoff (October 2026)

You are the implementation owner of this existing, working **six-page** website. **Build on these files, do not replace it with an unrelated design or mockup. The October 2026 v3 graphic redesign specifically matches the supplied mobile reference image.** The owner wants a production-ready static, Persian-first, RTL mobile website for the UniCafe vending machine in the University of Zanjan library.

## Current source of truth

- `index.html`: homepage; includes a new teaser linking to the history page.
- `about.html`: **finished editorial copy** covering the joint idea of an electrical-engineering student and his brother-in-law (a University of Zanjan alumnus who returned for his master's), the red Italian Necta machine in late Mordad 1401, the snack machine added that same year, the robot-arm Italian coffee machine upgrade in 1404, and a personal farewell/thanks from Mehdi Ghahremani, Mehr 1405. **Preserve the facts and the personal tone.** The story and chronology are rendered in `renderAbout()` in `assets/app.js`.
- `contact.html`: two publicly approved numbers, with tap-to-call and copy:
  - Bahram Imani: **09197489913**
  - Mehdi Ghahremani: **09016688302**
  The numbers are currently in `SUPPORT_CONTACTS` in `assets/app.js`. An optional additional number/WhatsApp can be configured in the admin UI.
- `drinks.html`: exact 24 products, their codes, five groups, up/down voting, publicly visible totals subject to manager visibility switches, comments awaiting manager approval.
- `club.html`: consent-based membership with full name, phone and optional Telegram handle; random prize draws are manager-operated and subject to eligibility checks.
- `admin.html`: manager-only dashboard, moderation, drink voting settings, anonymous messages, club members and prize draws.
- `assets/necta-1401.webp`, `snack-1401.webp`, `robot-1404.webp`: cropped/optimized **real images of the machines** supplied by the owner. **Do not add portraits, staff faces, unrelated stock photos, invented machine pictures, or QR codes unrelated to the actual website URL.**
- `supabase/schema.sql`: the starting Postgres schema/RPC/RLS security design; **audit before production**.

## What to finish autonomously

1. Treat `reference/visual-reference.jpg` as the canonical visual specification for the public mobile pages. Preserve the v3 homepage masthead (UniCafe + Roman colosseum + coffee beans), giant cream headline, copper CTA with red heart, three shortcut cards, decorative branded cup, and compact green/red vote rows. Keep this as functional responsive HTML/CSS, never just show the reference JPEG. `assets/reference.css` contains the v3 visual rules and overrides the original CSS. Repair layout/accessibility issues without discarding the visual direction.
2. Set up and validate Supabase project, execute/audit SQL schema, enable anonymous auth for public user actions and password authentication for admins. Never expose admin APIs or private member data to anonymous clients. Create and verify an authorized manager account without embedding privileged secrets in source code.
3. Connect live votes, aggregate public results, comments with moderation, anonymous messages, consent-based club membership and manager's random draw. Test using separate browser sessions. Do not assert that browser anonymous auth is equivalent to one human/one vote; implement reasonable server-side anti-spam and rate limiting.
4. Audit and correct Supabase SQL permission grants, security-definer functions, validation, brute-force protections, anti-spam, request limits, and drawing reliability. Consider phone verification if promised prizes require strong identity. Provide a workable deletion process for club data.
5. Ensure both primary support numbers are visible without backend availability; their `tel:` links open the native dialer on phones. Copy button must work under HTTPS and local preview.
6. Deploy site to owner-controlled Cloudflare Pages or equivalent **only when connected account credentials and permission are available**. Generate a QR code ONLY for the verified public URL with sufficient quiet zone for print. Verify HTTPS on mobile.
7. Add integration/UI tests for all six pages, all 24 drinks, both support contacts, content moderation, vote visibility, data privacy, memberships, member deletion, drawing and mobile widths 320-430px.

## Access, passwords, and stop conditions

You may make routine engineering decisions and generate **new, strong** application secrets. Store credentials in the deployment environment or approved secret store, never in tracked files, build artifacts, chat logs or client JS. Do not bypass MFA/CAPTCHA, reset someone else's password, or spend money without explicit approval. Ask the user **only** for unavoidable account authorization, OTP/MFA, a real domain name, a missing service credential or billing approval. Never claim the site is deployed or the production database is tested until you have checked it.

## Local preview and tests

```sh
python -m http.server 8000
node --test tests/catalog.test.mjs
```

In demo mode, public actions are *local previews only*. Do not present localStorage votes as a live public poll. See `README.md` for setup/security notes.
