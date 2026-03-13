import { expect as baseExpect, Locator, Page } from '@playwright/test';

const expect = baseExpect.configure({ timeout: 15_000 });

export class LoginPage {
  readonly page: Page;
  readonly cookieTitle: Locator;
  readonly cookieAcceptButton: Locator;
  readonly usernameInput: Locator;
  readonly userStepNextLink: Locator;
  readonly passwordTitle: Locator;
  readonly passwordInput: Locator;
  readonly passwordStepNextLink: Locator;
  readonly userOptionsButton: Locator;
  readonly duplicateSessionTitle: Locator;
  readonly duplicateSessionContinueButton: Locator;
  readonly trustedDeviceTitle: Locator;
  readonly trustedDeviceAcceptButton: Locator;
  readonly loginErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cookieTitle = page.getByText('Uso de cookies', { exact: true });
    this.cookieAcceptButton = page.locator('#modalCookie .ipswich-main-buttons-link');
    this.usernameInput = page.getByRole('textbox', { name: 'Ingrese su usuario' });
    this.userStepNextLink = page.locator('icb-login-step-user a').filter({ hasText: 'Siguiente' });
    this.passwordTitle = page.locator('icb-wizard-step-one-by-one').filter({ hasText: 'Contraseña Teclado virtual' }).locator('wizard-title');
    this.passwordInput = page.getByRole('textbox', { name: 'Ingrese su contraseña' });
    this.passwordStepNextLink = page.locator('icb-login-step-password a').filter({ hasText: 'Siguiente' });
    this.userOptionsButton = page.getByTitle('Opciones de usuario');
    this.duplicateSessionTitle = page.getByText('Advertencia de sesión');
    this.duplicateSessionContinueButton = page.locator('icb-login > icb-modalpopup > .parma > .parma-content-bottom > .parma-content-buttons > icb-button > .ipswich-main-buttons-link').filter({ hasText: 'Continuar' });
    this.trustedDeviceTitle = page.locator('icb-login-step-password').getByText('Dispositivo de confianza', { exact: true });
    this.trustedDeviceAcceptButton = page.locator('a').filter({ hasText: 'Aceptar' }).nth(3);
    this.loginErrorMessage = page.getByRole('heading', { name: 'Error: El usuario y contraseñ' });
  }

  async gotoLogin(loginUrl: string): Promise<void> {
    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async registerCookieBannerHandler(): Promise<void> {
    await this.page.addLocatorHandler(this.cookieTitle, async () => {
      if (await this.cookieTitle.isVisible().catch(() => false)) {
        await this.cookieAcceptButton.click();
        await expect(this.cookieTitle).toBeHidden({ timeout: 10_000 });
      }
    });
  }

  async acceptCookiesIfVisible(): Promise<void> {
    try {
      await this.cookieTitle.waitFor({ state: 'visible', timeout: 20_000 });
      await expect(this.cookieTitle).toBeVisible();
      await this.cookieAcceptButton.click();
      await expect(this.cookieTitle).not.toBeVisible();
    } catch {
    }
  }

  async waitForUsernameInput(): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible', timeout: 100_000 });
    await expect(this.usernameInput).toBeVisible();
    await expect(this.usernameInput).toBeEditable();
  }

  async submitUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
    await expect(this.usernameInput).toHaveValue(username);
    await this.userStepNextLink.click();
  }

  async waitForPasswordStep(): Promise<void> {
    await expect(this.passwordTitle).toContainText('Contraseña');
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toBeEditable();
  }

  async submitPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);
    await this.passwordStepNextLink.click();
  }

  async waitForLoginError(): Promise<void> {
    await this.loginErrorMessage.waitFor({ state: 'visible', timeout: 20_000 });
    await expect(this.loginErrorMessage).toBeVisible();
  }

  async handleTrustedDeviceIfVisible(): Promise<void> {
    try {
      await this.trustedDeviceTitle.waitFor({ state: 'visible', timeout: 20_000 });
      await expect(this.trustedDeviceTitle).toBeVisible();
      await this.trustedDeviceAcceptButton.click();
      await expect(this.trustedDeviceTitle).not.toBeVisible();
    } catch {
      // Modal not present, continue normally
    }
  }

  async handleDuplicateSessionIfVisible(): Promise<void> {
    try {
      await this.duplicateSessionTitle.waitFor({ state: 'visible', timeout: 20_000 });
      await expect(this.duplicateSessionTitle).toBeVisible();
      await this.duplicateSessionContinueButton.click();
      await expect(this.duplicateSessionTitle).not.toBeVisible();
    } catch {
      // Modal not present, continue normally
    }
  }

  async waitForDashboard(): Promise<void> {
    await this.page.waitForURL(/#\/administrationGeneral\/home/, { timeout: 80_000 });
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.userOptionsButton).toBeVisible();
  }
}