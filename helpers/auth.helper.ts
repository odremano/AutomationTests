import { type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/* ═══════════════════════════════════════════════════════════════════════════
 * AUTH HELPER — Auto-detección de contraseña válida para tests E2E
 *
 * Regla de negocio: todos los usuarios de prueba sólo pueden tener como
 * contraseña "Password01" o "Password02". Este helper intenta ambas de
 * forma automática y retorna la que funcione.
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Constantes configurables ──────────────────────────────────────────── */

/**
 * Configuración centralizada del helper de autenticación.
 * Modifica estos valores si cambian las rutas, la URL esperada
 * post-login, o los tiempos de espera de la aplicación.
 */
export const LOGIN_CONFIG = {
  /** Patrón de URL que indica un login exitoso */
  SUCCESS_URL_PATTERN: /home/i,

  /**
   * Timeout (ms) para la race de detección éxito/fallo tras enviar credenciales.
   * Debe ser suficiente para que la app responda, pero NO tan largo como el
   * DASHBOARD_TIMEOUT de LoginPage (70s) — aquí solo esperamos la primera señal.
   */
  LOGIN_RESULT_TIMEOUT: 30_000,

  /** Timeout (ms) para que la página de login termine de cargar al limpiar estado */
  PAGE_LOAD_TIMEOUT: 180_000,
} as const;

/* ── Variables de entorno ──────────────────────────────────────────────── */

/**
 * Variables de entorno usadas por el helper, con fallbacks sensatos.
 * Se leen en tiempo de ejecución para que `dotenv/config` ya las haya cargado.
 */
export const ENV = {
  get LOGIN_URL(): string {
    return (
      process.env.LOGIN_URL ??
      'https://vficohsa/1513383_TrasladoDePuntos.UI/?version=6.7.1.0.0.11#/administrationGeneral/login'
    );
  },
  get TEST_USERNAME(): string {
    return process.env.TEST_USERNAME ?? process.env.TEST_USER ?? 'lcarin';
  },
  get TEST_PASSWORD1(): string {
    return process.env.TEST_PASSWORD1 ?? 'Password01';
  },
  get TEST_PASSWORD2(): string {
    return process.env.TEST_PASSWORD2 ?? 'Password02';
  },
} as const;

/* ── Funciones auxiliares ──────────────────────────────────────────────── */

/**
 * Resultado interno de la detección post-login.
 * - `'success'` → La URL cambió a `/home` (login exitoso).
 * - `'invalid-credentials'` → Apareció el heading de error de credenciales.
 * - `'timeout'` → Ninguna señal clara apareció a tiempo.
 */
type LoginResult = 'success' | 'invalid-credentials' | 'timeout';

/**
 * Polling loop activo que evalúa el resultado del login después de enviar
 * credenciales. En cada iteración:
 *
 * 1. **¿URL contiene `/home`?** → `'success'` (login exitoso).
 * 2. **¿Visible `incorrectUserText`?** → `'invalid-credentials'` (fallo rápido).
 * 3. **¿Visible popup de sesión duplicada?** → Lo dismisséa y sigue esperando.
 * 4. **¿Visible popup de trust-device / fraude?** → Lo dismisséa y sigue esperando.
 * 5. Pausa breve → repite.
 *
 * Esto resuelve el problema del `Promise.race` pasivo: los popups
 * intermedios se dismisséan activamente para que el redirect a `/home`
 * pueda completarse.
 *
 * @param loginPage - Instancia de `LoginPage` ya vinculada a la `Page`.
 * @param page      - Instancia de `Page` de Playwright.
 * @returns El resultado de la detección.
 */
async function awaitLoginOutcome(loginPage: LoginPage, page: Page): Promise<LoginResult> {
  const POLL_INTERVAL = 20_000;
  const deadline = Date.now() + LOGIN_CONFIG.LOGIN_RESULT_TIMEOUT;

  while (Date.now() < deadline) {
    // ── 1. ¿Ya llegamos a /home? → éxito ──────────────────────────────
    if (LOGIN_CONFIG.SUCCESS_URL_PATTERN.test(page.url())) {
      return 'success';
    }

    // ── 2. ¿Apareció el heading de error de credenciales? → fallo rápido
    if (await loginPage.incorrectUserText.isVisible().catch(() => false)) {
      return 'invalid-credentials';
    }

    // ── 3. ¿Popup de sesión duplicada? → dismisséar ───────────────────
    if (await loginPage.duplicateSessionText.isVisible().catch(() => false)) {
      await loginPage.duplicateSessionContinueButton
        .click({ timeout: 5_000 })
        .catch(() => {/* botón ya no visible */});
      await loginPage.duplicateSessionText
        .waitFor({ state: 'hidden', timeout: 5_000 })
        .catch(() => {/* ya oculto */});
      continue; // re-evaluar inmediatamente
    }

    // ── 4. ¿Popup "Registro de dispositivo de confianza"? → click "No" ─
    if (await loginPage.trustDeviceRegistrationText.isVisible().catch(() => false)) {
      await loginPage.trustDeviceRegistrationNoButton
        .click({ timeout: 5_000 })
        .catch(() => {/* botón ya no visible */});
      await loginPage.trustDeviceRegistrationText
        .waitFor({ state: 'hidden', timeout: 5_000 })
        .catch(() => {/* ya oculto */});
      continue; // re-evaluar inmediatamente
    }

    // ── 5. ¿Popup de trust-device / fraude? → dismisséar ──────────────
    if (await loginPage.trustDeviceText.isVisible().catch(() => false)) {
      await loginPage.fraudAlertAcceptButton
        .click({ timeout: 5_000 })
        .catch(() => {/* no encontrado */});

      // Si después de dismisséar seguimos en el paso de contraseña, reenviar
      if (await loginPage.passwordInput.isVisible().catch(() => false)) {
        await loginPage.passwordNextButton
          .click({ timeout: 10_000 })
          .catch(async () => {
            await loginPage.passwordInput.press('Enter');
          });
      }
      continue; // re-evaluar inmediatamente
    }

    // ── 6. Pausa breve antes de la siguiente iteración ────────────────
    await page.waitForTimeout(POLL_INTERVAL);
  }

  // ── Último intento: ¿llegó a /home justo al expirar el deadline? ─────
  if (LOGIN_CONFIG.SUCCESS_URL_PATTERN.test(page.url())) {
    return 'success';
  }

  return 'timeout';
}

/**
 * Intenta iniciar sesión con las credenciales proporcionadas.
 *
 * Después de enviar la contraseña, ejecuta un **polling loop activo**
 * (`awaitLoginOutcome`) que simultáneamente:
 * - Detecta éxito (URL `/home`) o fallo (heading de error) rápidamente.
 * - Dismisséa popups intermedios (sesión duplicada, trust-device, fraude)
 *   que bloquearían el redirect a `/home`.
 *
 * Si el login fue exitoso, se ejecuta un chequeo final de popups
 * post-dashboard (alerta de fraude que puede aparecer ya en `/home`).
 *
 * @param page      - Instancia de `Page` de Playwright sobre la que operar.
 * @param username  - Nombre de usuario a ingresar.
 * @param password  - Contraseña a intentar.
 * @returns `true` si el login fue exitoso, `false` en caso contrario
 *          (credenciales inválidas, timeout, o error inesperado).
 */
export async function tryLogin(
  page: Page,
  username: string,
  password: string,
): Promise<boolean> {
  const loginPage = new LoginPage(page);

  try {
    // ── Paso 1: navegar y preparar el formulario ────────────────────
    await loginPage.navigate(ENV.LOGIN_URL);
    await loginPage.dismissCookiesIfPresent();

    // ── Paso 2: ingresar usuario → esperar campo de contraseña ──────
    await loginPage.enterUsername(username);

    // ── Paso 3: ingresar contraseña y enviar ────────────────────────
    await loginPage.enterPassword(password);

    // ── Paso 4: polling activo — detectar resultado + dismisséar popups
    const result = await awaitLoginOutcome(loginPage, page);

    if (result === 'success') {
      // Chequeo final: alerta de fraude que puede aparecer ya en /home
      const isFraudAlert = await loginPage.fraudAlertAcceptButton
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (isFraudAlert) {
        await loginPage.fraudAlertAcceptButton.click();
      }
      return true;
    }

    // 'invalid-credentials' o 'timeout' → intento fallido
    return false;
  } catch {
    // Cualquier error inesperado (selector no encontrado, crash) → fallido
    return false;
  }
}

/**
 * Limpia el estado de la página y la regresa al formulario de login,
 * dejándola lista para un nuevo intento de autenticación.
 *
 * @param page - Instancia de `Page` de Playwright.
 */
async function resetToLoginPage(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);

  try {
    await page.goto(ENV.LOGIN_URL, { waitUntil: 'commit' });
    await loginPage.usernameInput.waitFor({
      state: 'visible',
      timeout: LOGIN_CONFIG.PAGE_LOAD_TIMEOUT,
    });
  } catch {
    // Si falla la navegación de vuelta, un reload como último recurso
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  }
}

