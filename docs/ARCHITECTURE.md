# Architecture

```
backend/src
  app.js            Express app factory (exported for tests)    server.js  connects to Mongo + listens
  config.js         env parsing; refuses to start in production without JWT_SECRET
  models/index.js   User, Song, Playlist, Comment, Play (collections: users, songs, playlists, comments, plays)
  middleware/auth.js  cookie/Bearer JWT -> user reloaded from DB; requireAuth / requireAdmin
  routes/           auth, songs, playlists, me (favorites/history/taste), search, users, discover (+assistant), admin
  services/         upload (multer rules), taste (history aggregation), assistant (local mood->genre matcher), present (DTOs)
  scripts/          seed.js (synthesised WAV demo catalogue), e2e-server.js
frontend/src
  stores/player.ts  ONE HTMLAudioElement owned by the module + zustand state (queue, repeat, shuffle, sleep timer, persistence)
  stores/auth.ts    session hint (httpOnly cookie is the real credential)
  pages/ components/ lib/ (api wrapper, useAsync)
```

**Auth:** JWT (7 d) in an `httpOnly`, `SameSite=Lax`, `Secure`(prod) cookie; `Authorization: Bearer` also accepted. The user is re-read from MongoDB on every request, so `isAdmin` and ownership are always checked server-side. Login/signup are rate limited; unknown email and wrong password return the same error. Mass-assignment is blocked with strict zod schemas.

**API** (all under `/api`, JSON `{error}` on failure): `auth/{signup,login,logout,me,password}`, `songs` (list/filter/genres/trending/CRUD, `:id/play`, `:id/similar`, `:id/comments`), `playlists` (`mine`, `public`, CRUD, songs, `order`), `me/{favorites,history,taste}`, `search`, `search/suggest`, `users/{artists,:id,:id/follow}`, `discover/{home,assistant}`, `admin/{stats,users}`. Media is served from `/media/*` by `express.static` (HTTP Range ⇒ seeking works).

**Uploads:** multer, MIME allow-list (audio ≤30 MB, image ≤5 MB), random server-side filenames with extension derived from MIME, files removed on validation failure and on song deletion, explicit "I have the rights" confirmation.

**Data decisions (v1 compatibility: see PROJECT_AUDIT.md; use `scripts/migrate-v1.js`):** likes live in `user.likedSongs` (source of truth) + a `song.likes` counter updated only when the set really changes; plays are a `Play` collection (deduped per user/song/minute). Collections `users`/`songs`/`playlists` are reused; new fields have defaults (privacy defaults to private activity, playlists private).

**Player rules:** the audio element is created once; a load token discards stale async work; autoplay-blocked and 404/decoding errors surface in the UI and auto-skip (bounded); state persists to localStorage and restores *paused*; Media Session API integration.
