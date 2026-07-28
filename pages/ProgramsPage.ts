import { Locator, Page } from '@playwright/test';
import { EditProgramModal } from './EditProgramModal';
import { NewProgramModal } from './NewProgramModal';

const PROGRAMS_URL = `${process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio'}/programs`;

export class ProgramsPage {
  readonly page: Page;
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;
  readonly heading: Locator;
  readonly newProgramButton: Locator;
  readonly newProgramButtonAlt: Locator;
  readonly programColumnHeader: Locator;
  readonly programsTable: Locator;
  readonly accessDeniedMessage: Locator;
  readonly selectProgramPrompt: Locator;
  readonly noProgramsCreatedMessage: Locator;
  readonly programsHeadingAny: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.newProgramButtonAlt = page.getByRole('button', { name: 'New Program' });
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });
    this.programsTable = page.getByRole('table');
    this.accessDeniedMessage = page.getByText(/access denied|forbidden|not authorized|permission/i);
    this.selectProgramPrompt = page.getByText(/select a program to manage semesters/i);
    this.noProgramsCreatedMessage = page.getByText(/no programs have been created/i);
    this.programsHeadingAny = page.getByRole('heading', { name: 'Programs' });
  }

  async goto(): Promise<void> {
    await this.page.goto(PROGRAMS_URL);
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
  }

  async createProgram(programName: string, description: string): Promise<void> {
    await this.openNewProgramForm();
    await this.newProgramModal.fill(programName, description);
    await this.newProgramModal.clickCreate();
  }

  programRow(programName: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell').getByText(programName, { exact: true }),
    });
  }

  programDescription(programName: string, description: string): Locator {
    return this.programRow(programName).getByRole('cell').getByText(description);
  }

  programNameInFirstCell(programName: string): Locator {
    return this.programRow(programName).getByRole('cell').first().getByText(programName, { exact: true });
  }

  tableDataRows(): Locator {
    return this.programsTable.getByRole('row').filter({ hasNot: this.page.getByRole('columnheader') });
  }

  editButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${programName}`, exact: true });
  }

  deleteButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${programName}`, exact: true });
  }

  async openEditModal(programName: string): Promise<void> {
    await this.editButton(programName).click();
  }

  async fillEditProgramName(programName: string): Promise<void> {
    await this.editProgramModal.fillProgramName(programName);
  }

  async fillEditDescription(description: string): Promise<void> {
    await this.editProgramModal.fillDescription(description);
  }

  async fillEditForm(programName: string, description: string): Promise<void> {
    await this.editProgramModal.fill(programName, description);
  }

  async saveEdit(): Promise<void> {
    await this.editProgramModal.clickSave();
  }

  async doubleClickSaveEdit(): Promise<void> {
    await this.editProgramModal.doubleClickSave();
  }

  async closeEditModal(): Promise<void> {
    if (await this.editProgramModal.cancelButton.isVisible()) {
      await this.editProgramModal.clickCancel();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  async closeNewProgramModal(): Promise<void> {
    if (await this.newProgramModal.cancelButton.isVisible()) {
      await this.newProgramModal.clickCancel();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  async clickDelete(programName: string): Promise<void> {
    await this.deleteButton(programName).click();
  }

  async confirmDelete(programName: string): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.clickDelete(programName);
  }

  async countProgramsNamed(programName: string): Promise<number> {
    return this.programRow(programName).count();
  }

  programNameParagraphs(programName: string): Locator {
    return this.programRow(programName).getByRole('cell').first().getByRole('paragraph');
  }

  textInTable(text: string): Locator {
    return this.programsTable.getByText(text);
  }

  programNameOnPage(programName: string): Locator {
    return this.page.getByText(programName, { exact: true });
  }

  programRowNameText(programName: string): Locator {
    return this.programRow(programName).getByText(programName, { exact: true });
  }

  programRowUuidText(programName: string): Locator {
    return this.programRow(programName).getByText(/^[0-9a-f-]{36}$/);
  }

  programRowNullPlaceholder(programName: string): Locator {
    return this.programRow(programName).getByText(/null|undefined/i);
  }

  programRowLineMatching(programName: string, pattern: RegExp | string): Locator {
    return this.programRow(programName).getByText(pattern);
  }
}
