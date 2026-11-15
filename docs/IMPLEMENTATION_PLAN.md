# Implementation plan (status at end of session: ✅ done & tested · 🟡 done, partly tested · ❌ not done)

- **P0** ✅ untrack node_modules; single auth scheme (httpOnly cookie JWT); one port/proxy; app exportable for tests; rate limiting, helmet-style headers, CORS from env; no secrets in logs.
- **P1** ✅ songs CRUD + ownership, local upload (multer, type/size limits), Range-capable audio serving, demo catalog seed (self-synthesised WAVs), single audio engine + queue, playlists, favorites, history, search.
- **P2** 🟡 new app shell (upload/admin UI not browser-tested) (sidebar, persistent player, mobile nav), Home/Search/Library/Playlist/Profile/Upload/Settings, empty/error/loading states.
- **P3** 🟡 taste (recommendations not UI-tested); ❌ crossfade, lyrics, albums, drag-reorder; taste profile (stats from history), non-AI assistant fallback (mood/genre → catalog playlist), sleep timer, admin moderation (minimal, `isAdmin` enforced on server).
- ❌ Not in scope / documented limitations: payments/store, email flows, OAuth, third-party AI (no credentials).
