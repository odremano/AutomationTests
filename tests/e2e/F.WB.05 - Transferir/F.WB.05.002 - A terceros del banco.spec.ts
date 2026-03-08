import { test, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { transfATercerosPage } from '../../../pages/transfATerceros';

const expect = baseExpect.configure({ timeout: 15_000 });

const requiredEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Falta la variable de entorno obligatoria: ${key}`);
	}
	return value;
};

const getTransferThirdAccountsData = () => ({
	loginUrl:requiredEnv('LOGIN_URL'),
	loginUsername: requiredEnv('LOGIN_USERNAME'),
	loginPassword: requiredEnv('LOGIN_PASSWORD'),
	monto: requiredEnv('TRANSFER_AMOUNT'),
	concepto: requiredEnv('TRANSFER_CONCEPT'),
	correo: requiredEnv('TRANSFER_EMAIL'),
});

test('F.WB.05.002 - A cuenta favorita', async ({ page }) => {
	test.setTimeout(180_000);

	const data = getTransferThirdAccountsData();
	const loginPage = new LoginPage(page);
	const transferPage = new transfATercerosPage(page);

	await page.addLocatorHandler(loginPage.cookieTitle, async () => {
		if (await loginPage.cookieTitle.isVisible().catch(() => false)) {
			await loginPage.cookieAcceptButton.click();
			await expect(loginPage.cookieTitle).toBeHidden({ timeout: 10_000 });
		}
	});

	await test.step('Precondición: login exitoso', async () => {
		await loginPage.gotoLogin(data.loginUrl);
		await loginPage.acceptCookiesIfVisible();
		await loginPage.waitForUsernameInput();
		await expect(loginPage.usernameInput).toBeVisible();

		await loginPage.submitUsername(data.loginUsername);
		await loginPage.waitForPasswordStep();
		await expect(loginPage.passwordInput).toBeVisible();

		await loginPage.submitPassword(data.loginPassword);
		await loginPage.handleTrustedDeviceIfVisible();
		await loginPage.handleDuplicateSessionIfVisible();
		await loginPage.waitForDashboard();
		await expect(loginPage.userOptionsButton).toBeVisible();
	});

	await test.step('Abrir flujo de transferencia a terceros', async () => {
		await transferPage.irATerceros();
		await expect(transferPage.cuentaOrigenSelector).toBeVisible();
	});

	await test.step('Seleccionar cuenta origen y cuenta destino', async () => {
		await transferPage.seleccionarCuentaOrigen();
		await expect(transferPage.cuentaDestinoSelector).toBeVisible();

		await transferPage.seleccionarCuentaDestino();
		await expect(transferPage.montoInput).toBeVisible();
	});

	await test.step('Completar formulario de transferencia', async () => {
		await transferPage.completarFormulario(data.monto, data.concepto, data.correo);
		await expect(transferPage.montoInput).toHaveValue(data.monto);
	});

	await test.step('Confirmar transferencia exitosa', async () => {
		await transferPage.continuarYConfirmar();
		await expect(transferPage.transferenciaExitosaHeading).toBeVisible();
	});

	await test.step('Volver al inicio', async () => {
		await transferPage.volverAInicio();
		await expect(loginPage.userOptionsButton).toBeVisible();
	});
});

test('F.WB.05.002 - A cuenta nueva', async ({ page }) => {
    test.setTimeout(180_000);

    const data = getTransferThirdAccountsData();
    const loginPage = new LoginPage(page);
    const transferPage = new transfATercerosPage(page);
});