/* ── Funciones principales ─────────────────────────────────────────────── */

/**
 * Determina cuál de las contraseñas de prueba (`TEST_PASSWORD1`, `TEST_PASSWORD2`)
 * es válida para el usuario proporcionado, intentándolas de forma secuencial.
 *
 * **Flujo:**
 * 1. Intenta login con `TEST_PASSWORD1`.
 * 2. Si falla, limpia el estado, regresa a la página de login e intenta con `TEST_PASSWORD2`.
 * 3. Si ambas fallan, lanza un `Error` descriptivo.
 *
 * @param page     - Instancia de `Page` de Playwright.
 * @param username - Nombre de usuario contra el que probar las contraseñas.
 *                   Por defecto se toma de `ENV.TEST_USERNAME`.
 * @returns La contraseña que logró autenticar al usuario exitosamente.
 * @throws {Error} Si ninguna contraseña logra un login exitoso.
 *
 * @example
 * ```ts
 * const validPassword = await getValidPassword(page, 'lcarin');
 * // validPassword === 'Password01' | 'Password02'
 * ```
 */
export async function getValidPassword(
  page: Page,
  username: string = ENV.TEST_USERNAME,
): Promise<string> {
  const passwords = [ENV.TEST_PASSWORD1, ENV.TEST_PASSWORD2];

  for (let i = 0; i < passwords.length; i++) {
    const password = passwords[i];
    const isValid = await tryLogin(page, username, password);

    if (isValid) {
      return password;
    }

    // Si no es el último intento, limpiamos estado antes de reintentar
    if (i < passwords.length - 1) {
      await resetToLoginPage(page);
    }
  }

  throw new Error(
    `[auth.helper] No se encontró una contraseña válida para el usuario "${username}". ` +
      `Se intentaron: ${passwords.join(', ')}`,
  );
}

/**
 * Función de conveniencia que ejecuta el flujo completo de autenticación:
 *
 * 1. Detecta automáticamente la contraseña válida (entre `TEST_PASSWORD1` y `TEST_PASSWORD2`).
 * 2. Verifica que el dashboard se haya cargado correctamente.
 *
 * Ideal para el bloque `beforeAll` de tests que no necesitan validar
 * los pasos intermedios del login.
 *
 * @param page     - Instancia de `Page` de Playwright.
 * @param username - Nombre de usuario. Por defecto se toma de `ENV.TEST_USERNAME`.
 * @returns La contraseña que logró autenticar al usuario.
 *
 * @example
 * ```ts
 * test.beforeAll(async ({ browser }) => {
 *   page = await browser.newPage();
 *   await loginWithAutoPassword(page);
 * });
 * ```
 */
export async function loginWithAutoPassword(
  page: Page,
  username: string = ENV.TEST_USERNAME,
): Promise<string> {
  const validPassword = await getValidPassword(page, username);

  // getValidPassword ya dejó la sesión autenticada tras el intento exitoso.
  // Solo verificamos que el dashboard esté listo.
  const loginPage = new LoginPage(page);
  await loginPage.verifyDashboard();

  return validPassword;
}
