import { test, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';

const expect = baseExpect.configure({ timeout: 15_000 });

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${key}`);
  }
  return value;
};

test('F.WB.00.003 – Ingreso al sitio fallido ', async ({ page }) => {
  test.setTimeout(180_000);

  const loginUrl = requiredEnv('LOGIN_URL');
  const loginUsername = requiredEnv('LOGIN_USERNAME');
  const loginPassword = 'invalid_password';

  const loginPage = new LoginPage(page);

  await page.addLocatorHandler(loginPage.cookieTitle, async () => {
    if (await loginPage.cookieTitle.isVisible().catch(() => false)) {
      await loginPage.cookieAcceptButton.click();
      await expect(loginPage.cookieTitle).toBeHidden({ timeout: 10_000 });
    }
  });

  await test.step('Abrir login y esperar disponibilidad del formulario', async () => {
    await loginPage.gotoLogin(loginUrl);
    await loginPage.acceptCookiesIfVisible();
    await loginPage.waitForUsernameInput();
    await expect(loginPage.usernameInput).toBeVisible();
  });

  await test.step('Ingresar usuario y avanzar a contraseña', async () => {
    await loginPage.submitUsername(loginUsername);
    await loginPage.waitForPasswordStep();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  await test.step('Ingresar contraseña y autenticar', async () => {
    await loginPage.submitPassword(loginPassword);
  });

  await test.step('Validar mensaje de error de login fallido', async () => {
    await loginPage.waitForLoginError();
    await expect(loginPage.loginErrorMessage).toBeVisible();
  });
});
