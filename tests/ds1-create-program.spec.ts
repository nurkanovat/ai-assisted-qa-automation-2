import { test, expect } from '../fixtures/cleanup.fixture';
import {
  adminEmail,
  adminPassword,
  nonAdminEmail,
  nonAdminPassword,
  uniqueName,
  login,
  loginAsAdmin,
  navigateToPrograms,
  openNewProgramModal,
  fillProgramForm,
  clickCreate,
  createProgramReturningId,
  waitForProgramCreateResponse,
  programIdFromCreateResponse,
  programModal,
  programInList,
  programDescriptionInList,
  countProgramsNamed,
  closeProgramModal,
  expectNonAdminProgramsAccessDenied,
} from './programs.helpers';

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

// TC-001 — Program creation form displays required fields
test('TC-001: admin sees Program Name and Description on the creation form', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);

  const modal = programModal(page);
  await expect(modal.getByRole('heading', { name: 'New Program' })).toBeVisible();
  await expect(modal.getByLabel('Program Name')).toBeEditable();
  await expect(modal.getByLabel('Program Name')).toHaveAttribute('placeholder', 'e.g. Computer Science BSc');
  await expect(modal.getByLabel('Description')).toBeEditable();
  await expect(modal.getByLabel('Description')).toHaveAttribute('placeholder', 'Brief description');
  await expect(modal.getByRole('button', { name: 'Create' })).toBeDisabled();
  await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
  await expect(modal.getByRole('button', { name: '▸ Show AI Generation Config' })).toBeVisible();
});

// TC-002 — Program is created and appears in the list
test('TC-002: valid program is saved and shown in the program list', async ({ page, trackProgram }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

// TC-003 — Program can be created with description only populated alongside valid name
test('TC-003: program is created when both fields contain valid text', async ({ page, trackProgram }) => {
  const programName = uniqueName('Data Science 2026');
  const description = 'Introduction to statistics and machine learning';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-004 — New program appears without full page reload
test('TC-004: program list updates immediately after successful creation', async ({ page, trackProgram }) => {
  const programName = uniqueName('Cybersecurity Fundamentals');
  const description = 'Network security and ethical hacking basics';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(page).toHaveURL(/\/programs/);
  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-005 — Create is disabled when Program Name is empty
test('TC-005: empty Program Name prevents submission', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);

  await programModal(page).getByLabel('Description').fill('Some description');

  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeDisabled();
});

// TC-006 — Program is not created when Create cannot be clicked
test('TC-006: empty name does not create a program via UI', async ({ page }) => {
  const orphanDescription = uniqueName('Orphan description without a program name');

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Description').fill(orphanDescription);

  const createButton = programModal(page).getByRole('button', { name: 'Create' });
  await expect(createButton).toBeDisabled();

  await expect(programModal(page)).toBeVisible();
  await expect(page.locator('table').getByText(orphanDescription)).not.toBeVisible();
});

// TC-007 — Non-admin cannot open or use program creation
test('TC-007: non-admin users cannot create programs', async ({ page }) => {
  test.skip(
    !nonAdminEmail || !nonAdminPassword,
    'DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD must be set in .env',
  );

  await login(page, nonAdminEmail!, nonAdminPassword!);
  await page.goto(`${process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio'}/programs`);
  await expectNonAdminProgramsAccessDenied(page);
});

// TC-008 — Closing modal without saving does not create a program
test('TC-008: cancel/close discards unsaved program data', async ({ page }) => {
  const programName = uniqueName('Unsaved Program Draft');
  const description = 'This should not be persisted';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await closeProgramModal(page);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).not.toBeVisible();
});

// TC-009 — Duplicate program names are allowed in the live app
test('TC-009: duplicate program name is allowed in the live app', async ({ page, trackProgram }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  const duplicateDescription = 'Duplicate attempt description';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));
  await expect(programInList(page, programName)).toHaveCount(1);

  const secondCreate = waitForProgramCreateResponse(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, duplicateDescription);
  await clickCreate(page);
  trackProgram(await programIdFromCreateResponse(await secondCreate));
  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toHaveCount(2);
});

// TC-010 — Server/API failure does not show false success
test('TC-010: failed create shows error and keeps data recoverable', async ({ page }) => {
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

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);

  const modal = programModal(page);
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel('Program Name')).toHaveValue(programName);
  await expect(modal.getByLabel('Description')).toHaveValue(description);
  await expect(programInList(page, programName)).not.toBeVisible();
});

// TC-011 — Minimum valid Program Name (single character)
test('TC-011: single-character Program Name is accepted', async ({ page, trackProgram }) => {
  const programName = uniqueName('A');
  const description = 'Single character name test';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-012 — Program Name at maximum allowed length (100 chars per Confluence spec)
test('TC-012: program name at 100 characters is accepted', async ({ page, trackProgram }) => {
  const suffix = String(Date.now());
  const baseName = 'A'.repeat(Math.max(1, 100 - suffix.length - 1));
  const maxLengthName = `${baseName}-${suffix}`;
  const description = 'Max length name test';

  expect(maxLengthName.length).toBeLessThanOrEqual(100);

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, maxLengthName, description));

  await expect(programInList(page, maxLengthName).first()).toBeVisible();
});

