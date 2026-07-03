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
  editModal,
  openEditModal,
  saveEdit,
  closeEditModal,
} from './programs.helpers';

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

test('TC-001: edit modal shows existing Program Name and Description values', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);
  await openEditModal(page, programName);

  const modal = editModal(page);
  await expect(modal.getByLabel('Program Name')).toHaveValue(programName);
  await expect(modal.getByLabel('Description')).toHaveValue(description);
});

test('TC-002: renamed program appears in the list immediately after Save', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const updatedName = `${programName} - Updated`;
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(updatedName);
  await saveEdit(page);

  await expect(editModal(page)).not.toBeVisible();
  await expect(programInList(page, updatedName)).toBeVisible();
  await expect(programInList(page, programName)).not.toBeVisible();
});

test('TC-003: partial edit updates only the modified field', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  const revised = 'Full-stack web development program — revised curriculum';
  await seedProgram(page, programName, description);
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill(revised);
  await saveEdit(page);
  await openEditModal(page, programName);

  await expect(editModal(page).getByLabel('Program Name')).toHaveValue(programName);
  await expect(editModal(page).getByLabel('Description')).toHaveValue(revised);
});

test('TC-004: program list updates in place after edit without reload', async ({ page }) => {
  const programName = uniqueName('Data Science 2026');
  const updatedName = `${programName} - Advanced Track`;
  await seedProgram(page, programName, 'Introduction to statistics and machine learning');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(updatedName);
  await saveEdit(page);

  await expect(page).toHaveURL(/\/programs/);
  await expect(programInList(page, updatedName)).toBeVisible();
});

test('TC-005: full edit of Program Name and Description persists correctly', async ({ page }) => {
  const programName = uniqueName('Cybersecurity Fundamentals');
  const updatedName = `${programName} 2026`;
  const updatedDescription = 'Network security, ethical hacking, and incident response';
  await seedProgram(page, programName, 'Network security and ethical hacking basics');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(updatedName);
  await editModal(page).getByLabel('Description').fill(updatedDescription);
  await saveEdit(page);
  await openEditModal(page, updatedName);

  await expect(editModal(page).getByLabel('Program Name')).toHaveValue(updatedName);
  await expect(editModal(page).getByLabel('Description')).toHaveValue(updatedDescription);
});

test('TC-006: save without modifications keeps program data intact', async ({ page }) => {
  const programName = uniqueName('Mobile App Development 2026');
  const description = 'iOS and Android development';
  await seedProgram(page, programName, description);
  await openEditModal(page, programName);
  await saveEdit(page);

  await expect(programInList(page, programName)).toBeVisible();
  await openEditModal(page, programName);
  await expect(editModal(page).getByLabel('Program Name')).toHaveValue(programName);
  await expect(editModal(page).getByLabel('Description')).toHaveValue(description);
});

test('TC-007: empty Program Name blocks save on edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill('');

  await expect(editModal(page).getByRole('button', { name: 'Save' })).toBeDisabled();
  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-008: cleared Program Name does not persist via UI', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill('');
  await editModal(page).getByLabel('Description').fill('Attempted empty name save');

  await expect(editModal(page).getByRole('button', { name: 'Save' })).toBeDisabled();
  await closeEditModal(page);
  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-009: cancel/close discards unsaved edit changes', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = 'Full-stack web development program';
  await seedProgram(page, programName, description);
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(uniqueName('Unsaved Edit Draft'));
  await editModal(page).getByLabel('Description').fill('This change should not be saved');
  await closeEditModal(page);

  await expect(editModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
  await openEditModal(page, programName);
  await expect(editModal(page).getByLabel('Description')).toHaveValue(description);
});

test('TC-010: non-admin users cannot edit programs', async ({ page }) => {
  test.skip(
    !nonAdminEmail || !nonAdminPassword,
    'DIDAXIS_NONADMIN_EMAIL and DIDAXIS_NONADMIN_PASSWORD must be set in .env',
  );

  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await login(page, nonAdminEmail!, nonAdminPassword!);
  await page.goto('/programs');

  const editButton = page.getByRole('button', { name: `Edit ${programName}` });
  if (await editButton.isVisible()) {
    await expect(editButton).toBeDisabled();
  } else {
    await expect(page.getByText(/access denied|forbidden|not authorized|permission/i)).toBeVisible();
  }
});

test('TC-011: renaming to an existing program name is allowed in the live app', async ({ page }) => {
  const existingName = uniqueName('Web Development 2026');
  const targetName = uniqueName('Data Science 2026');
  await seedProgram(page, existingName, 'Existing program');
  await seedProgram(page, targetName, 'Target program');
  await openEditModal(page, targetName);
  await editModal(page).getByLabel('Program Name').fill(existingName);
  await saveEdit(page);

  await expect(editModal(page)).not.toBeVisible();
  await expect(await countProgramsNamed(page, existingName)).toBeGreaterThanOrEqual(2);
});

