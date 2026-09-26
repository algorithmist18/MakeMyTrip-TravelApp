# TripCanvas by MakeMyTrip

A collaborative trip planner styled after MakeMyTrip's own holiday-package flow — image gallery,
day-plan rail, tabbed itinerary/reviews/disruptions, sticky price panel — plus a Strava-style
"Wrapped" that turns your confirmed trips into a shareable year-in-travel recap.

## What's in here

1. **Collaborative itinerary builder, styled like an MMT holiday package** — create a trip, pick a
   destination, and build a day-by-day itinerary with friends in real time. The trip page mirrors
   MakeMyTrip's own package-detail flow: an image gallery header, a title row with duration/Flexi
   Plan tags, a tabbed layout (Itinerary / Local Intel & Reviews / Disruptions), a left "Day Plan"
   rail for jumping between days, and a sticky right-hand price panel (with a mock coupon) next to
   a large live Google Map (480×600 on desktop). Numbered pins trace the route between your
   itinerary places; every add, remove, and reorder is broadcast over a WebSocket to everyone else
   viewing the trip.
2. **Six travel styles that actually reshape the trip** — Luxury, Chill, Romantic, Family,
   Cost-saving, and Backpacking each carry their own daily spend estimate, suggested pace (e.g.
   "1–2 stops/day" for Chill vs. "3–4 stops/day" for Backpacking), and target place count, all
   defined in `frontend/src/constants/travelStyles.ts`.
3. **Hotels you can actually add to the trip** — suggested hotels are sorted by how well their
   price tier (budget/mid/luxury) matches your travel style, then by distance from the trip's
   destination center (best-tier matches flagged "Best match"). "+ Add to trip" attaches a hotel to
   the trip (a `TripHotel` join row) and drops a distinct blue pin for it on the map alongside your
   itinerary's numbered red pins — so your accommodation is visible next to your day-by-day stops.
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
7. **Verified reviews + local intelligence** — the "Local Intel & Reviews" tab shows destination-level
   insider tips (transport, money, customs, safety, weather, connectivity) plus verified-traveler
   reviews (rating, trip type, month visited, helpful count) for every place in your itinerary.
8. **Agentic disruption simulator** — the "Disruptions" tab lets you simulate a flight delay, a hotel
   overbooking, or a rental car falling through, and shows a step-by-step plan of what an AI trip
   agent would do about it — some steps auto-resolved, others flagged for your approval or as
   at-risk — including pulling a real same-tier backup hotel from the destination's own catalog.
   This is a rule-based simulation for demonstrating the UX, not a live agent wired to real bookings.

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
concurrently. Open the frontend URL and start creating a trip right away — there's no login or
signup form. On first load the app silently calls `POST /auth/guest`, which creates a real `User`
row with a randomly generated name/email and hands the browser a JWT, exactly as if they'd signed
up; it's just stored automatically instead of asked for. That identity persists in `localStorage`
across reloads, and the "New session" button in the navbar drops it and mints a fresh one.

To try real-time collaboration, open a second browser/profile (so it gets its own guest identity),
invite that guest's email as a collaborator from the trip planner's "Bring your people" card, and
open the same trip in both windows — added/removed/reordered places sync live. (A guest's email is
auto-generated and not shown in the UI; this flow is really meant for testing collaboration
locally, not for real invites — see the note below.)

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

All routes are under `/api` and (except `/auth/guest`, `/auth/signup` and `/auth/login`) require an
`Authorization: Bearer <token>` header.

- `POST /auth/guest` — creates an anonymous `User` + token with no form, used automatically on
  first load; `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` still exist for a real
  account, they're just not wired into any UI right now
- `GET /trips`, `POST /trips`, `GET /trips/:id`, `PATCH /trips/:id`
- `POST /trips/:id/collaborators` — invite an existing user by email
- `POST /trips/:id/places`, `DELETE /trips/:id/places/:tripPlaceId`,
  `PATCH /trips/:id/places/reorder`
- `POST /trips/:id/hotels` — `{ hotelId }`, attaches a hotel to the trip (shows up on the map);
  `DELETE /trips/:id/hotels/:tripHotelId`
- `POST /trips/:id/complete` — `{ didYouDoIt: boolean, visitedTripPlaceIds?: string[], extraActivities?: string[] }`
- `GET /places?destination=bangkok` — curated place catalog per destination
- `GET /hotels?destination=bangkok` — curated hotel catalog (budget/mid/luxury) per destination
- `GET /live-hotels/status` — whether Booking.com Demand API credentials are configured
- `GET /live-hotels/availability?accommodationIds=1,2&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD` — live
  pricing via Booking.com (503 if not configured; see below)
- `GET /places/:id/reviews` — verified reviews for a place
- `GET /local-intel?destination=bangkok` — insider tips for a destination
- `GET /trips/:id/disruptions` — a trip's simulated disruptions and their action plans
- `POST /trips/:id/disruptions/simulate` — `{ scenarioType: "flight_delay"|"hotel_overbooked"|"car_unavailable", delayHours? }`
- `POST /trips/:id/disruptions/:disruptionId/apply` / `.../dismiss`
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

## Reviews, local intel, and the disruption agent

- **Reviews** are generated deterministically in `backend/prisma/seed.ts` (`generateReviews`) from a
  small pool of reviewer names, trip types, and review templates, hashed by place name so re-seeding
  is reproducible rather than random. Add real reviews the same way, or replace the generator with
  hand-written ones per place.
- **Local intel** tips are hand-written per destination in the `localIntel` array in the same seed
  file — add more by giving each a `destination`, `category` (`weather`/`money`/`transport`/`custom`/
  `safety`/`connectivity`), `title`, and `tip`.
- **Disruptions** are computed live, not seeded — `backend/src/services/disruptionService.ts` holds
  the rule-based logic for each scenario (`flight_delay`, `hotel_overbooked`, `car_unavailable`).
  Each simulation is persisted as a `Disruption` + its `DisruptionAction`s so the plan survives a
  page reload. To add a new scenario, extend `ScenarioType`, add a branch in `simulateDisruption()`,
  and add it to `SCENARIOS` in `frontend/src/components/DisruptionsTab.tsx`.

## Adding more travel styles

Travel styles are defined in one place: `frontend/src/constants/travelStyles.ts`. Each entry sets
its icon/title/subtitle, daily-spend note, suggested pace, target place count, and hotel-tier
preference order. Add a new style there, then add the same key to `TRAVEL_STYLES` in
`backend/src/routes/trips.ts` (the zod validator) and to `PER_PERSON_DAILY_SPEND` in
`backend/src/services/tripService.ts` (the spend estimate).
