## Git workflow

- NEVER commit directly to `main`. Always create a feature branch and open a PR.
- Branch naming: `<type>/<short-description>` (e.g. `feat/add-auth`, `fix/login-bug`, `chore/update-deps`).
- After successful implementation, push the branch and create a PR to `main` using `gh pr create`.
- Wait for the user to merge — do not merge PRs automatically.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues on `skycler/radlog` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
