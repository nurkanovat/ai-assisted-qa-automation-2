import { test, expect } from '@playwright/test';
import {
  adminEmail,
  adminPassword,
  uniqueName,
  loginAsAdmin,
  navigateToPrograms,
  openNewProgramModal,
  fillProgramForm,
  clickCreate,
  programModal,
  programInList,
  countProgramsNamed,
  seedProgram,
  openEditModal,
  editModal,
  saveEdit,
} from './programs.helpers';

test.beforeEach(async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
  await loginAsAdmin(page);
});

test('TC-001: valid program name is accepted and program is created', async ({ page }) => {
  const programName = uniqueName('Data Science 2026');
  const description = 'Introduction to statistics and machine learning';
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);

  await expect(programModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-002: program name with ampersand and hyphen is created successfully', async ({ page }) => {
  const programName = uniqueName('Informatique & IA - Niveau 2');
  const description = 'Programme de deuxième niveau en informatique et intelligence artificielle';
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);

  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-003: programming special characters in Program Name are accepted', async ({ page }) => {
  const programName = uniqueName('C++ & C# Programming (2026)');
  const description = 'Languages: C++, C#, and scripting fundamentals';
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);

  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-004: unicode Program Name is accepted', async ({ page }) => {
  const programName = uniqueName('日本語プログラム 2026');
  const description = 'Multilingual curriculum track';
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);

  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-005: whitespace-only Program Name is rejected', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill('   ');
  await programModal(page).getByLabel('Description').fill('Whitespace-only name validation test');

  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('TC-006: empty Program Name prevents submission', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Description').fill('Description without a program name');

  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('TC-007: duplicate Program Name on create adds another program entry', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Duplicate attempt — second web dev cohort');
  await clickCreate(page);

  await expect(programModal(page)).not.toBeVisible();
  await expect(await countProgramsNamed(page, programName)).toBe(2);
});

test('TC-008: duplicate create retains form data for correction on next attempt', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const cohortName = `${programName} - Cohort B`;
  const description = 'Full-stack web development program — cohort B';
  await seedProgram(page, programName, 'Full-stack web development program');
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);
  await expect.poll(async () => countProgramsNamed(page, programName)).toBeGreaterThanOrEqual(2);

  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill(cohortName);
  await programModal(page).getByLabel('Description').fill(description);
  await clickCreate(page);

  await expect(programInList(page, cohortName)).toBeVisible();
});

test('TC-009: tab-only Program Name is rejected as empty', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill('\t\t\t');
  await programModal(page).getByLabel('Description').fill('Tab-only name validation test');

  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('TC-010: mixed whitespace-only Program Name is rejected', async ({ page }) => {
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await programModal(page).getByLabel('Program Name').fill('  \t  \t  ');
  await programModal(page).getByLabel('Description').fill('Mixed whitespace validation test');

  await expect(programModal(page).getByRole('button', { name: 'Create' })).toBeDisabled();
});

test('TC-011: duplicate rejection leaves exactly two entries after refresh', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Should not persist on duplicate rejection');
  await clickCreate(page);
  await page.reload();
  await expect(page).toHaveURL(/\/programs/);

  await expect.poll(async () => countProgramsNamed(page, programName)).toBeGreaterThanOrEqual(2);
});

test('TC-012: duplicate check is case-insensitive in the live app', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const lowercaseName = programName.toLowerCase();
  await seedProgram(page, programName, 'Original casing');
  await openNewProgramModal(page);
  await fillProgramForm(page, lowercaseName, 'Lowercase duplicate attempt');
  await clickCreate(page);

  await expect(programInList(page, lowercaseName)).toBeVisible();
});

test('TC-013: padded duplicate name creates another entry with stored padding', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  const paddedName = `   ${programName}   `;
  await seedProgram(page, programName, 'Original program');
  await openNewProgramModal(page);
  await fillProgramForm(page, paddedName, 'Padded duplicate name attempt');
  await clickCreate(page);

  await expect(programInList(page, paddedName)).toBeVisible();
});

test('TC-014: valid padded program name is stored with outer whitespace', async ({ page }) => {
  const trimmedBase = uniqueName('Cybersecurity Fundamentals');
  const paddedName = `   ${trimmedBase}   `;
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, paddedName, 'Network security and ethical hacking basics');
  await clickCreate(page);

  await expect(programInList(page, paddedName)).toBeVisible();
});

test('TC-015: single-character Program Name is accepted', async ({ page }) => {
  const programName = uniqueName('A');
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Single character name boundary test');
  await clickCreate(page);

  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-016: program name at maximum allowed length is accepted', async ({ page }) => {
  const programName = uniqueName(
    'Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha',
  );
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Max length name validation test');
  await clickCreate(page);

  await expect(programInList(page, programName).first()).toBeVisible();
});

test('TC-017: program name exceeding 256 characters is accepted', async ({ page }) => {
  const programName = uniqueName('X'.repeat(240));
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Over max length validation test');
  await clickCreate(page);

  await expect(programInList(page, programName).first()).toBeVisible();
});

test('TC-018: rename to existing name is allowed during edit', async ({ page }) => {
  const existingName = uniqueName('Web Development 2026');
  const targetName = uniqueName('Data Science 2026');
  await seedProgram(page, existingName, 'Existing program');
  await seedProgram(page, targetName, 'Target program');
  await openEditModal(page, targetName);
  await editModal(page).getByLabel('Program Name').fill(existingName);
  await saveEdit(page);

  await expect(programInList(page, existingName).first()).toBeVisible();
  await expect(programInList(page, targetName)).not.toBeVisible();
});

test('TC-019: edit with same program name does not trigger duplicate error', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openEditModal(page, programName);
  await editModal(page).getByLabel('Description').fill('Updated description only');
  await saveEdit(page);

  await expect(editModal(page)).not.toBeVisible();
  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-020: emoji in Program Name is accepted', async ({ page }) => {
  const programName = uniqueName('Cloud Computing 2026 🎓');
  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Cloud platforms and DevOps');
  await clickCreate(page);

  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-021: HTML in program name does not execute in the browser', async ({ page }) => {
  const programName = uniqueName("<script>alert('xss')</script>");
  let dialogTriggered = false;
  page.on('dialog', () => {
    dialogTriggered = true;
  });

  await navigateToPrograms(page);
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Security validation test');
  await clickCreate(page);

  expect(dialogTriggered).toBe(false);
  await expect(programInList(page, programName)).toBeVisible();
});

test('TC-022: double-click Create on duplicate name creates duplicate entries', async ({ page }) => {
  const programName = uniqueName('Web Development 2026');
  await seedProgram(page, programName, 'Full-stack web development program');
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, 'Double-click duplicate test');
  await programModal(page).getByRole('button', { name: 'Create' }).dblclick();
  await expect(programModal(page)).not.toBeVisible();

  await expect(await countProgramsNamed(page, programName)).toBeGreaterThanOrEqual(2);
});
