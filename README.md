# TripTogether

A collaborative trip planner in the spirit of MakeMyTrip/Wanderlog, plus a Strava-style "Wrapped"
that turns your confirmed trips into a shareable year-in-travel recap.

## What's in here

1. **Collaborative itinerary builder** — create a trip, pick a destination, and build a day-by-day
   itinerary with friends in real time. A live Google Map shows numbered stops and the route
   between them, mirroring the MakeMyTrip-style planner UI (travel-style selector, place cards,
   "hidden gems" section, smart daily spend estimate, invite-collaborators card). Every add,
   remove, and reorder is broadcast over a WebSocket to everyone else viewing the trip.
2. **Six travel styles that actually reshape the trip** — Luxury, Chill, Romantic, Family,
   Cost-saving, and Backpacking each carry their own daily spend estimate, suggested pace (e.g.
   "1–2 stops/day" for Chill vs. "3–4 stops/day" for Backpacking), and target place count, all
   defined in `frontend/src/constants/travelStyles.ts`.
3. **Nearby hotel suggestions** — each trip's planner shows hotels for that destination, sorted by
   how well their price tier (budget/mid/luxury) matches the selected travel style, then by
   distance from the trip's destination center; the best-tier matches are flagged "Best match".
4. **Post-trip "Did you do it?" + Wrapped** — once a trip's end date passes, the app asks whether
   it actually happened. Confirmed trips roll up into a `/wrapped` page for the year: stat tiles
   (trips completed, cities visited, days traveled, top travel style), a circuit map connecting
   your destinations in chronological order, and a downloadable shareable recap card (PNG),
   Strava "Year in Sport"-style.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS, React Router, `@react-google-maps/api`,
  `socket.io-client`.
- **Backend**: Node.js + Express + TypeScript, Prisma ORM over SQLite (zero external infra to set
  up), `socket.io` for real-time collaboration, JWT auth (bcrypt password hashing).

## Project layout

```
backend/    Express API + Socket.io server + Prisma schema/migrations/seed
frontend/   Vite + React app
```

## Getting started

### 1. Install dependencies (npm workspaces, from repo root)

```bash
npm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and set `VITE_GOOGLE_MAPS_API_KEY` to a Google Maps JavaScript API key
(enable the "Maps JavaScript API"). Without a key, the app still runs — the map panel falls back
to a numbered list of stops instead of the interactive map.

Edit `backend/.env` and set `JWT_SECRET` to any long random string.

### 3. Set up the database

```bash
npm run db:migrate --workspace backend   # creates backend/prisma/dev.db and applies the schema
npm run seed --workspace backend         # seeds curated places for Bangkok, Goa, and Manali
```

### 4. Run the app

```bash
npm run dev
```

This runs the backend on `http://localhost:4000` and the frontend on `http://localhost:5173`
concurrently. Open the frontend URL, sign up, and create a trip.

To try real-time collaboration, sign up a second account in another browser/profile, invite that
email as a collaborator from the trip planner's "Bring your people" card, and open the same trip
in both windows — added/removed/reordered places sync live.

## How the "Wrapped" flow works

- A trip stays `planning` until its `endDate` passes.
- Once passed, the next time the trip owner or a collaborator loads the dashboard or the trip
  itself, a "Did you go on this trip?" prompt appears.
- Answering **Yes** marks the trip `completed` with a `completedAt` timestamp; **No** marks it
  `not-completed`. Either way it won't be asked again.
- `/wrapped` aggregates all of a user's `completed` trips for a chosen year: trip/city/day counts,
  most-used travel style, a chronological circuit (polyline across destinations on the map), and a
  one-click PNG export people can post elsewhere.

## API overview

All routes are under `/api` and (except `/auth/signup` and `/auth/login`) require an
`Authorization: Bearer <token>` header.

- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`
- `GET /trips`, `POST /trips`, `GET /trips/:id`, `PATCH /trips/:id`
- `POST /trips/:id/collaborators` — invite an existing user by email
- `POST /trips/:id/places`, `DELETE /trips/:id/places/:tripPlaceId`,
  `PATCH /trips/:id/places/reorder`
- `POST /trips/:id/complete` — `{ didYouDoIt: boolean }`
- `GET /places?destination=bangkok` — curated place catalog per destination
- `GET /hotels?destination=bangkok` — curated hotel catalog (budget/mid/luxury) per destination
- `GET /wrapped` — years that have confirmed trips; `GET /wrapped/:year` — full recap for a year

Socket.io events: client emits `join_trip` / `leave_trip` with a trip id; server broadcasts
`trip_updated` (full trip payload) to everyone in that trip's room after any mutation, and
`collaborator_presence` when someone joins.

## Adding more destinations

Seed data lives in `backend/prisma/seed.ts` (`places` and `hotels` arrays). Add entries with a
`destination` key (lowercase, matches what `CreateTripModal` sends) plus real lat/lng, and re-run
`npm run seed --workspace backend`. Also add the destination to
`frontend/src/components/CreateTripModal.tsx`'s `DESTINATIONS` list so it's selectable when
creating a trip. A hotel entry needs a `tier` of `"budget"`, `"mid"`, or `"luxury"` — this is what
the trip planner sorts against each travel style's preferred tier order.

## Adding more travel styles

Travel styles are defined in one place: `frontend/src/constants/travelStyles.ts`. Each entry sets
its icon/title/subtitle, daily-spend note, suggested pace, target place count, and hotel-tier
preference order. Add a new style there, then add the same key to `TRAVEL_STYLES` in
`backend/src/routes/trips.ts` (the zod validator) and to `PER_PERSON_DAILY_SPEND` in
`backend/src/services/tripService.ts` (the spend estimate).
