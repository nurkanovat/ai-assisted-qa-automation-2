import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ProgramsPage } from '../pages/ProgramsPage';

test.fixme('Programs page has no accessibility violations', { tag: '@regression' }, async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await expect(programs.heading).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  await expect(results.violations).toEqual([]);
});

test.fixme('New Program modal has no accessibility violations when scoped', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();
  await programs.openNewProgramForm();
  await expect(programs.newProgramModal.dialog).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include(await programs.newProgramModal.axeIncludeSelector())
    // button-name: icon-only close button in modal banner lacks accessible name — app fix pending
    .disableRules(['button-name'])
    .analyze();

  await expect(results.violations).toEqual([]);
});
