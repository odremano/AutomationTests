import { test, expect as baseExpect } from '@playwright/test';
import { getLoginCredentials } from '../../../helpers/auth';
import { LoginPage } from '../../../pages/LoginPage';

const expect = baseExpect.configure({ timeout: 15_000 });

test('F.WB.00.003 – Ingreso al sitio exitoso', async ({ page }) => {
  test.setTimeout(180_000);

  const { loginUrl, loginUsername, loginPassword } = getLoginCredentials();

  const loginPage = new LoginPage(page);

  await loginPage.registerCookieBannerHandler();

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
    await loginPage.handleTrustedDeviceIfVisible();
    await loginPage.handleDuplicateSessionIfVisible();
  });

  await test.step('Validar dashboard de login exitoso', async () => {
    await loginPage.waitForDashboard();
    await expect(loginPage.userOptionsButton).toBeVisible();
  });
});