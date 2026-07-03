import { expect, Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
export const LOGIN_URL = `${BASE_URL}/login`;
export const PROGRAMS_URL = `${BASE_URL}/programs`;

export const adminEmail = process.env.DIDAXIS_EMAIL;
export const adminPassword = process.env.DIDAXIS_PASSWORD;
export const nonAdminEmail = process.env.DIDAXIS_NONADMIN_EMAIL;
export const nonAdminPassword = process.env.DIDAXIS_NONADMIN_PASSWORD;

export function uniqueName(base: string): string {
  return `${base}-${Date.now()}`;
}

export function programModal(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

export function editModal(page: Page) {
  return page.getByRole('dialog').filter({ hasText: 'Edit Program' });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto(LOGIN_URL);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

export async function loginAsAdmin(page: Page) {
  await login(page, adminEmail!, adminPassword!);
}

export async function navigateToPrograms(page: Page) {
  await page.goto(PROGRAMS_URL);
  await expect(page).toHaveURL(/\/programs/);
}

export async function openNewProgramModal(page: Page) {
  await page.getByRole('button', { name: 'New Program' }).click();
  const modal = programModal(page);
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel('Program Name')).toBeVisible();
  await expect(modal.getByLabel('Description')).toBeVisible();
}

export async function fillProgramForm(page: Page, programName: string, description: string) {
  const modal = programModal(page);
  await modal.getByLabel('Program Name').fill(programName);
  await modal.getByLabel('Description').fill(description);
}

export async function clickCreate(page: Page) {
  await programModal(page).getByRole('button', { name: 'Create' }).click();
}

export async function createProgram(page: Page, programName: string, description: string) {
  await openNewProgramModal(page);
  await fillProgramForm(page, programName, description);
  await clickCreate(page);
  await expect(programModal(page)).not.toBeVisible();
}

export async function seedProgram(page: Page, programName: string, description: string) {
  await navigateToPrograms(page);
  await createProgram(page, programName, description);
}

export function programInList(page: Page, programName: string) {
  return page.getByRole('row').filter({ has: page.getByText(programName, { exact: true }) });
}

export function programDescriptionInList(page: Page, programName: string, description: string) {
  return programInList(page, programName).getByText(description);
}

export async function countProgramsNamed(page: Page, programName: string) {
  return programInList(page, programName).count();
}

export async function openEditModal(page: Page, programName: string) {
  await page.getByRole('button', { name: `Edit ${programName}`, exact: true }).click();
  const modal = editModal(page);
  await expect(modal).toBeVisible();
  await expect(modal.getByLabel('Program Name')).toBeVisible();
  return modal;
}

export async function saveEdit(page: Page) {
  await editModal(page).getByRole('button', { name: 'Save' }).click();
}

export async function closeEditModal(page: Page) {
  const modal = editModal(page);
  const cancelButton = modal.getByRole('button', { name: 'Cancel' });
  if (await cancelButton.isVisible()) {
    await cancelButton.click();
  } else {
    await page.keyboard.press('Escape');
  }
}

export function acceptNextDialog(page: Page) {
  page.once('dialog', (dialog) => dialog.accept());
}

export function dismissNextDialog(page: Page) {
  page.once('dialog', (dialog) => dialog.dismiss());
}

export async function clickDeleteIcon(page: Page, programName: string) {
  await page.getByRole('button', { name: `Delete ${programName}`, exact: true }).click();
}

export async function confirmDelete(page: Page, programName: string) {
  acceptNextDialog(page);
  await clickDeleteIcon(page, programName);
  await expect(programInList(page, programName)).not.toBeVisible();
}

export async function cancelDelete(page: Page, programName: string) {
  dismissNextDialog(page);
  await clickDeleteIcon(page, programName);
}

export async function expectNonAdminProgramsAccessDenied(page: Page) {
  const newProgramButton = page.getByRole('button', { name: 'New Program' });
  const accessDenied = page.getByText(/access denied|forbidden|not authorized|permission/i);

  if (await newProgramButton.isVisible()) {
    await expect(newProgramButton).toBeDisabled();
  } else if (await accessDenied.isVisible()) {
    await expect(accessDenied).toBeVisible();
  } else {
    await expect(page).not.toHaveURL(/\/programs/);
  }
}
