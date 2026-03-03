import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { ENV } from '../../../helpers/auth.helper';

/* ── Tests ──────────────────────────────────────────────────────────────── */

test.describe.serial('F.WB.00.003 – Ingreso fallido al sitio ', () => {
  let page: Page;
  let loginPage: LoginPage;

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

  test('Paso 2 - Contraseña Incorrecta', async () => {
    // Continúa desde el formulario de login ya visible
    await loginPage.enterUsername(ENV.TEST_USERNAME);

    // El campo de contraseña debe aparecer tras avanzar del paso de usuario
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeEnabled();
  });

  test('Login Fallido', async () => {
    // Continúa desde el paso de contraseña ya visible
    await loginPage.enterPassword("000000000000000000000000000000000000000000000000"); // Contraseña incorrecta

    // Verificar que el mensaje de error de usuario incorrecto aparece
    await expect(loginPage.incorrectUserText).toBeVisible({ timeout: 15_000 });
  });
});
