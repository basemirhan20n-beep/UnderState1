# POLİTİKON — Şehir & Devlet Simülasyonu

A Turkish-language city & state simulation game (AAA mobile quality, dark theme).

## Stack

- **Frontend**: Single-page app in `index.html` + `src/app.jsx` (React via Babel CDN, no build step)
- **Styles**: `css/styles.css` — Obsidian Design System v5
- **Backend**: Express + Socket.io (`server.js`) — serves static files and real-time events
- **Databases**: Firebase Realtime DB + Firestore (primary), Supabase (bridge layer)
- **Real-time**: Socket.IO for in-game events; Firebase RTDB + Supabase Realtime for state sync

## How to run

```
node server.js
```

Runs on port 5000. The workflow `Start application` is already configured.

## Key files

| File | Purpose |
|------|---------|
| `index.html` | Shell: Firebase init, Supabase bridge, Socket.IO bridge, loading screen, boots `src/app.jsx` |
| `src/app.jsx` | Main React app (~28k lines) — all 25 game screens |
| `css/styles.css` | Design system tokens, layout, component styles |
| `server.js` | Express server: static files, Socket.IO hub, health check |
| `supabase-server.js` | Extended server with Supabase REST API endpoints |

## External services

| Service | Status |
|---------|--------|
| Firebase (Auth + RTDB + Firestore) | Config embedded in `index.html` (project: `politikon-62919`) |
| Supabase | Expects `/api/config` endpoint → `supabase-server.js` has it; `server.js` does not |
| Socket.IO | Self-hosted, works out of the box |

## Notes

- `server.js` is a minimal server (no Supabase API endpoints). For full functionality use `supabase-server.js` instead.
- App loads `src/app.jsx`, Babel-transforms it in the browser, and caches the result in IndexedDB.
- The design spec (`attached_assets/Pasted-Yeni-Tasar-m-Dili-*.txt`) describes a planned AAA-quality UI redesign with Dark Navy + Gold theme across 25 screens.

## User preferences

- Language: Turkish (game UI and code comments are in Turkish)
