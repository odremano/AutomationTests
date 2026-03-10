import { test, expect as baseExpect } from '@playwright/test';
import { getTransferData, loginAsAuthenticatedUser } from '../../../helpers/auth';
import { transfCtasPropiasPage } from '../../../pages/transfCtasPropiasPage';

const expect = baseExpect.configure({ timeout: 15_000 });

test('F.WB.05.001 - Entre cuentas propias', async ({ page }) => {
	test.setTimeout(180_000);

	const data = getTransferData();
	const transferPage = new transfCtasPropiasPage(page);

	const loginPage = await test.step('Precondición: login exitoso', async () => loginAsAuthenticatedUser(page, data));

	await test.step('Abrir flujo de transferencia entre cuentas propias', async () => {
		await transferPage.irAEntreCuentasPropias();
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
