# ai-assisted-qa-automation-2

Playwright end-to-end tests and AI-assisted QA tooling for Didaxis Studio.

## Install

```bash
npm ci
npx playwright install
```

## Environment

Copy the example file and fill in real values (never commit `.env`):

```bash
cp .env.example .env   # Windows: copy .env.example .env
```

See [`.env.example`](.env.example) for placeholders and comments on each variable.

**Run tests** — required for `npx playwright test`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DIDAXIS_URL` | Yes | App base URL (defaults to `https://test.didaxis.studio` in helpers if unset) |
| `DIDAXIS_EMAIL` | Yes | Admin login for auth setup |
| `DIDAXIS_PASSWORD` | Yes | Admin password |
| `DIDAXIS_API_TOKEN` | Yes* | Bearer token for API program cleanup |
| `DIDAXIS_ALT_EMAIL` | No | Alt account for permission-probe specs |
| `DIDAXIS_ALT_PASSWORD` | No | Password for the alt account |

\*Cleanup uses `DIDAXIS_API_TOKEN` when set; otherwise it logs in with admin credentials. `DIDAXIS_NONADMIN_*` is still accepted as an alias for the alt account.

**Agent / CI** — not needed to run tests locally; used by [`.github/workflows/test-generation.yml`](.github/workflows/test-generation.yml) and Cursor MCP:

| Variable | Purpose |
|----------|---------|
| `CURSOR_API_KEY` | Headless Cursor agent in test-generation workflow |
| `ATLASSIAN_API_TOKEN` | Jira / Confluence MCP |
| `ATLASSIAN_BASE_URL` | Atlassian site URL |
| `ATLASSIAN_EMAIL` | Email for the Atlassian token |

Store agent secrets in GitHub Actions secrets and in **Cursor → Settings → MCP** for local agent work — not in `.env` unless you run the generation workflow locally.

## Run tests

Full suite (uses `storageState` from `tests/auth.setup.ts`):

```bash
npx playwright test
```

Other useful commands:

```bash
npm run test:ui       # Playwright UI mode
npm run test:headed   # Headed browser
npx playwright show-report   # Open last HTML report (after CI or local HTML reporter)
```

## Run a tagged slice

Each test has **exactly one** suite tag: `@smoke`, `@sanity`, `@regression`, `@api`, `@e2e`, or `@destructive`. Tags live on individual tests, not on `describe`. Self-cleaning CRUD tests keep an importance tag; `@destructive` is reserved for shared/global state (locale, roles, flags) and runs serially with revert hooks.

```bash
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api
npm run test:e2e
npm run test:destructive   # --workers=1
```

Equivalent Playwright invocations: `npx playwright test --grep @smoke`, etc.

## `.cursor/` — agents, skills, hooks

This repo ships Cursor rules and subagents for AI-assisted test generation and failure handling:

| Path | Role |
|------|------|
| [`.cursor/rules/constitution.mdc`](.cursor/rules/constitution.mdc) | Always-on MUST / SHOULD / WON'T guardrails |
| [`.cursor/rules/qa-orchestrator.mdc`](.cursor/rules/qa-orchestrator.mdc) | Routes tickets → plan → test-writer → run → triage |
| [`.cursor/agents/`](.cursor/agents/) | `test-writer`, `triage`, `bug-reporter` subagents |
| [`.cursor/skills/`](.cursor/skills/) | Gherkin planning, POM conventions, self-heal, a11y, cleanup, etc. |
| [`.cursor/hooks.json`](.cursor/hooks.json) | Post-edit guards (`constitution-guard`, `generation-gate`) on `tests/**` and `pages/**` |

Open the project in Cursor; rules apply automatically. Enable the Atlassian MCP server in Cursor settings for Jira-backed workflows. Hooks reload when `hooks.json` is saved (restart Cursor if they do not appear under **Settings → Hooks**).

## CI

- **E2E Tests** — [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml): runs `npx playwright test` on push, PR, schedule, and manual dispatch.
- **Test Generation** — [`.github/workflows/test-generation.yml`](.github/workflows/test-generation.yml): headless agent backlog; needs `CURSOR_API_KEY` and Atlassian secrets in addition to Didaxis credentials.
