# Testing — commands actually executed (2026-11-15, Node 26, Chromium from the system)

| Command | Result |
|---|---|
| `npm test` (vitest + supertest, real MongoDB `soundbox_test`) | **20/20 passed** — cover-size limit, v1-fixture migration (dry-run, apply, idempotent, v1 bcrypt login), auth, validation, cookie flags, upload type/size/cleanup, Range serving, search regex-escaping, ownership/403s, mass-assignment, privacy, admin gate, favorites idempotency, history/taste, playlist privacy & reorder, cascade delete, assistant |
| `npm run test:web` (vitest + jsdom, audio double) | **10/10 passed** — saved seek not applied to another track, single audio element, advance, pause/resume, repeat modes, queue ops, broken source + bounded skip, blocked autoplay message, persistence, sleep timer |
| `cd frontend && npx tsc --noEmit` | passed (0 errors) |
| `npm run build` | passed |
| `PW_CHROMIUM=/usr/bin/chromium npx playwright test` | **13/13 passed** — comment, playlist edit, Following tab, guest redirect, signup, search→play (position advances), pause/seek, queue add/reorder/remove, favorite + playlist, playback continues across SPA navigation, Space shortcut, mix maker, 404 audio shows error, logout/protected, mobile layout (no horizontal overflow); asserts zero console errors |
| `npm audit` (root, frontend) | 0 vulnerabilities (after `npm audit fix` and react-router 7) |

Bugs found *by* these tests and fixed: like counter double-increment (Mongoose `timestamps` made `modifiedCount` always 1); generated cover SVG negative heights (signed shift).

| Manual: `npm start` (prod build, real `backend/.env`) | refuses to start without `JWT_SECRET`; `/api/health` ok; SPA fallback 200; media Range 206; signup sets `HttpOnly; Secure; SameSite=Lax`; session survives reload; no page errors |
| Manual: `npm run dev` | API + Vite up; `/api` and `/media` (Range 206) work through the proxy; login error shown correctly |
| Manual: screenshots (desktop, mobile 390px, expanded player, light theme) | reviewed visually |

Note: the Playwright run leaves a `soundbox_e2e` database and a temp upload dir behind (the web server is killed before it can clean up); it is dropped at the start of the next run, or manually: `mongosh --eval 'db.getSiblingDB("soundbox_e2e").dropDatabase()'`.

## Not executed / limits
`migrate-v1` on a real v1 database, Firefox/WebKit, real MP3 decoding (demo tracks are WAV), real devices & screen readers, load testing, upload via the browser UI, comments UI, admin UI, rate-limit behaviour (disabled under `NODE_ENV=test`), SMTP/OAuth/payments (not implemented). Audio *output* is not audible in headless runs; playback is asserted through the advancing position.
