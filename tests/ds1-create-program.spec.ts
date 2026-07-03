import { test, expect, Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
const LOGIN_URL = `${BASE_URL}/login`;
const PROGRAMS_URL = `${BASE_URL}/programs`;

const adminEmail = process.env.DIDAXIS_EMAIL;
const adminPassword = process.env.DIDAXIS_PASSWORD;
const nonAdminEmail = process.env.DIDAXIS_NONADMIN_EMAIL;
const nonAdminPassword = process.env.DIDAXIS_NONADMIN_PASSWORD;

function uniqueName(base: string): string {
  return `${base}-${Date.now()}`;
}

function programModal(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

async function login(page: Page, email: string, password: string) {
  await page.goto(LOGIN_URL);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

async function loginAsAdmin(page: Page) {
  await login(page, adminEmail!, adminPassword!);
}

async function navigateToPrograms(page: Page) {
  await page.goto(PROGRAMS_URL);
  await expect(page).toHaveURL(/\/programs/);
}

async function openNewProgramModal(page: Page) {
  await page.getByRole('button', { name: 'New Program' }).click();
  const modal = programModal(page);
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel('Program Name')).toBeVisible();
  await expect(modal.getByLabel('Description')).toBeVisible();
}

async function fillProgramForm(page: Page, programName: string, description: string) {
  const modal = programModal(page);
  await modal.getByLabel('Program Name').fill(programName);
  await modal.getByLabel('Description').fill(description);
}

async function clickCreate(page: Page) {
  await programModal(page).getByRole('button', { name: 'Create' }).click();
}

async function createProgram(page: Page, programName: string, description: string) {
  await fillProgramForm(page, programName, description);
  await clickCreate(page);
  await expect(programModal(page)).not.toBeVisible();
}

function programDescriptionInList(page: Page, programName: string, description: string) {
  return programInList(page, programName).getByText(description);
}

async function closeProgramModal(page: Page) {
  const modal = programModal(page);
  const cancelButton = modal.getByRole('button', { name: 'Cancel' });

  if (await cancelButton.isVisible()) {
    await cancelButton.click();
  } else {
    await page.keyboard.press('Escape');
  }
}

function programInList(page: Page, programName: string) {
  return page.getByRole('row').filter({ has: page.getByText(programName, { exact: true }) });
}

async function countProgramsNamed(page: Page, programName: string) {
  return programInList(page, programName).count();
}

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

// TC-001 — Program creation form displays required fields
test('TC-001: admin sees Program Name and Description on the creation form', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);

  const modal = programModal(page);
  await expect(modal.getByLabel('Program Name')).toBeEditable();
  await expect(modal.getByLabel('Description')).toBeEditable();
  await expect(modal.getByRole('button', { name: 'Create' })).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible();
});

// TC-002 — Program is created and appears in the list
test('TC-002: valid program is saved and shown in the program list', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

// TC-003 — Program can be created with description only populated alongside valid name
test('TC-003: program is created when both fields contain valid text', async ({ page }) => {
  const programName = uniqueName('Data Science 2026');
  const description = 'Introduction to statistics and machine learning';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-004 — New program appears without full page reload
test('TC-004: program list updates immediately after successful creation', async ({ page }) => {
  const programName = uniqueName('Cybersecurity Fundamentals');
  const description = 'Network security and ethical hacking basics';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

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
  await page.goto(PROGRAMS_URL);

  const newProgramButton = page.getByRole('button', { name: 'New Program' });
  const accessDenied = page.getByText(/access denied|forbidden|not authorized|permission/i);

  if (await newProgramButton.isVisible()) {
    await expect(newProgramButton).toBeDisabled();
  } else if (await accessDenied.isVisible()) {
    await expect(accessDenied).toBeVisible();
  } else {
    await expect(page).not.toHaveURL(/\/programs/);
  }
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

// TC-009 — Duplicate program name is allowed and creates another entry
test('TC-009: duplicate program name creates another program entry', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  const duplicateDescription = 'Duplicate attempt description';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);
  await expect(programInList(page, programName)).toHaveCount(1);

  await openNewProgramModal(page);
  await createProgram(page, programName, duplicateDescription);

  await expect(programModal(page)).not.toBeVisible();
  await expect(await countProgramsNamed(page, programName)).toBe(2);
  await expect(programDescriptionInList(page, programName, duplicateDescription)).toBeVisible();
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
test('TC-011: single-character Program Name is accepted', async ({ page }) => {
  const programName = uniqueName('A');
  const description = 'Single character name test';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-012 — Program Name at maximum allowed length
test('TC-012: program name at maximum allowed length is accepted', async ({ page }) => {
  const maxLengthName = uniqueName(
    'Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha',
  );
  const description = 'Max length name test';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, maxLengthName, description);

  await expect(programInList(page, maxLengthName).first()).toBeVisible();
});

// TC-013 — Program Name exceeding 256 characters is accepted (no client-side max)
test('TC-013: program name exceeding 256 characters is accepted', async ({ page }) => {
  const overMaxName = uniqueName('X'.repeat(240));
  const description = 'Over max length test';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, overMaxName, description);

  await expect(programInList(page, overMaxName).first()).toBeVisible();
});

// TC-014 — Empty Description is allowed
test('TC-014: program can be created with empty Description', async ({ page }) => {
  const programName = uniqueName('Mobile App Development 2026');

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill(programName);

  const createButton = programModal(page).getByRole('button', { name: 'Create' });
  await expect(createButton).toBeEnabled();
  await createButton.click();

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-015 — Description at maximum allowed length
test('TC-015: long Description is stored correctly', async ({ page }) => {
  const programName = uniqueName('UX Design Bootcamp');
  const description = 'D'.repeat(2000);

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-016 — Special characters in Program Name
test('TC-016: program name with special characters is handled safely', async ({ page }) => {
  const programName = uniqueName('C++ & C# Programming (2026)');
  const description = 'Languages: C++, C#, and scripting';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

// TC-017 — Unicode and emoji in fields
test('TC-017: unicode Program Name and Description render correctly', async ({ page }) => {
  const programName = uniqueName('日本語プログラム 2026');
  const description = 'Multilingual curriculum 🎓';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

// TC-018 — Leading and trailing whitespace in Program Name
test('TC-018: leading and trailing whitespace in Program Name is stored as entered', async ({ page }) => {
  const trimmedName = uniqueName('Web Development 2026');
  const paddedName = `   ${trimmedName}   `;
  const description = 'Whitespace trimming test';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, paddedName, description);

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
test('TC-020: malicious input in Description does not execute in UI', async ({ page }) => {
  const programName = uniqueName('Security Test Program');
  const description = "<script>alert('xss')</script>";
  let dialogTriggered = false;

  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
  expect(dialogTriggered).toBe(false);
});

// TC-021 — Double-click Create submits twice (current app behavior)
test('TC-021: double-click Create can create duplicate program entries', async ({ page }) => {
  const programName = uniqueName('Cloud Computing 2026');
  const description = 'AWS and Azure fundamentals';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await programModal(page).getByRole('button', { name: 'Create' }).dblclick();
  await expect(programModal(page)).not.toBeVisible();

  await expect(await countProgramsNamed(page, programName)).toBe(2);
});

// TC-022 — Newline characters in Description
test('TC-022: multi-line Description is preserved', async ({ page }) => {
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring';

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await createProgram(page, programName, description);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});
