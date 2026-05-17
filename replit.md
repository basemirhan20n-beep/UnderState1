# UNDERSTATE - City & State Simulation Game

## Project Overview
UNDERSTATE is a Turkish-language browser-based multiplayer city and state simulation game. It's a static HTML/JS/CSS application served via a Python HTTP server. The game features user profiles, dynamic messaging, agriculture/trade mechanics, military hierarchy, parliament simulation, and more.

## Architecture
- **Frontend**: Single-page HTML app (`index.html`) with vanilla JavaScript and React (loaded via CDN)
- **Backend storage**: Firebase (Firestore + Realtime Database) for multiplayer game state
- **Server**: Python `http.server` (no-cache handler) on port 5000
- **Auth**: Firebase Anonymous Authentication (auto-assigned UID per session)

## Project Structure
- `index.html` — Main game UI (711 lines)
- `server.py` — Static file server with cache-busting headers (port 5000)
- `js/` — Firebase initialization and real-time sync modules
- `css/styles.css` — Game styles
- `audio/background.mp3` — Background music
- `src/` — Additional JS/JSX hooks

## Running the App
The "Start application" workflow runs `python3 server.py` which serves the static files on port 5000.

## Firebase Configuration
Firebase is configured with a public web API key (this is intentional — Firebase web API keys are restricted via Firebase Security Rules, not kept secret). The game uses:
- `understate-62919` Firebase project
- Europe West 1 Realtime Database
- Firestore for game state

## User Preferences
- The app is in Turkish (tr)
- Multiplayer game — all players share the same Firebase backend
- Mobile-first design (Apple/Android PWA-capable)
