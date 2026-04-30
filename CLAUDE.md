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
- Dates in `zones.json` reflect Quebec **2026** hunting seasons (règlement en vigueur 2026-04-01 au 2028-03-31) ; update annually
- `Chassetest.html` is a scratch pad — do not treat it as the source of truth; `chasse.html` is canonical

---

# Vision commerciale (draft 2026-04-22)

## Objectif

Transformer Chasse en **SaaS multi-pays, multilingue, sur abonnement mensuel/annuel**. Cible initiale : chasseurs Québec → Canada → USA → Europe.

## Marché adressable

| Pays | Chasseurs | Marché potentiel (1% conversion) |
|---|---|---|
| Canada | ~1,3 M | 13 000 |
| USA | ~15 M | 150 000 |
| France | ~1 M | 10 000 |
| Belgique / Suisse / Espagne | ~1 M | 10 000 |
| **Total adressable** | **~18 M** | **~180 000 abonnés potentiels** |

**Concurrents** : OnX Hunt (30–100 USD/an), HuntStand (~70 USD/an), HuntWise, GoWild. Marché mature, éduqué aux abonnements.

## Structure 3 paliers

### Gratuit (acquisition)
- 1 pays/région au choix
- Checklist, menus basiques, journal simple
- Zones en consultation seule
- Pas de sync, pas de carte offline
- Pub discrète

### Premium — 4,99 $/mois ou 39 $/an
- **Tous les pays/régions**
- Sync cross-device
- Téléchargement « Préparer pour le terrain » (zones + météo + règlement)
- Cartes offline (limitées)
- Ballistique avancée avec base munitions
- Journal illimité + stats annuelles
- Permis numériques + rappels expiration
- Sans pub

