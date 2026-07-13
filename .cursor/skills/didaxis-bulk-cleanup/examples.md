# Bulk Cleanup Examples

## User request → dry run first

User: "Delete all programs from Didaxis test environment"

Agent workflow:

1. Confirm they want **all** programs removed (not only test-created ones).
2. Run dry run:

```bash
node scripts/delete-all-programs.mjs
```

3. Show output, e.g.:

```
Found 12 programs (dry run — no deletions performed):
  a1b2c3d4-...  Web Development 2026-1718234567890
  e5f6g7h8-...  QA Automation Program
  ...
```

4. Ask for explicit confirmation before running `--confirm`.

## User request → confirmed deletion

User: "Yes, delete all of them"

```bash
node scripts/delete-all-programs.mjs --confirm
```

Report summary from script output:

```
Deleted: 12
Failed: 0
```

## Use per-test cleanup instead

User: "Add Playwright tests for DS-1 program creation"

Do **not** run bulk cleanup. Use [playwright-test-cleanup](../playwright-test-cleanup/SKILL.md):

```typescript
import { test, expect } from "../fixtures/cleanup.fixture";

test("creates a program", async ({ page, trackProgram }) => {
  const response = await waitForProgramCreateResponse(page);
  await createProgram(page, name, description);
  trackProgram(await programIdFromCreateResponse(response));
});
```

## Auth failure

If the script exits with a login or token error:

1. Stop — do not retry with hardcoded credentials.
2. Ask the user to verify `.env` has `DIDAXIS_API_TOKEN` or `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD`.
3. Re-run dry run after credentials are fixed.
