# Features (verified = covered by an automated test, see TESTING.md)

| Area | Status |
|---|---|
| Sign up / log in / log out, protected routes, change password | ✅ verified (API + e2e) |
| Player: play/pause, next/prev, seek, volume, mute, repeat (off/all/one), shuffle, persistence, errors, keyboard shortcuts (Space, ←/→ seek, Shift+←/→ prev/next, M, S, R), Media Session | ✅ unit + e2e (shortcuts: Space only) |
| Queue: add, play next, reorder, remove, clear, jump | ✅ unit + e2e |
| Mini player + expanded player (mobile-friendly), sleep timer | ✅ sleep timer unit-tested; UI manually screenshotted |
| Catalog browse, genre browse, search (songs/artists/playlists/suggestions) | ✅ verified |
| Favorites, history, taste summary (genres/artists/week-over-week from real plays), recommendations from taste | ✅ API verified; recommendations not UI-tested |
| Playlists: create, add/remove, reorder (API), public/private, share by link | ✅ API; reorder has no drag UI |
| Upload (local storage) with rights confirmation | ✅ API verified; UI upload not e2e-tested |
| Profiles, follow/unfollow, privacy controls (activity hidden by default) | ✅ API verified |
| Comments on songs | ✅ API verified; **no UI yet** |
| Mix Maker (local keyword/genre matcher over the real catalog) | ✅ verified — not an LLM |
| Admin: stats + user list, enforced by server | ✅ API verified; UI not e2e-tested |

## Not implemented (deliberately)
Payments/Store/Premium (v1 had no working backend for them), email verification & password reset (needs SMTP credentials), OAuth, lyrics (no licensed data source), crossfade, albums (no album model in the data), activity feed/posts, LLM assistant (no API key; the local mix-maker is the fallback), drag-and-drop reordering, Cloudinary uploads.
