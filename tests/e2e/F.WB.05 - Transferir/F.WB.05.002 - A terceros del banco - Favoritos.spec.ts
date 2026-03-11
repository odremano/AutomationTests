import { expect, test } from '../../../fixtures/authenticatedPage.fixture';
import { getTransferData } from '../../../helpers/auth';
import { LoginPage } from '../../../pages/LoginPage';
import { transfATercerosPage } from '../../../pages/transfATerceros';

test('F.WB.05.002 - A cuenta favorita', async ({ authenticatedPage: page }) => {
	test.setTimeout(240_000);

	const data = getTransferData();
	const loginPage = new LoginPage(page);
	const transferPage = new transfATercerosPage(page);

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