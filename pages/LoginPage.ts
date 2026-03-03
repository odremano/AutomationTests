import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Traslado de Puntos login flow.
 *
 * The application shows several loading phases before the login form appears:
 *   1. Blue splash screen (~35 s)
 *   2. Blank white screen while the SPA bootstraps (~40 s)
 *   3. Login form with Ficohsa header
 *
 * All waits use explicit conditions (visibility / URL / networkidle).
 */
export class LoginPage {
  /* ── Locators (lazy, evaluated only when used) ────────────────────────── */

  /** Username text field (step 1) */
  readonly usernameInput: Locator;

  /** Password text field (step 2) */
  readonly passwordInput: Locator;

  /** "Siguiente" button on the username step */
  readonly usernameNextButton: Locator;

  /** "Siguiente" button on the password step */
  readonly passwordNextButton: Locator;

  /** Cookie consent "Continuar" button */
  readonly cookiesAcceptButton: Locator;

  /** incorrectUserText confirmation text (bad scenario interaction) */
  readonly incorrectUserText: Locator;

  /** Fraud / trust-device alert "Aceptar" button */
  readonly fraudAlertAcceptButton: Locator;

  /** Trust-device popup text ("No fue posible verificar su dispositivo") */
  readonly trustDeviceText: Locator;

  /** Trust-device registration popup text ("Registro de dispositivo de confianza") */
  readonly trustDeviceRegistrationText: Locator;

  /** Trust-device registration "No" button */
  readonly trustDeviceRegistrationNoButton: Locator;

  /** Duplicate session warning popup title */
  readonly duplicateSessionText: Locator;

  /** Duplicate session "Continuar" button */
  readonly duplicateSessionContinueButton: Locator;

  /** User options button visible only after successful login */
  readonly userOptionsButton: Locator;

  /** Main content area shown after login */
  readonly mainContent: Locator;

  /* ── Timeouts tuned to the app's real behaviour ───────────────────────── */

  /** Max time to wait for the login form to appear after navigation */
  private static readonly LOGIN_FORM_TIMEOUT = 180_000;

  /** Max time to wait for the SPA's initial network activity to settle */
  private static readonly NETWORK_IDLE_TIMEOUT = 120_000;

  /** Max time to wait for password step to render */
  private static readonly PASSWORD_STEP_TIMEOUT = 30_000;

  /** Max time to wait for the dashboard after submitting credentials */
  private static readonly DASHBOARD_TIMEOUT = 70_000;

  /** Short timeout for optional modals / popups */
  private static readonly POPUP_TIMEOUT = 5_000;

  /** Timeout for the duplicate session popup (takes longer to appear) */
  private static readonly DUPLICATE_SESSION_TIMEOUT = 25_000;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByRole('textbox', { name: /Ingrese su usuario/i });

    this.passwordInput = page.getByRole('textbox', {
      name: /Ingrese su contrase[ñn]a/i,
    });

    this.usernameNextButton = page.getByText('Siguiente', { exact: true }).first();

    this.passwordNextButton = page
      .locator('icb-login-step-password a')
      .filter({ hasText: 'Siguiente' });

    this.cookiesAcceptButton = page.getByText('Continuar', { exact: true }).last();

    this.incorrectUserText = page.getByRole('heading', { name: 'Error: El usuario y contraseñ' });

    this.fraudAlertAcceptButton = page.getByText('Aceptar', { exact: true }).last();

    this.trustDeviceText = page.getByText('No fue posible verificar su dispositivo', {
      exact: false,
    });

    this.trustDeviceRegistrationText = page.getByText('Registro de dispositivo de').first();

    this.trustDeviceRegistrationNoButton = page.locator('a').filter({ hasText: 'No' }).nth(2);

    this.duplicateSessionText = page.getByText('Advertencia de sesión', { exact: false });

    this.duplicateSessionContinueButton = page
      .locator('icb-login > icb-modalpopup > .parma > .parma-content-bottom > .parma-content-buttons > icb-button > .ipswich-main-buttons-link')
      .first();

