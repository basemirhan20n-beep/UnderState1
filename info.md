# UNDERSTATE - City & State Simulation Game

## Project Overview
UNDERSTATE is a Turkish-language browser-based multiplayer city and state simulation game. It's a single-page HTML/JS/CSS application served via a Node.js/Express server with Socket.IO for real-time features. The game features user profiles, dynamic messaging, agriculture/trade mechanics, military hierarchy, parliament simulation, and more.

## Architecture
- **Frontend**: Single-page HTML app (`index.html`) with vanilla JavaScript and React (loaded via CDN), compiled via Babel in-browser
- **Backend storage**: Firebase (Firestore + Realtime Database) for multiplayer game state
- **Server**: Node.js Express server (`server.js`) on port 5000 with Socket.IO for real-time online presence and chat relay
- **Auth**: Custom username/password login stored in Firebase RTDB users collection. Firebase Anonymous Auth is used only for SDK-level permissions.

## Project Structure
- `index.html` — Main game UI and Firebase initialization (715 lines)
- `server.js` — Express + Socket.IO server (port 5000)
- `src/app.js` — Main game React application (compiled via Babel in-browser)
- `js/` — Firebase initialization and real-time sync modules
- `css/styles.css` — Game styles
- `audio/background.mp3` — Background music

## Running the App
The "Start application" workflow runs `node server.js` which serves static files and Socket.IO on port 5000.

## Firebase Configuration
Firebase is configured with a public web API key in `index.html` (intentional — Firebase web API keys are restricted via Firebase Security Rules, not kept secret). The game uses:
- `understate-62919` Firebase project
- Europe West 1 Realtime Database
- Firestore for game state

## User Preferences
- The app is in Turkish (tr)
- Multiplayer game — all players share the same Firebase backend
- Mobile-first design (Apple/Android PWA-capable)
- Dark theme with red accent colors