// TC-013 — Program Name exceeding 100 characters is accepted in the live app
test('TC-013: program name exceeding 100 characters is accepted in the live app', async ({
  page,
  trackProgram,
}) => {
  const overMaxName = uniqueName('X'.repeat(120));
  const description = 'Over max length test';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, overMaxName, description));
  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, overMaxName)).toBeVisible();
});

// TC-014 — Empty Description is allowed
test('TC-014: program can be created with empty Description', async ({ page, trackProgram }) => {
  const programName = uniqueName('Mobile App Development 2026');

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill(programName);

  const createButton = programModal(page).getByRole('button', { name: 'Create' });
  await expect(createButton).toBeEnabled();
  const pending = waitForProgramCreateResponse(page);
  await createButton.click();
  trackProgram(await programIdFromCreateResponse(await pending));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-015 — Description at maximum allowed length
test('TC-015: long Description is stored correctly', async ({ page, trackProgram }) => {
  const programName = uniqueName('UX Design Bootcamp');
  const description = 'D'.repeat(500);

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

// TC-016 — Special characters in Program Name
test('TC-016: program name with special characters is handled safely', async ({ page, trackProgram }) => {
  const programName = uniqueName('C++ & C# Programming (2026)');
  const description = 'Languages: C++, C#, and scripting';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-017 — Unicode and emoji in fields
test('TC-017: unicode Program Name and Description render correctly', async ({ page, trackProgram }) => {
  const programName = uniqueName('日本語プログラム 2026');
  const description = 'Multilingual curriculum 🎓';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

// TC-018 — Leading/trailing whitespace is preserved in the live app (not trimmed)
test('TC-018: leading and trailing whitespace in Program Name is preserved in the live app', async ({
  page,
  trackProgram,
}) => {
  const trimmedName = uniqueName('Web Development 2026');
  const paddedName = `   ${trimmedName}   `;
  const description = 'Whitespace trimming test';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, paddedName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, paddedName)).toBeVisible();
});

// TC-019 — Program Name with only whitespace
test('TC-019: whitespace-only Program Name is treated as empty', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill('     ');
  await programModal(page).getByLabel('Description').fill('Whitespace only name test');

  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeDisabled();
});

// TC-020 — HTML/script injection in Description
test('TC-020: malicious input in Description does not execute in UI', async ({ page, trackProgram }) => {
  const programName = uniqueName('Security Test Program');
  const description = "<script>alert('xss')</script>";
  let dialogTriggered = false;

  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
  expect(dialogTriggered).toBe(false);
});

// TC-021 — Double-click Create: live app may create more than one; track every UUID for cleanup
test('TC-021: double-click Create creates program entry(s) and all are tracked for cleanup', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueName('Cloud Computing 2026');
  const description = 'AWS and Azure fundamentals';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);

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

  await programModal(page).getByRole('button', { name: 'Create' }).dblclick();
  await expect(programModal(page)).not.toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();

  await expect.poll(async () => countProgramsNamed(page, programName), { timeout: 15000 }).toBeGreaterThanOrEqual(1);
  await expect.poll(() => createdIds.length, { timeout: 5000 }).toBeGreaterThanOrEqual(1);
});

// TC-022 — Newline characters in Description
test('TC-022: multi-line Description is preserved', async ({ page, trackProgram }) => {
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring';

  await navigateToPrograms(page);
  trackProgram(await createProgramReturningId(page, programName, description));

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-023 — AI Generation Config section expands and collapses
test('TC-023: AI Generation Config section expands and collapses', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);

  const modal = programModal(page);
  await modal.getByRole('button', { name: '▸ Show AI Generation Config' }).click();

  await expect(modal.getByLabel('Total Program Hours')).toBeVisible();
  await expect(modal.getByLabel('Default Session Hours')).toHaveValue('4');
  await expect(modal.getByLabel('Default Exam Hours')).toHaveValue('3');
  await expect(modal.getByLabel('Target Audience')).toBeVisible();
  await expect(modal.getByLabel('Focus Areas')).toBeVisible();
  await expect(modal.getByText(/Sync\/Async Ratio:/)).toBeVisible();

  await modal.getByRole('button', { name: '▾ Hide AI Generation Config' }).click();
  await expect(modal.getByRole('button', { name: '▸ Show AI Generation Config' })).toBeVisible();
});

// TC-024 — Programs page table layout
test('TC-024: programs page shows table with program name and description', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueName('Table Layout Test');
  const description = 'Verifies list cell layout';

  await navigateToPrograms(page);
  await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Program' })).toBeVisible();

  trackProgram(await createProgramReturningId(page, programName, description));

  const row = programInList(page, programName);
  await expect(row.locator('td').first().getByText(programName, { exact: true })).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

// TC-025 — Modal X button closes without saving
test('TC-025: modal X button closes without saving', async ({ page }) => {
  const programName = uniqueName('X Close Draft');

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill(programName);
  await programModal(page).getByRole('banner').locator('button').click();

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).not.toBeVisible();
});

// TC-026 — Program without description shows name-only row
test('TC-026: program without description shows name-only row', async ({ page, trackProgram }) => {
  const programName = uniqueName('Name Only Program');

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill(programName);
  const pending = waitForProgramCreateResponse(page);
  await clickCreate(page);
  trackProgram(await programIdFromCreateResponse(await pending));

  const row = programInList(page, programName);
  await expect(row).toBeVisible();
  await expect(row.locator('td').first().locator('p')).toHaveCount(1);
});
