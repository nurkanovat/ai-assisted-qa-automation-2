import { Locator, Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog').filter({ has: page.getByText('Edit Program') });
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fillProgramName(programName: string): Promise<void> {
    await this.programNameInput.fill(programName);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async fill(programName: string, description: string): Promise<void> {
    await this.fillProgramName(programName);
    await this.fillDescription(description);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async doubleClickSave(): Promise<void> {
    await this.saveButton.dblclick();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
