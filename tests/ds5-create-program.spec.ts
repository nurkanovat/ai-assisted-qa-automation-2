import { test, expect } from '@playwright/test';
import {
  adminEmail,
  adminPassword,
  nonAdminEmail,
  nonAdminPassword,
  uniqueName,
  login,
  loginAsAdmin,
  navigateToPrograms,
  seedProgram,
  programInList,
  programDescriptionInList,
  countProgramsNamed,
  openEditModal,
  editModal,
  saveEdit,
  confirmDelete,
  openNewProgramModal,
  fillProgramForm,
  clickCreate,
  programModal,
  expectNonAdminProgramsAccessDenied,
} from './programs.helpers';

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

test('TC-001: program list displays name and description for each program', async ({ page }) => {
  const programOne = uniqueName('Web Development 2026');
  const programTwo = uniqueName('Data Science 2026');
  await seedProgram(page, programOne, 'Full-stack web development program');
  await seedProgram(page, programTwo, 'Introduction to statistics and machine learning');

  await expect(programInList(page, programOne)).toBeVisible();
  await expect(programDescriptionInList(page, programOne, 'Full-stack web development program')).toBeVisible();
  await expect(programInList(page, programTwo)).toBeVisible();
  await expect(programDescriptionInList(page, programTwo, 'Introduction to statistics and machine learning')).toBeVisible();
});

test('TC-002: list renders every seeded program without omission', async ({ page }) => {
  const names = [
    uniqueName('Web Development 2026'),
    uniqueName('Cybersecurity Fundamentals'),
    uniqueName('UX Design Bootcamp'),
  ];
  for (const [index, name] of names.entries()) {
    await seedProgram(page, name, `Description ${index + 1}`);
  }

  for (const name of names) {
    await expect(programInList(page, name)).toBeVisible();
  }
});

test('TC-003: empty state message is shown when programs API returns no programs', async ({ page }) => {
  await page.route('**/api/programs', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      });
      return;
    }
    await route.continue();
  });
  await navigateToPrograms(page);

  await expect(page.locator('table tbody tr')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'New Program' })).not.toBeVisible();
});

test('TC-004: empty state includes prompt to create the first program', async ({ page }) => {
  await page.route('**/api/programs', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      });
      return;
    }
    await route.continue();
  });
  await navigateToPrograms(page);

  await expect(page.locator('table tbody tr')).toHaveCount(0);
  await expect(page.getByText(/select a program to manage semesters/i)).not.toBeVisible();
});

test('TC-005: first created program replaces empty state with list row', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);

  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
  await expect(page.getByText(/no programs have been created/i)).not.toBeVisible();
});

test('TC-006: program list persists after page refresh', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);
  await page.reload();
  await expect(page).toHaveURL(/\/programs/);

  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

test('TC-007: empty state is not shown when programs exist', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');

  await expect(programInList(page, programName)).toBeVisible();
  await expect(page.getByText(/no programs have been created/i)).not.toBeVisible();
});

test('TC-008: deleted program is removed from displayed list', async ({ page }) => {
  const deleteName = uniqueName('Test Program');
  const keepName = uniqueName('Data Science 2026');
  await seedProgram(page, deleteName, 'Temporary program');
  await seedProgram(page, keepName, 'Introduction to statistics and machine learning');
  await confirmDelete(page, deleteName);

  await expect(programInList(page, deleteName)).not.toBeVisible();
  await expect(programInList(page, keepName)).toBeVisible();
  await expect(programDescriptionInList(page, keepName, 'Introduction to statistics and machine learning')).toBeVisible();
});

test('TC-009: list shows only intended program details per row', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);
  const row = programInList(page, programName);

  await expect(row.getByText(programName, { exact: true })).toBeVisible();
  await expect(row.getByText(description)).toBeVisible();
  await expect(row.getByText(/^[0-9a-f-]{36}$/)).not.toBeVisible();
});

