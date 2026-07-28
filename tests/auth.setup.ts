import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { ProgramsPage } from '../pages/ProgramsPage';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;

  setup.skip(!email || !password, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set');

  const loginPage = new LoginPage(page);
  await loginPage.login(email!, password!);
  await expect(loginPage.signOutButton).toBeVisible();

  const programs = new ProgramsPage(page);
  await programs.goto();

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
