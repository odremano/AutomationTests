import { expect, test } from '../../../fixtures/authenticatedPage.fixture';
import { getTransferData } from '../../../helpers/auth';
import { LoginPage } from '../../../pages/LoginPage';
import { transfAlExteriorPage } from '../../../pages/transfAlExteriorPage';

test('F.WB.05.004 - A cuenta nueva ABA', async ({ authenticatedPage: page }) => {
    test.setTimeout(380_000);

    const data = getTransferData();
    const loginPage = new LoginPage(page);
    const transferPage = new transfAlExteriorPage(page);

	await test.step('Abrir flujo de transferencia al exterior', async () => {
		await transferPage.irAlExterior();
		await expect(transferPage.cuentaOrigenSelector).toBeVisible();
	});

    await test.step('Seleccionar cuenta origen y cuenta destino', async () => {
        await transferPage.seleccionarCuentaOrigen();
        await expect(transferPage.cuentaDestinoSelector).toBeVisible();

        await transferPage.seleccionarCuentaDestinoNueva(data.codeABA, data.cuentaABA);
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

test('F.WB.05.004.01 - A cuenta nueva SWIFT', async ({ authenticatedPage: page }) => {
    test.setTimeout(380_000);

    const data = getTransferData();
    const loginPage = new LoginPage(page);
    const transferPage = new transfAlExteriorPage(page);

	await test.step('Abrir flujo de transferencia al exterior', async () => {
		await transferPage.irAlExterior();
		await expect(transferPage.cuentaOrigenSelector).toBeVisible();
	});

    await test.step('Seleccionar cuenta origen y cuenta destino', async () => {
        await transferPage.seleccionarCuentaOrigen();
        await expect(transferPage.cuentaDestinoSelector).toBeVisible();

        await transferPage.seleccionarCuentaDestinoNuevaSwift(data.codeSWIFT, data.cuentaSWIFT);
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