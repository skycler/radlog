# 2. CI/CD Pipeline

**Date:** 2026-05-26
**Status:** Accepted

## Context

We need automated checks on PRs and a deployment strategy for Radlog.

## Decision

### CI (GitHub Actions)
- **Trigger:** On PR to `main` and push to `main`.
- **Steps:** Install deps, lint, type check, build.
- No tests yet — will add when we have testable logic (issue backlog).

### CD (Vercel)
- Vercel auto-deploys on push to `main` (connected via Vercel GitHub integration).
- Preview deployments on PRs are handled by Vercel automatically.
- No custom deploy workflow needed.

### Supabase
- Supabase GitHub integration handles preview branches for PRs that touch `supabase/`.
- Production migrations are applied manually via `supabase db push` or the dashboard for now.
- Will revisit automated migration deployment when we have staging/production environments.

### Testing
- No test framework chosen yet. Will decide when we add tests (likely Vitest for unit tests).
- E2E testing deferred to post-v1.

## Consequences

- Every PR is lint-checked, type-checked, and build-verified before merge.
- Deployment is zero-config via Vercel.
- Supabase migrations require manual application to production — acceptable for a solo project.
