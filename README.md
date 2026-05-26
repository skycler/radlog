# Radlog

A simple, personal ride journal for passionate cyclists. No auto-sync, no social features, no data overload — just you and your rides.

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, React, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Row Level Security)
- **Deployment:** Vercel

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) (for local Supabase)
- npm

## Local Development Setup

1. **Clone the repo:**

   ```bash
   git clone git@github.com:skycler/radlog.git
   cd radlog
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start local Supabase:**

   ```bash
   npx supabase start
   ```

   This requires Docker to be running. On first run it will pull the Supabase images.

4. **Set up environment variables:**

   ```bash
   cp .env.local.example .env.local
   ```

   Then fill in the values from `npx supabase status`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key from supabase status>
   ```

5. **Run the dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx supabase start` | Start local Supabase |
| `npx supabase stop` | Stop local Supabase |
| `npx supabase db reset` | Reset local DB (re-run migrations + seed) |
| `npx supabase gen types typescript --local > src/types/database.types.ts` | Regenerate DB types |

## Project Structure

See [ADR-0001](docs/adr/0001-code-structure-layout.md) for the full folder structure and conventions. Summary:

```
src/
├── app/            # Next.js App Router (routes, layouts)
├── features/       # Domain features (rides, bikes, auth)
├── components/ui/  # Shared UI components
├── lib/supabase/   # Supabase client setup
└── types/          # Generated database types
supabase/
├── config.toml     # Supabase local config
└── migrations/     # Database migrations
```

## Contributing

- Never commit directly to `main` — create a feature branch and open a PR.
- Branch naming: `<type>/<short-description>` (e.g. `feat/add-auth`, `fix/login-bug`).
- See [CONTEXT.md](CONTEXT.md) for domain terminology and project scope.
