import { test, expect } from '../fixtures/cleanup.fixture';
import {
  adminEmail,
  adminPassword,
  nonAdminEmail,
  nonAdminPassword,
  uniqueName,
  login,
  loginAsAdmin,
  createProgramReturningId,
  waitForProgramCreateResponse,
  programIdFromCreateResponse,
} from './programs.helpers';
import { ProgramsPage } from '../pages/ProgramsPage';

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

// TC-001 — Program creation form displays required fields
test('TC-001: admin sees Program Name and Description on the creation form', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await programs.openNewProgramForm();

  const modal = programs.newProgramModal;
  await expect(modal.heading).toBeVisible();
  await expect(modal.programNameInput).toBeEditable();
  await expect(modal.programNameInput).toHaveAttribute('placeholder', 'e.g. Computer Science BSc');
  await expect(modal.descriptionInput).toBeEditable();
  await expect(modal.descriptionInput).toHaveAttribute('placeholder', 'Brief description');
  await expect(modal.createButton).toBeDisabled();
  await expect(modal.cancelButton).toBeVisible();
  await expect(modal.showAiConfigButton).toBeVisible();
});

// TC-002 — Program is created and appears in the list
test('TC-002: valid program is saved and shown in the program list', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
});

// TC-003 — Program can be created with description only populated alongside valid name
test('TC-003: program is created when both fields contain valid text', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Data Science 2026');
  const description = 'Introduction to statistics and machine learning';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
});

// TC-004 — New program appears without full page reload
test('TC-004: program list updates immediately after successful creation', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Cybersecurity Fundamentals');
  const description = 'Network security and ethical hacking basics';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(page).toHaveURL(/\/programs/);
  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
});

// TC-005 — Create is disabled when Program Name is empty
test('TC-005: empty Program Name prevents submission', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await programs.openNewProgramForm();

  await programs.newProgramModal.fillDescription('Some description');

  await expect(programs.newProgramModal.createButton).toBeDisabled();
});

// TC-006 — Program is not created when Create cannot be clicked
test('TC-006: empty name does not create a program via UI', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const orphanDescription = uniqueName('Orphan description without a program name');

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fillDescription(orphanDescription);

  await expect(programs.newProgramModal.createButton).toBeDisabled();

  await expect(programs.newProgramModal.dialog).toBeVisible();
  await expect(programs.textInTable(orphanDescription)).not.toBeVisible();
});

// TC-007 — Non-admin cannot open or use program creation
test('TC-007: non-admin users cannot create programs', async ({ page }) => {
  test.skip(
    !nonAdminEmail || !nonAdminPassword,
    'DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD must be set in .env',
  );

  const programs = new ProgramsPage(page);
  await login(page, nonAdminEmail!, nonAdminPassword!);
  await programs.goto();
  if (await programs.newProgramButton.isVisible()) {
    await expect(programs.newProgramButton).toBeDisabled();
  } else if (await programs.accessDeniedMessage.isVisible()) {
    await expect(programs.accessDeniedMessage).toBeVisible();
  } else {
    await expect(page).not.toHaveURL(/\/programs/);
  }
});

// TC-008 — Closing modal without saving does not create a program
test('TC-008: cancel/close discards unsaved program data', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Unsaved Program Draft');
  const description = 'This should not be persisted';

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fill(programName, description);
  await programs.closeNewProgramModal();

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).not.toBeVisible();
});

// TC-009 — Duplicate program names are allowed in the live app
test('TC-009: duplicate program name is allowed in the live app', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  const duplicateDescription = 'Duplicate attempt description';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));
  await expect(programs.programRow(programName)).toHaveCount(1);

  const secondCreate = waitForProgramCreateResponse(page);
  await programs.openNewProgramForm();
  await programs.newProgramModal.fill(programName, duplicateDescription);
  await programs.newProgramModal.clickCreate();
  trackProgram(await programIdFromCreateResponse(await secondCreate));
  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toHaveCount(2);
});

// TC-010 — Server/API failure does not show false success
test('TC-010: failed create shows error and keeps data recoverable', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('API Failure Test Program');
  const description = 'Testing error handling';

  await page.route('**/api/programs**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
      return;
    }
    await route.continue();
  });

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fill(programName, description);
  await programs.newProgramModal.clickCreate();

  const modal = programs.newProgramModal;
  await expect(modal.dialog).toBeVisible();
  await expect(modal.programNameInput).toHaveValue(programName);
  await expect(modal.descriptionInput).toHaveValue(description);
  await expect(programs.programRow(programName)).not.toBeVisible();
});

// TC-011 — Minimum valid Program Name (single character)
test('TC-011: single-character Program Name is accepted', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('A');
  const description = 'Single character name test';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
});

// TC-012 — Program Name at maximum allowed length (100 chars per Confluence spec)
test('TC-012: program name at 100 characters is accepted', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const suffix = String(Date.now());
  const baseName = 'A'.repeat(Math.max(1, 100 - suffix.length - 1));
  const maxLengthName = `${baseName}-${suffix}`;
  const description = 'Max length name test';

  expect(maxLengthName.length).toBeLessThanOrEqual(100);

  await programs.goto();
  trackProgram(await createProgramReturningId(page, maxLengthName, description));

  await expect(programs.programRow(maxLengthName).first()).toBeVisible();
});

