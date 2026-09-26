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
4. **Post-trip check-in + shareable circuit** — once a trip's end date passes, the app asks: did
   you go? If yes, it shows a checklist of everything that was planned (uncheck what you skipped)
   plus a free-text "anything else you did?" box for unplanned stops. That builds a per-trip
   Strava-style "circuit" card — a route line connecting your actual visited places, numbered in
   order, with your extra memories listed — downloadable as a PNG to share anywhere. It's
   reachable again anytime afterward from a "View & share circuit" button on a completed trip.
5. **Wrapped** — confirmed trips roll up into a `/wrapped` page for the year: stat tiles (trips
   completed, cities visited, days traveled, top travel style), a circuit map connecting your
   destinations in chronological order, and a downloadable shareable recap card (PNG), Strava
   "Year in Sport"-style.
6. **Live hotel prices (Booking.com Demand API — optional)** — a "Live Booking.com prices" card on
   the trip planner shows a clear "Not connected" state until you have real Booking.com Partner
   Centre credentials; see [Live pricing (Booking.com)](#live-pricing-bookingcom) below before
   expecting this to work out of the box.

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
npm run seed --workspace backend         # seeds curated places for 7 destinations (see below)
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

## How the completion + circuit flow works

- A trip stays `planning` until its `endDate` passes.
- Once passed, the next time the trip owner or a collaborator loads the dashboard or the trip
  itself, a "Did you go on this trip?" prompt appears.
- **No** marks the trip `not-completed` immediately; it won't be asked again.
- **Yes** moves to a checklist of the planned itinerary (each place defaults to checked/visited,
  toggle off anything skipped) plus a field to add unplanned activities. Submitting marks the trip
  `completed`, sets each `TripPlace.visited` flag accordingly, and creates an `ExtraActivity` row
  per typed-in extra — then immediately shows the resulting circuit card.
- The circuit card (`TripCircuitCard`) draws a route line connecting the visited places' real
  lat/lng (normalized to fit the card, via `utils/circuit.ts`), numbered in visit order, with
  stats and a list of stops/extras. "Download to share" renders the same thing at high resolution
  on a `<canvas>` and saves it as a PNG — no backend hosting needed, just an image you can post
  anywhere. A completed trip's planner page keeps a "View & share circuit" button to reopen it.
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
- `POST /trips/:id/complete` — `{ didYouDoIt: boolean, visitedTripPlaceIds?: string[], extraActivities?: string[] }`
- `GET /places?destination=bangkok` — curated place catalog per destination
- `GET /hotels?destination=bangkok` — curated hotel catalog (budget/mid/luxury) per destination
- `GET /live-hotels/status` — whether Booking.com Demand API credentials are configured
- `GET /live-hotels/availability?accommodationIds=1,2&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD` — live
  pricing via Booking.com (503 if not configured; see below)
- `GET /wrapped` — years that have confirmed trips; `GET /wrapped/:year` — full recap for a year

Socket.io events: client emits `join_trip` / `leave_trip` with a trip id; server broadcasts
`trip_updated` (full trip payload) to everyone in that trip's room after any mutation, and
`collaborator_presence` when someone joins.

## Destinations

Seeded destinations, grouped by country in the create-trip picker:

- **Thailand**: Bangkok, Phuket, Chiang Mai, Pattaya, Krabi
- **India**: Goa, Manali

## Adding more destinations

Seed data lives in `backend/prisma/seed.ts` (`places` and `hotels` arrays). Add entries with a
`destination` key (lowercase, hyphenated for multi-word names — this is what `CreateTripModal`
sends) plus real lat/lng, and re-run `npm run seed --workspace backend`. Also add the destination
to `DESTINATIONS` in `frontend/src/constants/destinations.ts` (key, label, country, lat/lng) so
it's selectable when creating a trip and displays correctly everywhere (trip cards, Wrapped,
the planner header) — `destinationLabel()`/`destinationFullLabel()` from that file are what those
screens use instead of the raw key. A hotel entry needs a `tier` of `"budget"`, `"mid"`, or
`"luxury"` — this is what the trip planner sorts against each travel style's preferred tier order.

## Live pricing (Booking.com)

The "Live Booking.com prices" card (`frontend/src/components/LiveHotelPrices.tsx`) calls
`backend/src/services/bookingService.ts`, which wraps Booking.com's Demand API
`POST /accommodations/availability`. Before it can do anything useful:

1. **It's not self-serve.** Booking.com's Demand API requires becoming a Managed Affiliate Partner
   — a signed contract, an assigned Account Manager, and Partner Centre-issued credentials (an API
   bearer token and an affiliate ID) — for sandbox access, let alone production.
2. **Check Booking's partner terms before using AI tooling here.** Booking's General Partner Terms
   have required prior written approval from Booking.com before AI systems can be used to build
   against their APIs. Get that sign-off (or confirm your contract's current terms) before treating
   this integration as something to extend with AI assistance.
3. **The request/response shape here is a best-effort reconstruction**, not verified against live
   docs — `developers.booking.com` was unreachable from the environment this was built in. The
   fields used (`accommodation.ids`, `booker.country`/`booker.platform`, `checkin`/`checkout`,
   `guests.number_of_adults`/`number_of_rooms`, an `extras` array) come from public documentation
   summaries. Once you have real Partner Centre access, verify field names and
   `BOOKING_API_BASE_URL` against your own docs/Postman collection and adjust
   `bookingService.ts` accordingly.

To enable it once you have credentials, set in `backend/.env`:

```
BOOKING_API_BASE_URL="https://demandapi.booking.com/3.1"   # verify against your own docs
BOOKING_API_KEY="<partner-centre-bearer-token>"
BOOKING_AFFILIATE_ID="<your-affiliate-id>"
```

Without these, `GET /live-hotels/status` reports `connected: false` and the frontend card shows a
"Not connected" state with setup instructions instead of erroring — this is the expected state for
almost everyone running this project.

## Adding more travel styles

Travel styles are defined in one place: `frontend/src/constants/travelStyles.ts`. Each entry sets
its icon/title/subtitle, daily-spend note, suggested pace, target place count, and hotel-tier
preference order. Add a new style there, then add the same key to `TRAVEL_STYLES` in
`backend/src/routes/trips.ts` (the zod validator) and to `PER_PERSON_DAILY_SPEND` in
`backend/src/services/tripService.ts` (the spend estimate).
