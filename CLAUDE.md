# CLAUDE.md — Chasse

This file provides guidance to Claude Code when working in this repository.

## Project Purpose

**Chasse** is an **offline-first hunting dashboard** (tableau de bord hors-ligne) for Quebec hunters. It is a single-page PWA that works without internet, storing all data in `localStorage`. It covers everything needed before and during a hunting trip: permits, gear, menus, journal, zones, ballistics, and more.

## Dépôt

- GitHub : https://github.com/jeffze/chasse
- Branche principale : `main`

## Running the Project

No build step. Serve over HTTP (required for the Service Worker):

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Then open `http://localhost:8080/chasse.html`.

The app also installs as a PWA (manifest + service worker for full offline support).

## Files

| File | Role |
|------|------|
| `chasse.html` | The entire app — all logic, styles, and HTML inline (single file) |
| `Chassetest.html` | Development/test version of the same app |
| `zones.json` | Quebec hunting zone data: species, seasons, dates per zone |
| `sw.js` | Service Worker — caches `chasse.html` for offline use |
| `manifest.webmanifest` | PWA manifest (standalone display, dark theme) |

## Architecture

**Single-file SPA** — everything is inline in `chasse.html`. No framework, no build step, no external dependencies (except browser APIs).

### Tab System

Navigation is tab-based. Tabs are defined in the `TABS` array and rendered by `buildTabs()`:

| Tab ID | Label | Purpose |
|--------|-------|---------|
| `jour` | Jour & soleil | Current day info, sunrise/sunset |
| `check` | Checklist du Jour | Daily gear checklist by module |
| `pack` | Blocs d'Équipement | Reusable equipment pack lists |
| `menus` | Menus | Meal planning for the trip |
| `journal` | Journal | Hunt log entries |
| `zones` | Zones | Quebec hunting zone seasons and rules |
| `balistique` | Balistique | Ballistics calculator |
| `permis` | Permis | Hunting permit management |
| `guide` | Guide | Reference guide |
| `aide` | Aide | Help / documentation |

### Data Persistence

All data lives in `localStorage` via a thin `store` wrapper:
```js
store.get(key, default)  // JSON.parse with fallback
store.set(key, value)    // JSON.stringify
```

Key storage keys: `chasseJournal`, `waypoints`, `chasseCamp`, `PERMIS_KEY`, `PACK_LISTS_KEY`, `PLANS_KEY`, plus individual fields (`lat`, `lng`, `date`, `notes`, `declinaison`).

### Import / Export

The app supports per-section JSON export/import and a full backup (`downloadFullBackup()`). Export functions: `exportAllPermis()`, `exportWaypoints()`, `exportCurrentPackList()`, `exportCurrentMenuPlan()`. Import counterparts: `importAllPermis()`, `importWaypoints()`, `importPackList()`, `importMenuPlan()`.

### Zone Data

`zones.json` contains seasons per zone (1, 2, 27 Ouest) for Orignal, Chevreuil, Ours Noir, Dindon Sauvage by weapon type. `STATIC_ZONES_SUMMARY` in the HTML contains an extended static dataset for zones like 6, used by `renderStaticZoneInfo()` and `displayZoneInfo()`.

## Key Functions

- `buildTabs()` — renders the tab bar and wires click handlers
- `renderStaticZoneInfo(zoneKey)` — renders zone season info from static data
- `renderPermisList()` / `openPermisModal()` / `savePermisForm()` — permit CRUD
- `calculerTrajectoire()` — ballistics calculation
- `fetchWeather()` — fetches weather for the camp coordinates
- `loadJournal()` / `saveJournal()` — hunt log persistence
- `downloadFullBackup()` — exports all localStorage data as JSON
- `toggleNightMode()` — UI night mode toggle
- `showToast(message, type)` — ephemeral toast notifications

## Important Notes

- **No network required** after first load — all features work offline
- Dates in `zones.json` reflect Quebec 2025 hunting seasons; update annually
- `Chassetest.html` is a scratch pad — do not treat it as the source of truth; `chasse.html` is canonical
