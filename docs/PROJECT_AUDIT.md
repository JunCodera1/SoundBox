# SoundBox — Project Audit (state at tag `legacy-v1`, commit 2fb8a00)

Method: read of the real source (routes, controllers, models, store, player) plus actually running `npm ci && vite build`. README claims were not trusted.

## Architecture found
- Root `package.json` mixes backend **and** frontend deps; `frontend/package.json` also lists backend libs (express, bcrypt, stripe…). `node_modules` (1,730 files) was **committed** at the repo root.
- Backend: Express 4 + Mongoose 8 (ESM) in `backend/`. Frontend: Vite + React 18 JS(X) in `frontend/` using **Chakra UI + MUI + Radix + styled-components + Tailwind + sass** simultaneously, plus a purchased admin dashboard template (`adminComponents`, `views/admin`) full of mock JSON.
- `translaher/`: unrelated Astro project (left untouched).

## Critical defects (verified)
| # | Defect | Evidence |
|---|---|---|
| 1 | Frontend does **not build** | `vite build` → `Rollup failed to resolve import "react-cookie"` (dep only in root package.json) |
| 2 | Three different backend ports | server `5000`, `config.jsx` `3000`, `authStore` `8080`; CORS hard-coded to `localhost:5173` |
| 3 | Two incompatible auth schemes | `/auth/signup` sets cookie `token` with `{userId}`; `/auth/login` sets cookie `authToken` (`secure:true`) with `{identifier}` and returns the token in the body; `check-auth` needs `cookie-parser` which is never installed; passport reads `identifier` |
| 4 | `authStore.login` calls `useState` inside a zustand action (invalid hook use) and an undefined `setCookie`/`navigate` | `frontend/src/store/authStore.js` |
| 5 | Auth token stored in a JS-readable cookie and sent as Bearer → XSS-stealable | `serverHelper.jsx` |
| 6 | `search`, `order`, `admin` routers never mounted; `search.route` imports non-existent `../model/song.js`; `order.model` is CommonJS in an ESM project and describes *courses* (copy-paste from another project) | `server.js` |
| 7 | Admin area has **no backend authorization**; frontend admin routes are commented out | — |
| 8 | Model registered as `"song"` but referenced as `"Song"`; refs to non-existent `"Artist"` model; `stats.artistsDiscovered` is a Number but used as an array; `removeLike` compares ObjectIds with `!==` | models |
| 9 | Likes are stored in 3 places (`song.likes`, `song.likedBy`, `user.likedSongs`) | models |
| 10 | Mongo URI printed to logs; `express-rate-limit` imported but never applied; error handler registered after `listen` and leaks nothing but hides everything as 500 | `server.js` |
| 11 | Passwords logged on failed login (`console.log("Password: ", user.password, password)`) | `auth.controller.js` |
| 12 | Player: two sources of truth (`SongContext` + local state in `LoggedInContainer`), Howler instance created per layout mount, no queue, `isPaused` defaulted with `|| true` (always true), no error handling | `LoggedInContainer.jsx`, `App.jsx` |
| 13 | Audio/thumbnail upload depends on Cloudinary credentials (none available) | `CloudinaryUpload*.jsx` |
| 14 | Dead/misleading UI: Store, Payment (PayPal/Stripe), AI page, feed, calendars from the admin template | pages |

## Preserved
Collections/field names (`users`, `songs`, `playlists`, `comments`, `posts`) and the feature set: signup/login, songs w/ genre, likes, playlists, follow, comments, feed posts, upload.

## Decision: incremental where it pays, rewrite where the code is unsalvageable
Same stack (Express/Mongoose/Vite/React/Tailwind/zustand). The backend was rewritten in place under `backend/src` with the same collections; the frontend shell was rebuilt (one UI system) because the legacy build is broken and the code mixes five UI libraries. Legacy code stays recoverable via tag `legacy-v1`.

## Outcome (v2)
Fixes 1–12 above were addressed by the rewrite (see ARCHITECTURE.md). Items 13–14: Cloudinary replaced by local uploads; Store/Payment/AI-page/feed/admin-template removed because they had no working backend or only mock data (recoverable at `legacy-v1`).

## Security review summary
Done: single httpOnly-cookie auth, server-side authz on every route, strict input schemas, regex escaping, helmet, CORS allow-list from env, rate limits (global + auth), upload allow-list/limits/random names, no secrets or URIs in logs, `npm audit` clean (fixed critical `proxy-addr`, react-router).
Remaining risks: no CSRF token (mitigated by `SameSite=Lax` + JSON-only mutations + CORS allow-list); no account lockout/email verification/password reset; uploaded audio is not content-scanned or transcoded (MIME comes from the client, files are served with `nosniff`); `trust proxy` is fixed to 1 hop; JWT cannot be revoked before expiry (7 d); media is public by URL; ephemeral JWT secret in dev.
