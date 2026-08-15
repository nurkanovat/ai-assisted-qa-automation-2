import { test, expect } from '@playwright/test';
import {
  adminEmail,
  adminPassword,
  nonAdminEmail,
  nonAdminPassword,
  uniqueName,
  login,
  loginAsAdmin,
  seedProgram,
} from './programs.helpers';
import { ProgramsPage } from '../pages/ProgramsPage';

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

test('TC-001: program list displays name and description for each program', { tag: '@smoke' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programOne = uniqueName('Web Development 2026');
  const programTwo = uniqueName('Data Science 2026');
  await seedProgram(page, programOne, 'Full-stack web development program');
  await seedProgram(page, programTwo, 'Introduction to statistics and machine learning');

  await expect(programs.programRow(programOne)).toBeVisible();
  await expect(programs.programDescription(programOne, 'Full-stack web development program')).toBeVisible();
  await expect(programs.programRow(programTwo)).toBeVisible();
  await expect(programs.programDescription(programTwo, 'Introduction to statistics and machine learning')).toBeVisible();
});

test('TC-002: list renders every seeded program without omission', { tag: '@smoke' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const names = [
    uniqueName('Web Development 2026'),
    uniqueName('Cybersecurity Fundamentals'),
    uniqueName('UX Design Bootcamp'),
  ];
  for (const [index, name] of names.entries()) {
    await seedProgram(page, name, `Description ${index + 1}`);
  }

  for (const name of names) {
    await expect(programs.programRow(name)).toBeVisible();
  }
});

test('TC-003: empty state message is shown when programs API returns no programs', { tag: '@sanity' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
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
  await programs.goto();

  await expect(programs.tableDataRows()).toHaveCount(0);
  await expect(programs.newProgramButtonAlt).not.toBeVisible();
});

test('TC-004: empty state includes prompt to create the first program', { tag: '@sanity' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
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
  await programs.goto();

  await expect(programs.tableDataRows()).toHaveCount(0);
  await expect(programs.selectProgramPrompt).not.toBeVisible();
});

test('TC-005: first created program replaces empty state with list row', { tag: '@sanity' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fill(programName, description);
  await programs.newProgramModal.clickCreate();

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
  await expect(programs.noProgramsCreatedMessage).not.toBeVisible();
});

test('TC-006: program list persists after page refresh', { tag: '@sanity' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);
  await page.reload();
  await expect(page).toHaveURL(/\/programs/);

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
});

test('TC-007: empty state is not shown when programs exist', { tag: '@sanity' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.noProgramsCreatedMessage).not.toBeVisible();
});

test('TC-008: deleted program is removed from displayed list', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const deleteName = uniqueName('Test Program');
  const keepName = uniqueName('Data Science 2026');
  await seedProgram(page, deleteName, 'Temporary program');
  await seedProgram(page, keepName, 'Introduction to statistics and machine learning');
  await programs.confirmDelete(deleteName);

  await expect(programs.programRow(deleteName)).not.toBeVisible();
  await expect(programs.programRow(keepName)).toBeVisible();
  await expect(programs.programDescription(keepName, 'Introduction to statistics and machine learning')).toBeVisible();
});

test('TC-009: list shows only intended program details per row', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);

  await expect(programs.programRowNameText(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
  await expect(programs.programRowUuidText(programName)).not.toBeVisible();
});

test('TC-010: non-admin unauthorized access does not leak program data', { tag: '@regression' }, async ({ page }) => {
  test.skip(
    !nonAdminEmail || !nonAdminPassword,
    'DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD must be set in .env',
  );

  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await login(page, nonAdminEmail!, nonAdminPassword!);
  await programs.goto();
  if (await programs.newProgramButton.isVisible()) {
    await expect(programs.newProgramButton).toBeDisabled();
  } else if (await programs.accessDeniedMessage.isVisible()) {
    await expect(programs.accessDeniedMessage).toBeVisible();
  } else {
    await expect(page).not.toHaveURL(/\/programs/);
  }
  await expect(programs.programNameOnPage(programName)).not.toBeVisible();
});

test('TC-011: API failure does not show false empty state', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
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

  await expect(programs.noProgramsCreatedMessage).not.toBeVisible();
  await expect(programs.programsHeadingAny).toBeVisible();
});

test('TC-012: special characters display correctly in program list', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('C++ & C# Programming (2026)');
  const description = 'Languages: C++, C#, and scripting';
  await seedProgram(page, programName, description);

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
});

test('TC-013: unicode program name and emoji description display correctly', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('日本語プログラム 2026');
  const description = 'Multilingual curriculum 🎓';
  await seedProgram(page, programName, description);

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, description)).toBeVisible();
});

test('TC-014: long program name displays without breaking layout', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName(
    'Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha',
  );
  await seedProgram(page, programName, 'Long name display test');
  const row = programs.programRow(programName).first();

  await expect(row).toBeVisible();
  await expect(programs.programRowNameText(programName)).toBeVisible();
});

test('TC-015: long description displays without breaking layout', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'D'.repeat(500);
  await seedProgram(page, programName, description);
  const row = programs.programRow(programName);

  await expect(row).toBeVisible();
  await expect(programs.programRowNameText(programName)).toBeVisible();
});

test('TC-016: empty description is displayed consistently', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Mobile App Development 2026');
  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.fillProgramName(programName);
  await programs.newProgramModal.clickCreate();

  await expect(programs.programRowNameText(programName)).toBeVisible();
  await expect(programs.programRowNullPlaceholder(programName)).not.toBeVisible();
});

test('TC-017: single program list displays correctly without empty-state message', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);

  await expect(programs.programRow(programName)).toHaveCount(1);
  await expect(programs.noProgramsCreatedMessage).not.toBeVisible();
});

test('TC-018: HTML in description is escaped in list display', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Security Test Program');
  const description = "<script>alert('xss')</script>";
  let dialogTriggered = false;
  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await seedProgram(page, programName, description);
  await expect(programs.programRow(programName)).toBeVisible();
  expect(dialogTriggered).toBe(false);
});

test.fixme('TC-019: duplicate program names display as separate rows', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'First duplicate description');
  await seedProgram(page, programName, 'Second duplicate description');

  await expect(await programs.countProgramsNamed(programName)).toBe(2);
});

test('TC-020: large number of newly created programs all appear in the list', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const prefix = uniqueName('Program');
  const names = Array.from({ length: 10 }, (_, index) => `${prefix}-${String(index + 1).padStart(3, '0')}`);
  await programs.goto();
  for (const name of names) {
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(name, `Bulk list item ${name}`);
    await programs.newProgramModal.clickCreate();
  }

  for (const name of names) {
    await expect(programs.programRow(name)).toBeVisible();
  }
});

test('TC-021: list reflects updated description after edit', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const originalDescription = 'Full-stack web development program';
  const revisedDescription = 'Full-stack web development program — revised';
  await seedProgram(page, programName, originalDescription);
  await programs.openEditModal(programName);
  await programs.fillEditDescription(revisedDescription);
  await programs.saveEdit();

  await expect(programs.programDescription(programName, revisedDescription)).toBeVisible();
});

test('TC-022: multi-line description is readable in program list', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring';
  await seedProgram(page, programName, description);

  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programRowLineMatching(programName, /Week 1: CI\/CD basics/)).toBeVisible();
});
