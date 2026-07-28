import { Locator, Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly showAiConfigButton: Locator;
  readonly hideAiConfigButton: Locator;
  readonly closeButton: Locator;
  readonly totalProgramHoursInput: Locator;
  readonly defaultSessionHoursInput: Locator;
  readonly defaultExamHoursInput: Locator;
  readonly targetAudienceInput: Locator;
  readonly focusAreasInput: Locator;
  readonly syncAsyncRatioLabel: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'New Program' });
    this.programNameInput = this.dialog.getByLabel('Program Name');
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.showAiConfigButton = this.dialog.getByRole('button', { name: '▸ Show AI Generation Config' });
    this.hideAiConfigButton = this.dialog.getByRole('button', { name: '▾ Hide AI Generation Config' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
    this.totalProgramHoursInput = this.dialog.getByLabel('Total Program Hours');
    this.defaultSessionHoursInput = this.dialog.getByLabel('Default Session Hours');
    this.defaultExamHoursInput = this.dialog.getByLabel('Default Exam Hours');
    this.targetAudienceInput = this.dialog.getByLabel('Target Audience');
    this.focusAreasInput = this.dialog.getByLabel('Focus Areas');
    this.syncAsyncRatioLabel = this.dialog.getByText(/Sync\/Async Ratio:/);
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

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async doubleClickCreate(): Promise<void> {
    await this.createButton.dblclick();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async closeWithX(): Promise<void> {
    await this.closeButton.click();
  }

  async showAiConfig(): Promise<void> {
    await this.showAiConfigButton.click();
  }

  async hideAiConfig(): Promise<void> {
    await this.hideAiConfigButton.click();
  }
}
