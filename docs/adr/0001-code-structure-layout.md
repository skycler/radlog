# ADR-0001: Code Structure Layout

## Status

Accepted

## Context

Radlog is a Next.js + Supabase webapp. Before implementation begins, we need to agree on folder structure and code organization conventions so that all subsequent work follows a consistent layout.

Key decisions:
- Next.js App Router (not Pages Router) — the current recommended approach
- Feature-based organization — code grouped by domain concept (rides, bikes, auth) rather than by technical role (components, hooks, types)

## Decision

### Folder structure

```
radlog/
├── supabase/                   # Supabase CLI: migrations, seed, config
│   ├── config.toml
│   ├── migrations/
│   └── seed.sql
├── src/
│   ├── app/                    # App Router: routes & layouts (thin layer)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── signup/
│   │   ├── rides/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   ├── bikes/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── edit/
│   │   │       └── maintenance/
│   │   └── ...
│   ├── features/               # Domain features
│   │   ├── rides/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types.ts
│   │   │   └── actions.ts     # Server actions
│   │   ├── bikes/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types.ts
│   │   │   └── actions.ts
│   │   └── auth/
│   │       ├── components/
│   │       └── hooks/
│   ├── components/
│   │   └── ui/                 # Shared UI (buttons, inputs, modals, etc.)
│   ├── lib/
│   │   ├── supabase/           # Supabase client setup (server + client)
│   │   └── utils.ts
│   └── types/
│       └── database.ts         # Generated Supabase types
├── AGENTS.md
├── CONTEXT.md
├── README.md
└── docs/
    ├── adr/
    └── agents/
```

### Conventions

- **Route files in `app/`** are thin — they import and compose from `features/`.
- **Server actions** (in `features/*/actions.ts`) handle mutations (create, update, delete). No API routes.
- **Supabase clients** in `lib/supabase/` — separate files for server components and client components, using `@supabase/ssr`.
- **Generated types** from Supabase schema live in `types/database.ts`, generated via `supabase gen types typescript`.
- **Shared UI components** in `components/ui/` — only for truly generic, reusable components (buttons, inputs, modals). Domain-specific components belong in their feature folder.

### Naming conventions

- Files and folders: `kebab-case`
- React components: `PascalCase`
- Functions and variables: `camelCase`
- Types and interfaces: `PascalCase`

## Consequences

- New features follow the `features/<domain>/` pattern. Adding a new domain concept means creating a new feature folder.
- Route files stay small — they're wiring, not logic.
- Supabase migrations are versioned in `supabase/migrations/` and tracked in git.
