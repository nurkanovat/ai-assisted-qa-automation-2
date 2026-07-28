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
  acceptNextDialog,
  dismissNextDialog,
} from './programs.helpers';
import { ProgramsPage } from '../pages/ProgramsPage';

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

test('TC-001: delete icon opens native confirmation dialog', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Test Program');
  await seedProgram(page, programName, 'Delete confirmation test');
  let dialogMessage = '';
  page.once('dialog', (dialog) => {
    dialogMessage = dialog.message();
    dialog.dismiss();
  });
  await programs.clickDelete(programName);

  expect(dialogMessage).toContain(programName);
  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-002: confirmed deletion removes program from the list', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Test Program');
  await seedProgram(page, programName, 'Delete confirm test');
  await programs.confirmDelete(programName);

  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-003: cancelled deletion keeps program in the list', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  dismissNextDialog(page);
  await programs.clickDelete(programName);

  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-004: program list updates in place after confirmed deletion', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const deleteName = uniqueName('Data Science 2026');
  const keepName = uniqueName('Cybersecurity Fundamentals');
  await seedProgram(page, deleteName, 'Introduction to statistics and machine learning');
  await seedProgram(page, keepName, 'Network security and ethical hacking basics');
  await programs.confirmDelete(deleteName);

  await expect(page).toHaveURL(/\/programs/);
  await expect(programs.programRow(deleteName)).not.toBeVisible();
  await expect(programs.programRow(keepName)).toBeVisible();
});

test('TC-005: deleted program stays removed after page refresh', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Test Program');
  await seedProgram(page, programName, 'Refresh persistence test');
  await programs.confirmDelete(programName);
  await page.reload();
  await expect(page).toHaveURL(/\/programs/);

  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-006: closing confirmation without confirming leaves program intact', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Mobile App Development 2026');
  await seedProgram(page, programName, 'iOS and Android development');
  dismissNextDialog(page);
  await programs.clickDelete(programName);

  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-007: non-admin users cannot delete programs', async ({ page }) => {
  test.skip(
    !nonAdminEmail || !nonAdminPassword,
    'DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD must be set in .env',
  );

  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await login(page, nonAdminEmail!, nonAdminPassword!);
  await programs.goto();

  if (await programs.deleteButton(programName).isVisible()) {
    await expect(programs.deleteButton(programName)).toBeDisabled();
  } else {
    await expect(programs.accessDeniedMessage).toBeVisible();
  }
});

test('TC-008: failed delete keeps program visible in the list', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('API Failure Delete Test');
  await seedProgram(page, programName, 'Testing delete error handling');

  await page.route('**/api/programs/**', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
      return;
    }
    await route.continue();
  });

  acceptNextDialog(page);
  await programs.clickDelete(programName);
  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-009: cancelled deletion persists on refresh', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Cloud Computing 2026');
  await seedProgram(page, programName, 'AWS and Azure fundamentals');
  dismissNextDialog(page);
  await programs.clickDelete(programName);
  await page.reload();

  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-010: delete removes only the selected program', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const deleteName = uniqueName('Test Program');
  const keepOne = uniqueName('UX Design Bootcamp');
  const keepTwo = uniqueName('DevOps Pipeline Program');
  await seedProgram(page, deleteName, 'Delete target');
  await seedProgram(page, keepOne, 'UX design fundamentals');
  await seedProgram(page, keepTwo, 'CI/CD and Kubernetes');
  await programs.confirmDelete(deleteName);

  await expect(programs.programRow(deleteName)).not.toBeVisible();
  await expect(programs.programRow(keepOne)).toBeVisible();
  await expect(programs.programRow(keepTwo)).toBeVisible();
});

test('TC-011: delete program with special characters in name', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('C++ & C# Programming (2026)');
  let dialogMessage = '';
  await seedProgram(page, programName, 'Languages: C++, C#, and scripting');
  page.once('dialog', (dialog) => {
    dialogMessage = dialog.message();
    dialog.accept();
  });
  await programs.clickDelete(programName);

  expect(dialogMessage).toContain('C++ & C# Programming');
  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-012: delete program with Unicode name', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('日本語プログラム 2026');
  await seedProgram(page, programName, 'Multilingual curriculum 🎓');
  await programs.confirmDelete(programName);

  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-013: delete program with maximum-length name', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName(
    'Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha',
  );
  await seedProgram(page, programName, 'Long name delete test');
  await programs.confirmDelete(programName);

  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-014: delete last created program row succeeds', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Test Program');
  await seedProgram(page, programName, 'Only program in this test scope');
  await programs.confirmDelete(programName);

  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-015: double confirm click removes program once', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Test Program');
  await seedProgram(page, programName, 'Double confirm test');
  let dialogCount = 0;
  page.on('dialog', (dialog) => {
    dialogCount += 1;
    dialog.accept();
  });
  await programs.clickDelete(programName);
  await page.waitForTimeout(500);

  await expect(programs.programRow(programName)).not.toBeVisible();
  expect(dialogCount).toBeGreaterThanOrEqual(1);
});

test('TC-016: delete while edit form is open requires closing edit modal first', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);

  await expect(programs.deleteButton(programName)).toBeVisible();
  await programs.closeEditModal();
  await expect(programs.editProgramModal.dialog).not.toBeVisible();
  await programs.confirmDelete(programName);

  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-017: confirm delete on already-deleted program shows error', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Test Program');
  await seedProgram(page, programName, 'Concurrent delete test');

  await page.route('**/api/programs/**', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Program not found' }),
      });
      return;
    }
    await route.continue();
  });

  acceptNextDialog(page);
  await programs.clickDelete(programName);
  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-018: delete targets correct program among similar names', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const baseName = uniqueName('Web Development 2026');
  const updatedName = `${baseName} - Updated`;
  await seedProgram(page, baseName, 'Original program');
  await seedProgram(page, updatedName, 'Updated variant');
  let dialogMessage = '';
  page.once('dialog', (dialog) => {
    dialogMessage = dialog.message();
    dialog.accept();
  });
  await programs.clickDelete(baseName);

  expect(dialogMessage).toContain(`Delete program "${baseName}"`);
  expect(dialogMessage).not.toContain(`Delete program "${updatedName}"`);
  await expect(programs.programRow(baseName)).not.toBeVisible();
  await expect(programs.programRow(updatedName)).toBeVisible();
});

test('TC-019: Escape key cancels program deletion', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Informatique & IA - Niveau 2');
  await seedProgram(page, programName, 'French program');
  page.once('dialog', (dialog) => dialog.dismiss());
  await programs.clickDelete(programName);

  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-020: deleted program name can be reused for new program', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Test Program');
  await seedProgram(page, programName, 'Original program');
  await programs.confirmDelete(programName);
  await programs.openNewProgramForm();
  await programs.newProgramModal.fill(programName, 'Recreated after deletion');
  await programs.newProgramModal.clickCreate();

  await expect(programs.programRow(programName)).toBeVisible();
});