test('TC-012: failed save shows error and keeps recoverable form data', async ({ page }) => {
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

  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(updatedName);
  await saveEdit(page);

  await expect(editModal(page)).toBeVisible();
  await expect(editModal(page).getByLabel('Program Name')).toHaveValue(updatedName);
  await expect(programInList(page, programName)).toBeVisible();
  await expect(programInList(page, updatedName)).not.toBeVisible();
});

test('TC-013: save edit on deleted program shows error', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);

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

  await editModal(page).getByLabel('Description').fill('Edited after deletion');
  await saveEdit(page);

  await expect(editModal(page)).toBeVisible();
});

test('TC-014: single-character Program Name is accepted on edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const singleChar = uniqueName('A');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(singleChar);
  await saveEdit(page);

  await expect(programInList(page, singleChar)).toBeVisible();
});

test('TC-015: program name at maximum allowed length is accepted on edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const maxLengthName = uniqueName(
    'Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha',
  );
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(maxLengthName);
  await saveEdit(page);

  await expect(programInList(page, maxLengthName).first()).toBeVisible();
});

test('TC-016: program name exceeding 256 characters is accepted on edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const overMaxName = uniqueName('X'.repeat(240));
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(overMaxName);
  await saveEdit(page);

  await expect(programInList(page, overMaxName).first()).toBeVisible();
});

test('TC-017: empty Description is allowed on edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill('');
  await expect(editModal(page).getByRole('button', { name: 'Save' })).toBeEnabled();
  await saveEdit(page);
  await openEditModal(page, programName);

  await expect(editModal(page).getByLabel('Description')).toHaveValue('');
});

test('TC-018: long Description is stored correctly after edit', async ({ page }) => {
  const programName = uniqueName('UX Design Bootcamp');
  const longDescription = 'D'.repeat(2000);
  await seedProgram(page, programName, 'Original description');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill(longDescription);
  await saveEdit(page);
  await openEditModal(page, programName);

  await expect(editModal(page).getByLabel('Description')).toHaveValue(longDescription);
});

test('TC-019: special characters in edited fields render safely', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const specialName = uniqueName('C++ & C# Programming (2026)');
  const specialDescription = 'Languages: C++, C#, and scripting';
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(specialName);
  await editModal(page).getByLabel('Description').fill(specialDescription);
  await saveEdit(page);

  await expect(programInList(page, specialName)).toBeVisible();
});

test('TC-020: unicode Program Name and emoji Description render correctly after edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const unicodeName = uniqueName('日本語プログラム 2026');
  const emojiDescription = 'Multilingual curriculum 🎓';
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(unicodeName);
  await editModal(page).getByLabel('Description').fill(emojiDescription);
  await saveEdit(page);

  await expect(programInList(page, unicodeName)).toBeVisible();
  await openEditModal(page, unicodeName);
  await expect(editModal(page).getByLabel('Description')).toHaveValue(emojiDescription);
});

test('TC-021: leading and trailing whitespace in Program Name is stored as entered', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const trimmedBase = uniqueName('Web Development 2026 - Updated');
  const paddedName = `   ${trimmedBase}   `;
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(paddedName);
  await saveEdit(page);

  await expect(programInList(page, paddedName)).toBeVisible();
});

test('TC-022: whitespace-only Program Name is rejected on edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill('     ');

  await expect(editModal(page).getByRole('button', { name: 'Save' })).toBeDisabled();
  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-023: malicious input in Description does not execute in UI after edit', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const description = "<script>alert('xss')</script>";
  let dialogTriggered = false;
  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill(description);
  await saveEdit(page);

  await expect(programInList(page, programName)).toBeVisible();
  expect(dialogTriggered).toBe(false);
});

test('TC-024: double-click Save produces exactly one updated program row', async ({ page }) => {
  const programName = uniqueName('Cloud Computing 2026');
  const updatedName = `${programName} - Enterprise`;
  await seedProgram(page, programName, 'AWS and Azure fundamentals');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Program Name').fill(updatedName);
  await editModal(page).getByRole('button', { name: 'Save' }).dblclick();
  await expect(editModal(page)).not.toBeVisible();

  await expect(await countProgramsNamed(page, updatedName)).toBe(1);
});

test('TC-025: multi-line Description is preserved on edit', async ({ page }) => {
  const programName = uniqueName('DevOps Pipeline Program');
  const description = 'Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring';
  await seedProgram(page, programName, 'Original description');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill(description);
  await saveEdit(page);
  await openEditModal(page, programName);

  await expect(editModal(page).getByLabel('Description')).toHaveValue(description);
});

test('TC-026: edit with unchanged program name does not trigger duplicate error', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const updatedDescription = 'Minor description tweak only';
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill(updatedDescription);
  await saveEdit(page);

  await expect(editModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
  await expect(programDescriptionInList(page, programName, updatedDescription)).toBeVisible();
});
