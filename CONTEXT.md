# Radlog

## What is Radlog?

A manual ride-logging webapp for passionate cyclists. Radlog is intentionally minimal and personal — the anti-Strava. No auto-sync, no social features, no data overload. Riders manually log their rides as a personal journal.

## Glossary

- **Ride** — a single cycling activity logged by a user. Contains date, distance, elevation gain, bike used, personal note, and maintenance note.
- **Bike** — a bicycle owned by a user. Users maintain a list of their bikes and select one per ride.
- **Personal note** — free-text description of the ride (route, feelings, conditions, etc.).
- **Maintenance note** — notes about equipment condition observed during a ride (e.g. "chain needs replacement", "new tires grip well"). Tied to both the ride and the bike.
- **Maintenance history** — the chronological view of all maintenance notes for a specific bike.
- **Yearly target** — a user-defined distance goal for a given year, with an allowed tolerance (±km) and an optional Gaussian distribution parameter (σ) controlling expected seasonal spread.

## Users

- Target: passionate cycling people who want a simple, personal ride log.
- Multi-user with individual accounts. Each user sees only their own data.
- No social features — no sharing, no followers, no public profiles.

## Ride data model

| Field            | Type       | Required |
| ---------------- | ---------- | -------- |
| Date             | date       | yes      |
| Distance         | number     | yes      |
| Elevation gain   | number     | yes      |
| Bike used        | reference  | yes      |
| Personal note    | text       | no       |
| Maintenance note | text       | no       |

## Core operations (v1)

- Add a ride
- Edit a ride
- Delete a ride
- Filter/search rides (by bike, date range)
- Manage bikes (add, edit, delete)
- View maintenance history per bike

## Explicitly out of scope (v1)

- GPS/device sync (Strava, Garmin, Wahoo, etc.)
- Social features (sharing, followers, feed)
- Dashboards, charts, statistics (deferred — frontend is charting-ready)
- Route mapping
- Training plans
- Leaderboards / gamification

## Tech stack

- **Frontend:** Next.js, TypeScript, React, Tailwind CSS
- **Backend:** Supabase (Postgres database, Auth, Row Level Security)
- **Deployment:** Vercel (custom domain supported)
- **Charting (future):** React ecosystem (Recharts, Visx, D3)

## Architecture

- Supabase handles: database, authentication (email/password), API, row-level security
- Vercel handles: hosting, SSR, frontend serving
- No background jobs, no realtime, no file storage needed for v1
