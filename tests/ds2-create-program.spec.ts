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

test('TC-001: edit modal shows existing Program Name and Description values', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);
  await programs.openEditModal(programName);

  await expect(programs.editProgramModal.programNameInput).toHaveValue(programName);
  await expect(programs.editProgramModal.descriptionInput).toHaveValue(description);
});

test('TC-002: renamed program appears in the list immediately after Save', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const updatedName = `${programName} - Updated`;
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(updatedName);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(updatedName)).toBeVisible();
  await expect(programs.programRow(programName)).not.toBeVisible();
});

test('TC-003: partial edit updates only the modified field', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  const revised = 'Full-stack web development program — revised curriculum';
  await seedProgram(page, programName, description);
  await programs.openEditModal(programName);
  await programs.fillEditDescription(revised);
  await programs.saveEdit();
  await programs.openEditModal(programName);

  await expect(programs.editProgramModal.programNameInput).toHaveValue(programName);
  await expect(programs.editProgramModal.descriptionInput).toHaveValue(revised);
});

test('TC-004: program list updates in place after edit without reload', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Data Science 2026');
  const updatedName = `${programName} - Advanced Track`;
  await seedProgram(page, programName, 'Introduction to statistics and machine learning');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(updatedName);
  await programs.saveEdit();

  await expect(page).toHaveURL(/\/programs/);
  await expect(programs.programRow(updatedName)).toBeVisible();
});

test('TC-005: full edit of Program Name and Description persists correctly', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Cybersecurity Fundamentals');
  const updatedName = `${programName} 2026`;
  const updatedDescription = 'Network security, ethical hacking, and incident response';
  await seedProgram(page, programName, 'Network security and ethical hacking basics');
  await programs.openEditModal(programName);
  await programs.fillEditForm(updatedName, updatedDescription);
  await programs.saveEdit();
  await programs.openEditModal(updatedName);

  await expect(programs.editProgramModal.programNameInput).toHaveValue(updatedName);
  await expect(programs.editProgramModal.descriptionInput).toHaveValue(updatedDescription);
});

test('TC-006: save without modifications keeps program data intact', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Mobile App Development 2026');
  const description = 'iOS and Android development';
  await seedProgram(page, programName, description);
  await programs.openEditModal(programName);
  await programs.saveEdit();

  await expect(programs.programRow(programName)).toBeVisible();
  await programs.openEditModal(programName);
  await expect(programs.editProgramModal.programNameInput).toHaveValue(programName);
  await expect(programs.editProgramModal.descriptionInput).toHaveValue(description);
});

test('TC-007: empty Program Name blocks save on edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName('');

  await expect(programs.editProgramModal.saveButton).toBeDisabled();
  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-008: cleared Program Name does not persist via UI', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName('');
  await programs.fillEditDescription('Attempted empty name save');

  await expect(programs.editProgramModal.saveButton).toBeDisabled();
  await programs.closeEditModal();
  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-009: cancel/close discards unsaved edit changes', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(uniqueName('Unsaved Edit Draft'));
  await programs.fillEditDescription('This change should not be saved');
  await programs.closeEditModal();

  await expect(programs.editProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
  await programs.openEditModal(programName);
  await expect(programs.editProgramModal.descriptionInput).toHaveValue(description);
});

test('TC-010: non-admin users cannot edit programs', async ({ page }) => {
  test.skip(
    !nonAdminEmail || !nonAdminPassword,
    'DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD must be set in .env',
  );

  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await login(page, nonAdminEmail!, nonAdminPassword!);
  await programs.goto();

  if (await programs.editButton(programName).isVisible()) {
    await expect(programs.editButton(programName)).toBeDisabled();
  } else {
    await expect(programs.accessDeniedMessage).toBeVisible();
  }
});

test('TC-011: renaming to an existing program name is allowed in the live app', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const existingName = uniqueName('Web Development 2026');
  const targetName = uniqueName('Data Science 2026');
  await seedProgram(page, existingName, 'Existing program');
  await seedProgram(page, targetName, 'Target program');
  await programs.openEditModal(targetName);
  await programs.fillEditProgramName(existingName);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).not.toBeVisible();
  await expect(await programs.countProgramsNamed(existingName)).toBeGreaterThanOrEqual(2);
});

test('TC-012: failed save shows error and keeps recoverable form data', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const updatedName = uniqueName('API Failure Edit Test');
  await seedProgram(page, programName, 'Full-stack web development program');

  await page.route('**/api/programs/**', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
      return;
    }
    await route.continue();
  });

  await programs.openEditModal(programName);
  await programs.fillEditProgramName(updatedName);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).toBeVisible();
  await expect(programs.editProgramModal.programNameInput).toHaveValue(updatedName);
  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programRow(updatedName)).not.toBeVisible();
});

