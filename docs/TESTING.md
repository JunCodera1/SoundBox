# Testing — commands actually executed (2026-11-15, Node 26, Chromium from the system)

| Command | Result |
|---|---|
| `npm test` (vitest + supertest, real MongoDB `soundbox_test`) | **18/18 passed** — auth, validation, cookie flags, upload type/size/cleanup, Range serving, search regex-escaping, ownership/403s, mass-assignment, privacy, admin gate, favorites idempotency, history/taste, playlist privacy & reorder, cascade delete, assistant |
| `npm run test:web` (vitest + jsdom, audio double) | **8/8 passed** — single audio element, advance, pause/resume, repeat modes, queue ops, broken source + bounded skip, blocked autoplay message, persistence, sleep timer |
| `cd frontend && npx tsc --noEmit` | passed (0 errors) |
| `npm run build` | passed |
| `PW_CHROMIUM=/usr/bin/chromium npx playwright test` | **12/12 passed** — guest redirect, signup, search→play (position advances), pause/seek, queue add/reorder/remove, favorite + playlist, playback continues across SPA navigation, Space shortcut, mix maker, 404 audio shows error, logout/protected, mobile layout (no horizontal overflow); asserts zero console errors |
| `npm audit` (root, frontend) | 0 vulnerabilities (after `npm audit fix` and react-router 7) |

Bugs found *by* these tests and fixed: like counter double-increment (Mongoose `timestamps` made `modifiedCount` always 1); generated cover SVG negative heights (signed shift).

## Not executed / limits
Firefox/WebKit, real MP3 decoding (demo tracks are WAV), real devices & screen readers, load testing, upload via the browser UI, comments UI, admin UI, rate-limit behaviour (disabled under `NODE_ENV=test`), SMTP/OAuth/payments (not implemented). Audio *output* is not audible in headless runs; playback is asserted through the advancing position.
