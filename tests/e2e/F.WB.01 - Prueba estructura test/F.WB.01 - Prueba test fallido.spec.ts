import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { ENV, getValidPassword } from '../../../helpers/auth.helper';

/* ── Tests ──────────────────────────────────────────────────────────────── */

test.describe.serial('F.WB.00.003 – Ingreso al sitio exitoso', () => {
  let page: Page;
  let loginPage: LoginPage;
  let validPassword: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Paso 1 - Nombre de usuario', async () => {
    await loginPage.navigate(ENV.LOGIN_URL);
    await loginPage.dismissCookiesIfPresent();

    // El campo de usuario debe estar visible y listo para interacción
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeEnabled();
  });

  test('Paso 2 - Contraseña e imagen de seguridad', async () => {
    // Continúa desde el formulario de login ya visible
    await loginPage.enterUsername(ENV.TEST_USERNAME);

    // El campo de contraseña debe aparecer tras avanzar del paso de usuario
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeEnabled();
  });

  test('Login Exitoso', async () => {
    // Detecta automáticamente la contraseña válida entre TEST_PASSWORD1 y TEST_PASSWORD2
    validPassword = await getValidPassword(page, ENV.TEST_USERNAME);

    // Verificar que el dashboard se cargó correctamente
    await loginPage.verifyDashboard();
  });
});