test('TC-010: non-admin unauthorized access does not leak program data', async ({ page }) => {
  test.skip(
    !nonAdminEmail || !nonAdminPassword,
    'DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD must be set in .env',
  );

  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await login(page, nonAdminEmail!, nonAdminPassword!);
  await page.goto('/programs');
  await expectNonAdminProgramsAccessDenied(page);
  await expect(page.getByText(programName, { exact: true })).not.toBeVisible();
});

test('TC-011: API failure does not show false empty state', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');

  await page.route('**/api/programs', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
      return;
    }
    await route.continue();
  });
  await page.reload();

  await expect(page.getByText(/no programs have been created/i)).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
});

test('TC-012: special characters display correctly in program list', async ({ page }) => {
  const programName = uniqueName('C++ & C# Programming (2026)');
  const description = 'Languages: C++, C#, and scripting';
  await seedProgram(page, programName, description);

  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

test('TC-013: unicode program name and emoji description display correctly', async ({ page }) => {
  const programName = uniqueName('日本語プログラム 2026');
  const description = 'Multilingual curriculum 🎓';
  await seedProgram(page, programName, description);

  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, description)).toBeVisible();
});

test('TC-014: long program name displays without breaking layout', async ({ page }) => {
  const programName = uniqueName(
    'Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha',
  );
  await seedProgram(page, programName, 'Long name display test');
  const row = programInList(page, programName).first();

  await expect(row).toBeVisible();
  await expect(row.getByText(programName, { exact: true })).toBeVisible();
});

test('TC-015: long description displays without breaking layout', async ({ page }) => {
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'D'.repeat(500);
  await seedProgram(page, programName, description);
  const row = programInList(page, programName);

  await expect(row).toBeVisible();
  await expect(row.getByText(programName, { exact: true })).toBeVisible();
});

test('TC-016: empty description is displayed consistently', async ({ page }) => {
  const programName = uniqueName('Mobile App Development 2026');
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill(programName);
  await programModal(page).getByRole('button', { name: 'Create' }).click();
  const row = programInList(page, programName);

  await expect(row.getByText(programName, { exact: true })).toBeVisible();
  await expect(row.getByText(/null|undefined/i)).not.toBeVisible();
});

test('TC-017: single program list displays correctly without empty-state message', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);

  await expect(programInList(page, programName)).toHaveCount(1);
  await expect(page.getByText(/no programs have been created/i)).not.toBeVisible();
});

test('TC-018: HTML in description is escaped in list display', async ({ page }) => {
  const programName = uniqueName('Security Test Program');
  const description = "<script>alert('xss')</script>";
  let dialogTriggered = false;
  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await seedProgram(page, programName, description);
  await expect(programInList(page, programName)).toBeVisible();
  expect(dialogTriggered).toBe(false);
});

test('TC-019: duplicate program names display as separate rows', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'First duplicate description');
  await seedProgram(page, programName, 'Second duplicate description');

  await expect(await countProgramsNamed(page, programName)).toBe(2);
});

test('TC-020: large number of newly created programs all appear in the list', async ({ page }) => {
  const prefix = uniqueName('Program');
  const names = Array.from({ length: 10 }, (_, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`);
  await navigateToPrograms(page);
  for (const name of names) {
    await openNewProgramModal(page);
    await fillProgramForm(page, name, `Bulk list item ${name}`);
    await clickCreate(page);
  }

  for (const name of names) {
    await expect(programInList(page, name)).toBeVisible();
  }
});

test('TC-021: list reflects updated description after edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const originalDescription = 'Full-stack web development program';
  const revisedDescription = 'Full-stack web development program — revised';
  await seedProgram(page, programName, originalDescription);
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill(revisedDescription);
  await saveEdit(page);

  await expect(programDescriptionInList(page, programName, revisedDescription)).toBeVisible();
});

test('TC-022: multi-line description is readable in program list', async ({ page }) => {
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring';
  await seedProgram(page, programName, description);
  const row = programInList(page, programName);

  await expect(row).toBeVisible();
  await expect(row.getByText(/Week 1: CI\/CD basics/)).toBeVisible();
});
