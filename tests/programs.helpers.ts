import { Page } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { ProgramsPage } from '../pages/ProgramsPage';

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

export async function login(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
}

export async function loginAsAdmin(page: Page) {
  await login(page, adminEmail!, adminPassword!);
}

/** Wait for a successful POST /api/programs create response. */
export function waitForProgramCreateResponse(page: Page) {
  return page.waitForResponse(
    (res) =>
      /\/api\/programs\/?(\?|$)/.test(new URL(res.url()).pathname) &&
      res.request().method() === 'POST' &&
      res.ok(),
  );
}

export async function programIdFromCreateResponse(response: { json: () => Promise<any> }): Promise<string> {
  const body = await response.json();
  const id = body?.data?.id ?? body?.id;
  if (!id || typeof id !== 'string') {
    throw new Error(`Create response missing program id: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return id;
}

/** Create a program via UI and return its UUID from the POST response. */
export async function createProgramReturningId(
  page: Page,
  programName: string,
  description: string,
): Promise<string> {
  const programs = new ProgramsPage(page);
  const pending = waitForProgramCreateResponse(page);
  await programs.goto();
  await programs.createProgram(programName, description);
  return programIdFromCreateResponse(await pending);
}

export async function seedProgram(page: Page, programName: string, description: string) {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await programs.createProgram(programName, description);
}

export function acceptNextDialog(page: Page) {
  page.once('dialog', (dialog) => dialog.accept());
}

export function dismissNextDialog(page: Page) {
  page.once('dialog', (dialog) => dialog.dismiss());
}
