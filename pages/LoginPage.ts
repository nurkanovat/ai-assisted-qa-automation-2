import { Locator, Page } from '@playwright/test';

const LOGIN_URL = `${process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio'}/login`;

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signOutButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
  }

  async goto(): Promise<void> {
    await this.page.goto(LOGIN_URL);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async signIn(): Promise<void> {
    await this.signInButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.signIn();
  }
}
