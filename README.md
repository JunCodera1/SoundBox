# SoundBox — your personal music universe

Listen, collect and share music. A MERN app (Express + MongoDB + React/Vite/Tailwind) with one persistent audio engine, queue, playlists, favorites, listening history, search and a local mix-maker.

> **Music rights:** SoundBox ships with 10 *procedurally generated* demo tracks (CC0, made by the seed script). Uploads require the uploader to confirm they own the rights. SoundBox is not a licensed commercial streaming service.

## Quick start

Requirements: Node ≥ 20, a running MongoDB (default `mongodb://127.0.0.1:27017`).

```bash
npm run install:all            # root + frontend dependencies
cp .env.example backend/.env   # optional in dev; set JWT_SECRET for stable sessions
npm run seed                   # creates demo catalogue in database `soundbox_dev`
npm run dev                    # API :5000 + web :5173 (Vite proxies /api and /media)
```

Open http://localhost:5173. Create an account (no email verification) and play something.

Make an admin: `mongosh soundbox_dev --eval 'db.users.updateOne({username:"you"},{$set:{isAdmin:true}})'`.

## Commands
| | |
|---|---|
| `npm run dev` | API + web in watch mode |
| `npm run build` | type-check + production build of the web app (`frontend/dist`) |
| `npm start` | production API (`NODE_ENV=production`, needs `JWT_SECRET`); serves `frontend/dist` too |
| `npm test` | backend API tests (uses DB `soundbox_test`, dropped on each run) |
| `npm run test:web` | player/state unit tests |
| `npm run test:e2e` | Playwright browser journey (own DB `soundbox_e2e`, port 5055/4173; set `PW_CHROMIUM=/usr/bin/chromium` to use a system browser) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/FEATURES.md](docs/FEATURES.md), [docs/TESTING.md](docs/TESTING.md), [docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md).

## Configuration (`backend/.env`)
See [.env.example](.env.example). `JWT_SECRET` is mandatory in production. Never commit `.env`.
Original v1 code is preserved at git tag `legacy-v1`. `translaher/` is an unrelated Astro project left untouched.
