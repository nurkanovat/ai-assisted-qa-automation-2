# ai-assisted-qa-automation-2

Playwright end-to-end tests for Didaxis Studio.

## Local setup

1. Copy `.env-example` to `.env` and fill in credentials:

   - `DIDAXIS_URL` — defaults to `https://test.didaxis.studio` if omitted
   - `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` — admin credentials (required)
   - `DIDAXIS_NONADMIN_EMAIL` / `DIDAXIS_NONADMIN_PASSWORD` — optional, for access-denied scenarios

2. Install and run:

   ```bash
   npm ci
   npx playwright install
   npx playwright test
   ```

## GitHub Actions

The **E2E Tests** workflow (`.github/workflows/e2e.yml`) runs on push to `main`, on pull requests, on a daily schedule (10:00 UTC), and on demand via **Run workflow**. It needs these repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Required |
|--------|----------|
| `DIDAXIS_EMAIL` | Yes |
| `DIDAXIS_PASSWORD` | Yes |
| `DIDAXIS_URL` | No (defaults to test environment) |
| `DIDAXIS_API_TOKEN` | No (used for test-data cleanup; login credentials are used if omitted) |
| `DIDAXIS_NONADMIN_EMAIL` | No |
| `DIDAXIS_NONADMIN_PASSWORD` | No |

If admin credentials are missing, CI fails immediately with a clear error before tests run. Failed runs upload a `playwright-report` artifact (retained 7 days).
