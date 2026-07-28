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

The **Playwright Tests** workflow needs these repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Required |
|--------|----------|
| `DIDAXIS_EMAIL` | Yes |
| `DIDAXIS_PASSWORD` | Yes |
| `DIDAXIS_URL` | No (defaults to test environment) |
| `DIDAXIS_NONADMIN_EMAIL` | No |
| `DIDAXIS_NONADMIN_PASSWORD` | No |

If admin credentials are missing, CI fails immediately with a clear error before tests run.