### Pro — 9,99 $/mois ou 79 $/an
- Tout Premium +
- Cartes offline illimitées (topo, ZECs, zones privées)
- Partage de camp (jusqu'à 6 chasseurs)
- IA photo-identification gibier
- Export fiscal (guides pros + pourvoiries)
- Support prioritaire

### Pricing régional (parité pouvoir d'achat)
- 🇨🇦 CAD 5,99 / 9,99 (Premium / Pro)
- 🇺🇸 USD 4,99 / 9,99
- 🇪🇺 EUR 4,99 / 9,99
- 🇨🇭 CHF 5,50 / 10,99

## Projections (conservateur)

| Année | Abonnés payants | Split P/Pro | Revenu annuel |
|---|---|---|---|
| 1 | 500 | 80/20 | 18 000 $ |
| 2 | 3 000 | 75/25 | 115 000 $ |
| 3 | 10 000 | 70/30 | 405 000 $ |
| 4 | 25 000 | 65/35 | 1,05 M$ |
| 5 | 50 000 | 60/40 | 2,2 M$ |

Hypothèses : churn 15 %/an, conversion free→paid 3 %, ARPU ~47 $/an.

## Go-to-market

**An 1 — Québec (base)** : saisons 2026-2027 en place, groupes FB chasse, YouTube influenceurs, partenariat magasins plein air (LaCordée, Latulippe), sponsoring Salon National du Grand Air.

**An 2 — Canada + USA pilote** : toutes provinces, 5 états pilotes (ME, VT, NH, NY, MT), YouTube outdoor, pourvoiries.

**An 3 — Europe** : France + Belgique + Suisse. Respect des cadres réglementaires locaux (chasse plus encadrée en Europe qu'au QC).

## Différenciateurs vs concurrents

1. Multi-pays natif (OnX = US seulement)
2. Multilingue fr/en/es/de dès v1
3. Ballistique intégrée (rare)
4. Menus + repas en camp (unique)
5. Journal + IA photo
6. Prix accessible (39 $/an vs 100 $/an OnX élite)
7. Respect cultures/règlements locaux

## Architecture technique — roadmap

### Phase 1 — PWA robuste (6 mois)
- Migration `localStorage` → **IndexedDB** (multi-Go, binaire, async)
- Bouton **« Préparer pour le terrain »** : download agressif (zones, météo, règlement, tuiles carto) dans IndexedDB avec barre de progression
- Backend **Flask/FastAPI + Postgres + Stripe** sur VPS Hostinger (même pattern que projet compta)
- Auth JWT longue durée (fonctionne offline une fois obtenue)
- Sync différée : queue locale des modifications → push au retour du réseau
- Admin CMS pour zones/saisons par pays (éviter hardcode)
- i18n via fichiers JSON (`locales/fr.json`, `en.json`, `es.json`, `de.json`)

### Phase 2 — Wrapper Capacitor pour stores (3 mois)
- Même code PWA packagé iOS + Android via Capacitor
- Présence App Store + Play Store
- Stripe sur web + Apple IAP (requis sur iOS, 30 % commission)
- Stratégie auth : création compte via web (Stripe direct), login dans l'app

### Phase 3 — App native (optionnel, an 2-3)
- React Native si volumes justifient
- SQLite offline (meilleur que IndexedDB pour grosses bases)
- Cartes natives (MapKit iOS, Mapbox SDK)
- Notifications push riches
- GPS arrière-plan pour tracking live

## Offline-first — stratégie

L'utilisateur part à la chasse sans internet. Il doit avoir :

1. **Avant départ** : clic sur « Préparer » → télécharge tout ce qui concerne le voyage (zones, règlement, météo 7j, tuiles carto, lunaison, heures or)
2. **Pendant** : fonctionne 100 % offline, écrit dans IndexedDB
3. **Au retour** : sync automatique des journaux/waypoints/photos vers backend

Stockage local :
- `localStorage` — config légère (préférences UI)
- `IndexedDB` — tout le reste (zones, journal, waypoints, photos, tuiles carto)
- `Service Worker` — cache agressif des assets statiques

## Déploiement actuel

### Flux principal — cPanel Git Deploy (WHC) — depuis 2026-04-30

- Dev local : `D:/Chasse/` → repo `jeffze/chasse` (GitHub)
- WHC cPanel a un repo git cloné dans `/home/labelle1/repos/chasse`
- À chaque déploiement, le `.cpanel.yml` (à la racine du repo) copie `chasse.html`, `sw.js`, `manifest.webmanifest`, `zones.json` vers `/home/labelle1/public_html/Chasse/` (servi sur `https://www.strategief.com/Chasse/`)

Procédure :
```powershell
# 1. Push depuis le local
cd D:\Chasse ; git push

# 2. cPanel WHC → Git Version Control → Manage (chasse)
#    → Pull or Deploy → Update from Remote → Deploy HEAD Commit
```

Le déploiement n'est pas automatique au push : il faut cliquer dans cPanel. Un webhook GitHub → cPanel pourrait l'automatiser (à faire si besoin).

Pour ajouter un fichier à la liste déployée : éditer `.cpanel.yml` à la racine du repo.

### Flux historique — FTP via henribot89109 (fallback / data only)

Conservé comme alternative si le git-deploy cPanel est indispo :

- `D:/chasse-prod/` — assets à déployer (zones.json) → repo `henribot89109/chasse-prod`
- Agent avec `hbot89109@gmail.com` a accès à `henribot89109` uniquement → upload FTP vers `https://www.strategief.com/Chasse/`
- Remote `agent-full` sur `D:/Chasse/` pour push refonte complète vers `henribot89109/chasse` (rare, sur demande explicite)

```powershell
# Push data via le repo séparé
cd D:\chasse-prod ; git add zones.json ; git commit -m "..." ; git push

# Refonte complète partagée avec l'agent FTP
cd D:\Chasse ; git push origin ; git push agent-full
```

## Étapes immédiates (2-4 semaines)

1. Choisir nom commercial (Chasse est générique — idées : HuntReady, ChasseTrack, Traque, BoussoleChasse, etc.)
2. Enregistrer domaine + marque
3. ~~Migration `localStorage` → `IndexedDB`~~ ✅ livrée 2026-04-30 (commit 816faca)
4. Prototype backend minimal (auth + sync) sur VPS existant
5. Implémenter « Préparer pour le terrain »