    this.userOptionsButton = page
      .getByTitle('Opciones de usuario')
      .or(page.getByText('Opciones de usuario', { exact: false }))
      .first();

    this.mainContent = page.locator('.jyvaskyla-default-content').first();
  }

  /* ── Public workflow methods ───────────────────────────────────────────── */

  /**
   * Navigate to the login page and wait until the login form is fully rendered.
   * Handles the blue splash → blank screen → login form transition automatically.
   */
  async navigate(url: string): Promise<void> {
    // 'commit' resolves on the first server byte → maximises time for the SPA
    await this.page.goto(url, { waitUntil: 'commit' });

    // The SPA goes through splash → blank → login form.
    // We skip networkidle because:
    //   • It can resolve during a brief pause in the splash (false positive)
    //   • It can block up to 120s if the app has background polling
    //   • Both cases eat into our timeout budget without adding reliability
    //
    // Instead, wait directly for the concrete element we need.
    // Playwright's waitFor keeps polling the DOM regardless of network state.
    await this.usernameInput.waitFor({
      state: 'visible',
      timeout: LoginPage.LOGIN_FORM_TIMEOUT,
    });

    await expect(this.usernameInput).toBeEnabled();
  }

  /**
   * Dismiss the cookie consent modal if it is visible.
   * Safe to call multiple times — silently succeeds when the modal is absent.
   */
  async dismissCookiesIfPresent(): Promise<void> {
    // Give the modal up to POPUP_TIMEOUT seconds to appear (it animates in)
    const isVisible = await this.cookiesAcceptButton
      .waitFor({ state: 'visible', timeout: LoginPage.POPUP_TIMEOUT })
      .then(() => true)
      .catch(() => false);

    if (isVisible) {
      await this.cookiesAcceptButton.click();
      // Wait for the modal to disappear so it doesn't block following clicks
      await this.cookiesAcceptButton
        .waitFor({ state: 'hidden', timeout: LoginPage.POPUP_TIMEOUT })
        .catch(() => {/* already hidden */});
    }
  }

  /**
   * Fill the username and advance to the password step.
   */
  async enterUsername(username: string): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.usernameInput).toBeEnabled();

    await this.usernameInput.fill(username);
    await expect(this.usernameInput).toHaveValue(username);

    // Click "Siguiente"; fall back to Enter if the button is overlaid
    await this.usernameNextButton
      .click()
      .catch(async () => {
        await this.usernameInput.press('Enter');
      });

    // Cookies modal may reappear between steps
    await this.dismissCookiesIfPresent();

    // Wait for the password field to confirm step transition
    await this.passwordInput.waitFor({
      state: 'visible',
      timeout: LoginPage.PASSWORD_STEP_TIMEOUT,
    });
  }

  /**
   * Fill the password and submit the login form.
   */
  async enterPassword(password: string): Promise<void> {
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toBeEnabled();

    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);

    // Submit the password step
    await this.passwordNextButton
      .click({ timeout: LoginPage.PASSWORD_STEP_TIMEOUT })
      .catch(async () => {
        // Fallback: if the link-button is blocked, press Enter on the input
        await this.passwordInput.press('Enter');
      });
  }

  /**
   * Dismiss the "Advertencia de sesión duplicada" popup if present.
   * This appears when the same user already has an active session elsewhere.
   */
  async dismissDuplicateSessionIfPresent(): Promise<void> {
    const isVisible = await this.duplicateSessionText
      .waitFor({ state: 'visible', timeout: LoginPage.DUPLICATE_SESSION_TIMEOUT })
      .then(() => true)
      .catch(() => false);

    if (isVisible) {
      await this.duplicateSessionContinueButton.waitFor({ state: 'visible', timeout: LoginPage.POPUP_TIMEOUT });
      await this.duplicateSessionContinueButton.click();

      // Wait for the popup to disappear before continuing
      await this.duplicateSessionText
        .waitFor({ state: 'hidden', timeout: LoginPage.POPUP_TIMEOUT })
        .catch(() => {/* already hidden */});
    }
  }

  /**
   * Handle optional popups that may appear right after submitting credentials
   * (duplicate session / trust-device / fraud detection alerts).
   *
   * Uses a polling loop with instant visibility checks instead of long
   * sequential waits.  This avoids:
   *   • Wasting 25 s on a duplicate-session popup that never appears.
   *   • Missing a popup that shows while we're blocked waiting for a
   *     different one.
   *   • Accumulating Playwright watchers from concurrent promises.
   *
   * Each iteration: check URL → check each popup → short sleep → repeat.
   */
  async handlePostLoginPopups(): Promise<void> {
    const POLL_INTERVAL = 2_000;                       // 2 s between polls
    const deadline = Date.now() + LoginPage.DASHBOARD_TIMEOUT;

    while (Date.now() < deadline) {
      // ── Already on the dashboard? → stop polling ────────────────────
      if (/home/i.test(this.page.url())) break;

      // ── Duplicate-session popup visible right now? → dismiss ────────
      if (await this.duplicateSessionText.isVisible().catch(() => false)) {
        await this.duplicateSessionContinueButton
          .click({ timeout: LoginPage.POPUP_TIMEOUT })
          .catch(() => {/* button already gone */});
        await this.duplicateSessionText
          .waitFor({ state: 'hidden', timeout: LoginPage.POPUP_TIMEOUT })
          .catch(() => {/* already hidden */});
        continue;                                      // re-check immediately
      }

      // ── Trust-device / fraud popup visible right now? → dismiss ─────
      if (await this.trustDeviceText.isVisible().catch(() => false)) {
        await this.fraudAlertAcceptButton
          .click({ timeout: LoginPage.POPUP_TIMEOUT })
          .catch(() => {/* not found */});

        // If still on the password step after dismissing, resubmit
        if (await this.passwordInput.isVisible().catch(() => false)) {
          await this.passwordNextButton
            .click({ timeout: 15_000 })
            .catch(async () => {
              await this.passwordInput.press('Enter');
            });
        }
        continue;                                      // re-check immediately
      }

      // ── Trust-device registration popup ("Registro de dispositivo de confianza") → click "No"
      if (await this.trustDeviceRegistrationText.isVisible().catch(() => false)) {
        await this.trustDeviceRegistrationNoButton
          .click({ timeout: LoginPage.POPUP_TIMEOUT })
          .catch(() => {/* button already gone */});
        await this.trustDeviceRegistrationText
          .waitFor({ state: 'hidden', timeout: LoginPage.POPUP_TIMEOUT })
          .catch(() => {/* already hidden */});
        continue;                                      // re-check immediately
      }

      // ── Still stuck on the password step with no popup? → resubmit ─
      if (await this.passwordInput.isVisible().catch(() => false)) {
        await this.passwordInput.press('Enter');
      }

      // ── Brief pause before the next poll ────────────────────────────
      await this.page.waitForTimeout(POLL_INTERVAL);
    }

    // ── Final wait: if we exited the loop without reaching /home ────────
    if (!/home/i.test(this.page.url())) {
      const remaining = Math.max(deadline - Date.now(), 10_000);
      await this.page.waitForURL(/home/i, { timeout: remaining });
    }

    // ── Fraud-detection alert (can appear once we're on /home) ──────────
    const isFraudAlert = await this.fraudAlertAcceptButton
      .waitFor({ state: 'visible', timeout: LoginPage.POPUP_TIMEOUT })
      .then(() => true)
      .catch(() => false);

    if (isFraudAlert) {
      await this.fraudAlertAcceptButton.click();
    }
  }

  /**
   * Full login flow: navigate → accept cookies → enter user → enter password → handle popups.
   */
  async login(url: string, username: string, password: string): Promise<void> {
    await this.navigate(url);
    await this.dismissCookiesIfPresent();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.handlePostLoginPopups();
  }

  /**
   * Assert that the dashboard loaded successfully after login.
   * Verifies the "Opciones de usuario" element that shows the logged-in user's name.
   */
  async verifyDashboard(): Promise<void> {
    await expect(this.userOptionsButton).toBeVisible({ timeout: LoginPage.DASHBOARD_TIMEOUT });
  }
}
