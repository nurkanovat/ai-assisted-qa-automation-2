import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { test, expect } from '../fixtures/cleanup.fixture';
import {
  adminEmail,
  adminPassword,
  uniqueName,
  loginAsAdmin,
  createProgramReturningId,
  waitForProgramCreateResponse,
  programIdFromCreateResponse,
} from './programs.helpers';
import { ProgramsPage } from '../pages/ProgramsPage';
import { NewProgramModal } from '../pages/NewProgramModal';
import { EditProgramModal } from '../pages/EditProgramModal';

type TrackProgram = (uuid: string) => void;

function duplicateNameError(modal: NewProgramModal | EditProgramModal) {
  return modal.dialog
    .getByRole('alert')
    .or(modal.dialog.getByText(/already exists|duplicate|unique/i));
}

function programNameValidationError(modal: NewProgramModal | EditProgramModal) {
  return modal.dialog
    .getByRole('alert')
    .or(modal.dialog.getByText(/validation|maximum|100|length|too long|invalid/i));
}

async function seedTrackedProgram(
  page: Page,
  trackProgram: TrackProgram,
  programName: string,
  description: string,
): Promise<void> {
  trackProgram(await createProgramReturningId(page, programName, description));
}

async function createFromOpenModal(
  page: Page,
  trackProgram: TrackProgram,
  programs: ProgramsPage,
): Promise<void> {
  const pending = waitForProgramCreateResponse(page);
  await programs.newProgramModal.clickCreate();
  trackProgram(await programIdFromCreateResponse(await pending));
}

async function focusViaTab(page: Page, locator: { evaluate: (fn: (el: HTMLElement) => boolean) => Promise<boolean> }) {
  for (let i = 0; i < 30; i++) {
    if (await locator.evaluate((el) => el === document.activeElement)) {
      return;
    }
    await page.keyboard.press('Tab');
  }
}