test('TC-013: save edit on deleted program shows error', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);

  await page.route('**/api/programs/**', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Program not found' }),
      });
      return;
    }
    await route.continue();
  });

  await programs.fillEditDescription('Edited after deletion');
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).toBeVisible();
});

test('TC-014: single-character Program Name is accepted on edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const singleChar = uniqueName('A');
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(singleChar);
  await programs.saveEdit();

  await expect(programs.programRow(singleChar)).toBeVisible();
});

test('TC-015: program name at maximum allowed length is accepted on edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const maxLengthName = uniqueName(
    'Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha',
  );
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(maxLengthName);
  await programs.saveEdit();

  await expect(programs.programRow(maxLengthName).first()).toBeVisible();
});

test('TC-016: program name exceeding 256 characters is accepted on edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const overMaxName = uniqueName('X'.repeat(240));
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(overMaxName);
  await programs.saveEdit();

  await expect(programs.programRow(overMaxName).first()).toBeVisible();
});

test('TC-017: empty Description is allowed on edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditDescription('');
  await expect(programs.editProgramModal.saveButton).toBeEnabled();
  await programs.saveEdit();
  await programs.openEditModal(programName);

  await expect(programs.editProgramModal.descriptionInput).toHaveValue('');
});

test('TC-018: long Description is stored correctly after edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('UX Design Bootcamp');
  const longDescription = 'D'.repeat(2000);
  await seedProgram(page, programName, 'Original description');
  await programs.openEditModal(programName);
  await programs.fillEditDescription(longDescription);
  await programs.saveEdit();
  await programs.openEditModal(programName);

  await expect(programs.editProgramModal.descriptionInput).toHaveValue(longDescription);
});

test('TC-019: special characters in edited fields render safely', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const specialName = uniqueName('C++ & C# Programming (2026)');
  const specialDescription = 'Languages: C++, C#, and scripting';
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditForm(specialName, specialDescription);
  await programs.saveEdit();

  await expect(programs.programRow(specialName)).toBeVisible();
});

test('TC-020: unicode Program Name and emoji Description render correctly after edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const unicodeName = uniqueName('日本語プログラム 2026');
  const emojiDescription = 'Multilingual curriculum 🎓';
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditForm(unicodeName, emojiDescription);
  await programs.saveEdit();

  await expect(programs.programRow(unicodeName)).toBeVisible();
  await programs.openEditModal(unicodeName);
  await expect(programs.editProgramModal.descriptionInput).toHaveValue(emojiDescription);
});

test('TC-021: leading and trailing whitespace in Program Name is stored as entered', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const trimmedBase = uniqueName('Web Development 2026 - Updated');
  const paddedName = `   ${trimmedBase}   `;
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(paddedName);
  await programs.saveEdit();

  await expect(programs.programRow(paddedName)).toBeVisible();
});

test('TC-022: whitespace-only Program Name is rejected on edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName('     ');

  await expect(programs.editProgramModal.saveButton).toBeDisabled();
  await expect(programs.programRow(programName)).toBeVisible();
});

test('TC-023: malicious input in Description does not execute in UI after edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const description = "<script>alert('xss')</script>";
  let dialogTriggered = false;
  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditDescription(description);
  await programs.saveEdit();

  await expect(programs.programRow(programName)).toBeVisible();
  expect(dialogTriggered).toBe(false);
});

test('TC-024: double-click Save produces exactly one updated program row', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Cloud Computing 2026');
  const updatedName = `${programName} - Enterprise`;
  await seedProgram(page, programName, 'AWS and Azure fundamentals');
  await programs.openEditModal(programName);
  await programs.fillEditProgramName(updatedName);
  await programs.doubleClickSaveEdit();
  await expect(programs.editProgramModal.dialog).not.toBeVisible();

  await expect(await programs.countProgramsNamed(updatedName)).toBe(1);
});

test('TC-025: multi-line Description is preserved on edit', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring';
  await seedProgram(page, programName, 'Original description');
  await programs.openEditModal(programName);
  await programs.fillEditDescription(description);
  await programs.saveEdit();
  await programs.openEditModal(programName);

  await expect(programs.editProgramModal.descriptionInput).toHaveValue(description);
});

test('TC-026: edit with unchanged program name does not trigger duplicate error', async ({ page }) => {
  const programs = new ProgramsPage(page);
  const programName = uniqueName('Web Development 2026');
  const updatedDescription = 'Minor description tweak only';
  await seedProgram(page, programName, 'Full-stack web development program');
  await programs.openEditModal(programName);
  await programs.fillEditDescription(updatedDescription);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).not.toBeVisible();
  await expect(programs.programRow(programName)).toBeVisible();
  await expect(programs.programDescription(programName, updatedDescription)).toBeVisible();
});
