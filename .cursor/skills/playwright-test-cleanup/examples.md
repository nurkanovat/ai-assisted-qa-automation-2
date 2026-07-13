# Before / After Patterns

## Wrong: no cleanup

```typescript
import { test, expect } from "@playwright/test";
import { createProgram, programInList } from "./programs.helpers";

test("valid program is saved and shown in the program list", async ({ page }) => {
  const programName = uniqueName("Web Development 2026");
  await createProgram(page, programName, "Full-stack web development");
  await expect(programInList(page, programName)).toBeVisible();
  // Program remains in Didaxis after the test
});
```

## Wrong: manual afterAll / UI teardown

```typescript
import { test, expect } from "@playwright/test";

test.afterAll(async ({ browser }) => {
  // Don't write manual cleanup hooks — and don't delete via the UI
  const page = await browser.newPage();
  await confirmDelete(page, createdProgramName);
});
```

## Correct: track UUID via cleanup fixture

```typescript
import { test, expect } from "../fixtures/cleanup.fixture";
import { createProgram, programInList, uniqueName } from "./programs.helpers";

test("valid program is saved and shown in the program list", async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueName("Web Development 2026");

  const createResponsePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/programs") &&
      res.request().method() === "POST" &&
      res.ok(),
  );

  await createProgram(page, programName, "Full-stack web development");

  const response = await createResponsePromise;
  const body = await response.json();
  trackProgram(body.data.id); // track as soon as the program exists

  await expect(programInList(page, programName)).toBeVisible();
});
```

## Correct: multiple programs in one test

```typescript
import { test, expect } from "../fixtures/cleanup.fixture";

test("renaming to an existing name is allowed", async ({ page, trackProgram }) => {
  const existingId = await createAndCaptureId(page, "Existing Program");
  trackProgram(existingId);

  const targetId = await createAndCaptureId(page, "Target Program");
  trackProgram(targetId);

  // ... edit assertions ...
});
```

Track every UUID the test creates. The fixture deletes only those IDs on teardown.