test.describe('DS-3: Program name validation and duplicate prevention', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!adminEmail || !adminPassword, 'DIDAXIS_EMAIL and DIDAXIS_PASSWORD must be set in .env');
    await loginAsAdmin(page);
  });

  test.fixme(
    'TC-001: valid program name is accepted and program is created',
    {
      tag: '@a11y',
      annotation: {
        type: 'issue',
        description:
          'Known a11y bug: New Program modal close button has no accessible name (axe button-name)',
      },
    },
    async ({ page, trackProgram }) => {
      const programs = new ProgramsPage(page);
      const programName = uniqueName('Data Science 2026');
      const description = 'Introduction to statistics and machine learning';

      await programs.goto();
      await expect(programs.newProgramButton).toBeVisible();
      await focusViaTab(page, programs.newProgramButton);
      await expect(programs.newProgramButton).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(programs.newProgramModal.dialog).toBeVisible();

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .include(await programs.newProgramModal.axeIncludeSelector())
        .analyze();
      await expect(axeResults.violations).toEqual([]);

      await programs.newProgramModal.fill(programName, description);
      await createFromOpenModal(page, trackProgram, programs);

      await expect(programs.newProgramModal.dialog).not.toBeVisible();
      await expect(programs.programRow(programName)).toBeVisible();
    },
  );

  test('TC-002: program name with ampersand and hyphen is created successfully', async ({
    page,
    trackProgram,
  }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Informatique & IA - Niveau 2');
    const description = 'Programme de deuxième niveau en informatique et intelligence artificielle';

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test('TC-003: programming special characters in Program Name are accepted', async ({
    page,
    trackProgram,
  }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('C++ & C# Programming (2026)');
    const description = 'Languages: C++, C#, and scripting fundamentals';

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test('TC-004: unicode Program Name is accepted', async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('日本語プログラム 2026');
    const description = 'Multilingual curriculum track';

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test('TC-005: whitespace-only Program Name is rejected', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const orphanDescription = uniqueName('Whitespace-only name validation test');

    await programs.goto();
    await expect(programs.programColumnHeader).toBeVisible();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fillProgramName('   ');
    await programs.newProgramModal.fillDescription(orphanDescription);

    await expect(programs.newProgramModal.createButton).toBeDisabled();
    await expect(programs.textInTable(orphanDescription)).not.toBeVisible();
  });

  test('TC-006: empty Program Name prevents submission', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const orphanDescription = uniqueName('Description without a program name');

    await programs.goto();
    await expect(programs.programColumnHeader).toBeVisible();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fillDescription(orphanDescription);

    await expect(programs.newProgramModal.createButton).toBeDisabled();
    await expect(programs.textInTable(orphanDescription)).not.toBeVisible();
  });

  test.fixme(
    'TC-007: duplicate Program Name on create shows error',
    {
      annotation: {
        type: 'issue',
        description: 'Known product bug: duplicate program names are accepted on create with no error',
      },
    },
    async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const duplicateDescription = uniqueName('Duplicate attempt — second web dev cohort');

    await seedTrackedProgram(page, trackProgram, programName, 'Full-stack web development program');
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, duplicateDescription);
    await programs.newProgramModal.clickCreate();

    await expect(programs.newProgramModal.dialog).toBeVisible();
    await expect(duplicateNameError(programs.newProgramModal)).toBeVisible();
    await expect(programs.programRow(programName)).toHaveCount(1);
    await expect(programs.textInTable(duplicateDescription)).not.toBeVisible();
  },
  );

  test.fixme(
    'TC-008: duplicate error retains form data for correction',
    {
      annotation: {
        type: 'issue',
        description:
          'Known product bug: duplicate create closes modal instead of showing error and retaining form data',
      },
    },
    async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const cohortName = `${programName} - Cohort B`;
    const description = 'Full-stack web development program — cohort B';

    await seedTrackedProgram(page, trackProgram, programName, 'Full-stack web development program');
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);
    await programs.newProgramModal.clickCreate();

    await expect(duplicateNameError(programs.newProgramModal)).toBeVisible();
    await expect(programs.newProgramModal.descriptionInput).toHaveValue(description);

    await programs.newProgramModal.fillProgramName(cohortName);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(cohortName)).toBeVisible();
  },
  );

  test('TC-009: tab-only Program Name is rejected as empty', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const orphanDescription = uniqueName('Tab-only name validation test');

    await programs.goto();
    await expect(programs.programColumnHeader).toBeVisible();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fillProgramName('\t\t\t');
    await programs.newProgramModal.fillDescription(orphanDescription);

    await expect(programs.newProgramModal.createButton).toBeDisabled();
    await expect(programs.textInTable(orphanDescription)).not.toBeVisible();
  });

  test('TC-010: mixed whitespace-only Program Name is rejected', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const orphanDescription = uniqueName('Mixed whitespace validation test');

    await programs.goto();
    await expect(programs.programColumnHeader).toBeVisible();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fillProgramName('  \t  \t  ');
    await programs.newProgramModal.fillDescription(orphanDescription);

    await expect(programs.newProgramModal.createButton).toBeDisabled();
    await expect(programs.textInTable(orphanDescription)).not.toBeVisible();
  });

  test.fixme(
    'TC-011: duplicate rejection leaves database unchanged after refresh',
    {
      annotation: {
        type: 'issue',
        description: 'Known product bug: duplicate create persists a second row after refresh',
      },
    },
    async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const duplicateDescription = uniqueName('Should not persist on duplicate rejection');

    await seedTrackedProgram(page, trackProgram, programName, 'Full-stack web development program');
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, duplicateDescription);
    await programs.newProgramModal.clickCreate();

    await expect(duplicateNameError(programs.newProgramModal)).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/programs/);
    await expect(programs.programRow(programName)).toHaveCount(1);
  },
  );

  test('TC-012: duplicate check rejects case-variant names', async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const lowercaseName = programName.toLowerCase();
    const duplicateDescription = uniqueName('Lowercase duplicate attempt');

    await seedTrackedProgram(page, trackProgram, programName, 'Original casing');
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(lowercaseName, duplicateDescription);
    await programs.newProgramModal.clickCreate();

    await expect(duplicateNameError(programs.newProgramModal)).toBeVisible();
    await expect(programs.programRow(programName)).toHaveCount(1);
    await expect(programs.textInTable(duplicateDescription)).not.toBeVisible();
  });

  test.fixme(
    'TC-013: duplicate detected after trimming padded program name',
    {
      annotation: {
        type: 'issue',
        description:
          'Known product bug: padded duplicate name is accepted instead of trimmed+rejected',
      },
    },
    async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const paddedName = `   ${programName}   `;
    const duplicateDescription = uniqueName('Padded duplicate name attempt');

    await seedTrackedProgram(page, trackProgram, programName, 'Original program');
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(paddedName, duplicateDescription);
    await programs.newProgramModal.clickCreate();

    await expect(duplicateNameError(programs.newProgramModal)).toBeVisible();
    await expect(programs.programRow(programName)).toHaveCount(1);
    await expect(programs.programRow(paddedName)).toHaveCount(0);
  },
  );

  test.fixme(
    'TC-014: valid padded program name is trimmed on create',
    {
      annotation: {
        type: 'issue',
        description:
          'Known product bug: leading/trailing spaces are retained on create instead of trimmed',
      },
    },
    async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const trimmedName = uniqueName('Cybersecurity Fundamentals');
    const paddedName = `   ${trimmedName}   `;
    const description = 'Network security and ethical hacking basics';

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(paddedName, description);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(trimmedName)).toBeVisible();
    await expect(programs.programRow(paddedName)).toHaveCount(0);
  },
  );

  test('TC-015: single-character Program Name is accepted', async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('A');
    const description = 'Single character name boundary test';

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test('TC-016: program name at maximum allowed length is accepted', async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const suffix = String(Date.now());
    const baseName = 'A'.repeat(Math.max(1, 100 - suffix.length - 1));
    const programName = `${baseName}-${suffix}`;
    const description = 'Max length name validation test';

    expect(programName.length).toBe(100);

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(programName).first()).toBeVisible();
  });

  test('TC-017: program name exceeding maximum length is rejected', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = `L${'X'.repeat(119)}`;
    expect(programName.length).toBe(120);
    const orphanDescription = uniqueName('Over max length validation test');

    await programs.goto();
    await expect(programs.programColumnHeader).toBeVisible();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, orphanDescription);
    await programs.newProgramModal.clickCreate();

    await expect(programNameValidationError(programs.newProgramModal)).toBeVisible();
    await expect(programs.programRow(programName)).toHaveCount(0);
    await expect(programs.textInTable(orphanDescription)).not.toBeVisible();
  });

  test.fixme(
    'TC-018: duplicate program name rejected on edit',
    {
      annotation: {
        type: 'issue',
        description: 'Known product bug: renaming to an existing program name is allowed on edit',
      },
    },
    async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const existingName = uniqueName('Web Development 2026');
    const targetName = uniqueName('Data Science 2026');

    await seedTrackedProgram(page, trackProgram, existingName, 'Existing program');
    trackProgram(await createProgramReturningId(page, targetName, 'Target program'));

    await programs.openEditModal(targetName);
    await programs.fillEditProgramName(existingName);
    await programs.saveEdit();

    await expect(duplicateNameError(programs.editProgramModal)).toBeVisible();
    await expect(programs.programRow(targetName)).toBeVisible();
    await expect(programs.programRow(existingName)).toHaveCount(1);
  },
  );

  test('TC-019: edit with same program name does not trigger duplicate error', async ({
    page,
    trackProgram,
  }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const updatedDescription = 'Updated description only';

    await seedTrackedProgram(page, trackProgram, programName, 'Full-stack web development program');
    await programs.openEditModal(programName);
    await programs.fillEditDescription(updatedDescription);
    await programs.saveEdit();

    await expect(programs.editProgramModal.dialog).not.toBeVisible();
    await expect(duplicateNameError(programs.editProgramModal)).not.toBeVisible();
    await expect(programs.programDescription(programName, updatedDescription)).toBeVisible();
  });

  test('TC-020: emoji in Program Name is accepted', async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Cloud Computing 2026 🎓');
    const description = 'Cloud platforms and DevOps';

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, description);
    await createFromOpenModal(page, trackProgram, programs);

    await expect(programs.programRow(programName)).toBeVisible();
  });

  test('TC-021: HTML in program name is sanitized or rejected', async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const xssToken = `xss-${Date.now()}`;
    const xssName = `<script>alert('${xssToken}')</script>`;
    const description = uniqueName('Security validation test');
    let dialogTriggered = false;

    page.on('dialog', () => {
      dialogTriggered = true;
    });

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(xssName, description);

    const createResponse = page
      .waitForResponse(
        (res) =>
          /\/api\/programs\/?(\?|$)/.test(new URL(res.url()).pathname) &&
          res.request().method() === 'POST',
        { timeout: 5000 },
      )
      .catch(() => null);
    await programs.newProgramModal.clickCreate();

    expect(dialogTriggered).toBe(false);

    const response = await createResponse;
    if (response?.ok()) {
      trackProgram(await programIdFromCreateResponse(response));
      await expect(programs.programRow(xssName)).toBeVisible();
      await expect(programs.programDescription(xssName, description)).toBeVisible();
    } else {
      await expect(programNameValidationError(programs.newProgramModal)).toBeVisible();
      await expect(programs.programRow(xssName)).toHaveCount(0);
    }
  });

  test.fixme(
    'TC-022: double submit on duplicate name does not create extra records',
    {
      annotation: {
        type: 'issue',
        description:
          'Known product bug: double-click Create on a duplicate name creates extra rows',
      },
    },
    async ({ page, trackProgram }) => {
    const programs = new ProgramsPage(page);
    const programName = uniqueName('Web Development 2026');
    const duplicateDescription = uniqueName('Double-click duplicate test');

    await seedTrackedProgram(page, trackProgram, programName, 'Full-stack web development program');
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(programName, duplicateDescription);
    await programs.newProgramModal.doubleClickCreate();

    await expect(duplicateNameError(programs.newProgramModal)).toBeVisible();
    await expect(programs.programRow(programName)).toHaveCount(1);
    await expect(programs.textInTable(duplicateDescription)).not.toBeVisible();
  },
  );
});
