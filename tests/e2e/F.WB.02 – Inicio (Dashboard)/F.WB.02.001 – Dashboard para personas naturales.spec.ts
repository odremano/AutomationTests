import { expect, test } from '../../../fixtures/authenticatedPage.fixture';
import { DashboardPage } from '../../../pages/DashboardPage';

test('F.WB.02.001 - Dashboard para personas naturales', async ({ authenticatedPage: page }) => {
	test.setTimeout(180_000);

	const dashboardPage = new DashboardPage(page);

	await test.step('Validar carga inicial del dashboard', async () => {
		await dashboardPage.esperarDashboard();
		await expect(dashboardPage.dashboardMain).toBeVisible();
		await expect(dashboardPage.bienvenidaUsuarioText).toBeVisible();
	});

	await test.step('Validar informacion principal del dashboard', async () => {
		await dashboardPage.validarPublicidadSegmentada();
		await dashboardPage.validarInformacionUsuario();
		await dashboardPage.validarInformacionContacto();
	});

	await test.step('Validar widgets del dashboard para personas naturales', async () => {
		await dashboardPage.validarRibbonProductosSiExiste();
		await dashboardPage.validarTasas();
		await dashboardPage.validarTransaccionesFrecuentes();
		await dashboardPage.validarOperacionesDestacadas();
		await dashboardPage.validarUltimosPagos();
		await dashboardPage.validarUltimasTransferencias();
	});
});