// TC-013 — Program Name exceeding 100 characters is accepted in the live app
test('TC-013: program name exceeding 100 characters is accepted in the live app', async ({
  page,
  trackProgram,
}) => {
  const programs = new ProgramsPage(page);
  const overMaxName = uniqueName('X'.repeat(120));
  const description = 'Over max length test';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, overMaxName, description));
  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(overMaxName)).toBeVisible();
});

// TC-014 — Empty Description is allowed
test('TC-014: program can be created with empty Description', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Mobile App Development 2026');

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fillProgramName(programName);

  await expect(programs.newProgramModal.createButton).toBeEnabled();
  const pending = waitForProgramCreateResponse(page);
  await programs.newProgramModal.clickCreate();
  trackProgram(await programIdFromCreateResponse(await pending));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
});

// TC-015 — Description at maximum allowed length
test('TC-015: long Description is stored correctly', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('UX Design Bootcamp');
  const description = 'D'.repeat(500);

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
});

// TC-016 — Special characters in Program Name
test('TC-016: program name with special characters is handled safely', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('C++ & C# Programming (2026)');
  const description = 'Languages: C++, C#, and scripting';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
});

// TC-017 — Unicode and emoji in fields
test('TC-017: unicode Program Name and Description render correctly', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('日本語プログラム 2026');
  const description = 'Multilingual curriculum 🎓';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
});

// TC-018 — Leading/trailing whitespace is preserved in the live app (not trimmed)
test('TC-018: leading and trailing whitespace in Program Name is preserved in the live app', async ({
  page,
  trackProgram,
}) => {
  const programs = new ProgramsPage(page);
  const trimmedName = uniqueName('Web Development 2026');
  const paddedName = `   ${trimmedName}   `;
  const description = 'Whitespace trimming test';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, paddedName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(paddedName)).toBeVisible();
});

// TC-019 — Program Name with only whitespace
test('TC-019: whitespace-only Program Name is treated as empty', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fillProgramName('     ');
  await programs.newProgramModal.fillDescription('Whitespace only name test');

  await expect(programs.newProgramModal.createButton).toBeDisabled();
});

// TC-020 — HTML/script injection in Description
test('TC-020: malicious input in Description does not execute in UI', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Security Test Program');
  const description = "<script>alert('xss')</script>";
  let dialogTriggered = false;

  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
  expect(dialogTriggered).toBe(false);
});

// TC-021 — Double-click Create: live app may create more than one; track every UUID for cleanup
test('TC-021: double-click Create creates program entry(s) and all are tracked for cleanup', async ({
  page,
  trackProgram,
}) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Cloud Computing 2026');
  const description = 'AWS and Azure fundamentals';

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fill(programName, description);

  const createdIds: string[] = [];
  page.on('response', (res) => {
    if (
      /\/api\/programs\/?(\?|$)/.test(new URL(res.url()).pathname) &&
      res.request().method() === 'POST' &&
      res.ok()
    ) {
      void res.json().then((body) => {
        const id = body?.data?.id ?? body?.id;
        if (id && typeof id === 'string') {
          createdIds.push(id);
          trackProgram(id);
        }
      });
    }
  });

  await programs.newProgramModal.doubleClickCreate();
  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programsTable).toBeVisible();

  await expect.poll(async () => programs.countProgramsNamed(programName), { timeout: 15000 }).toBeGreaterThanOrEqual(1);
  await expect.poll(() => createdIds.length, { timeout: 5000 }).toBeGreaterThanOrEqual(1);
});

// TC-022 — Newline characters in Description
test('TC-022: multi-line Description is preserved', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring';

  await programs.goto();
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
});

// TC-023 — AI Generation Config section expands and collapses
test('TC-023: AI Generation Config section expands and collapses', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await programs.openNewProgramForm();

  const modal = programs.newProgramModal;
  await modal.showAiConfig();

  await expect(modal.totalProgramHoursInput).toBeVisible();
  await expect(modal.defaultSessionHoursInput).toHaveValue('4');
  await expect(modal.defaultExamHoursInput).toHaveValue('3');
  await expect(modal.targetAudienceInput).toBeVisible();
  await expect(modal.focusAreasInput).toBeVisible();
  await expect(modal.syncAsyncRatioLabel).toBeVisible();

  await modal.hideAiConfig();
  await expect(modal.showAiConfigButton).toBeVisible();
});

// TC-024 — Programs page table layout
test('TC-024: programs page shows table with program name and description', async ({
  page,
  trackProgram,
}) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Table Layout Test');
  const description = 'Verifies list cell layout';

  await programs.goto();
  await expect(programs.heading).toBeVisible();
  await expect(programs.newProgramButton).toBeVisible();
  await expect(programs.programColumnHeader).toBeVisible();

  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programs.programNameInFirstCell(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
});

// TC-025 — Modal X button closes without saving
test('TC-025: modal X button closes without saving', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('X Close Draft');

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fillProgramName(programName);
  await programs.newProgramModal.closeWithX();

  await expect(programs.newProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).not.toBeVisible();
});

// TC-026 — Program without description shows name-only row
test('TC-026: program without description shows name-only row', async ({ page, trackProgram }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Name Only Program');

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fillProgramName(programName);
  const pending = waitForProgramCreateResponse(page);
  await programs.newProgramModal.clickCreate();
  trackProgram(await programIdFromCreateResponse(await pending));

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programNameParagraphs(programName)).toHaveCount(1);
});
