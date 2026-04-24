import { expect, Locator, Page } from '@playwright/test';

export class DashboardPage {
	readonly page: Page;
	readonly dashboardMain: Locator;
	readonly publicidadSegmentadaImage: Locator;
	readonly fechaActualLoginText: Locator;
	readonly bienvenidaUsuarioText: Locator;
	readonly informacionUsuarioPanel: Locator;
	readonly informacionContactoPanel: Locator;
	readonly informacionContactoMail: Locator;
	readonly informacionContactoLinks: Locator;
	readonly ribbonProductosItems: Locator;
	readonly ribbonPrimerProductoIcono: Locator;
	readonly tasasWidget: Locator;
	readonly transaccionesFrecuentesWidget: Locator;
	readonly operacionesDestacadasWidget: Locator;
	readonly ultimosPagosHeading: Locator;
	readonly ultimasTransferenciasHeading: Locator;
	readonly ultimasTransferenciasWidget: Locator;

	constructor(page: Page) {
		this.page = page;
		this.dashboardMain = page.locator('.mumbai_content');
		this.publicidadSegmentadaImage = page.getByRole('img').first();
		this.fechaActualLoginText = page.locator('span:visible').filter({hasText: /\d{1,2} de [a-zA-Záéíóúñ]+\.? de \d{4} \d{2}:\d{2}/}).first();
		this.bienvenidaUsuarioText = page.locator('span:visible', { hasText: 'Bienvenido(a),' }).first();
		this.informacionUsuarioPanel = page.locator('.oxford.dashboardMode > .oxford-overflow > .oxford-data');
		this.informacionContactoPanel = page.locator('.oxford.dashboardMode > .oxford-contact > .oxford-contact-content');
		this.informacionContactoMail = page.locator('.oxford.dashboardMode > .oxford-contact > .oxford-contact-content > .oxford-contact-mail');
		this.informacionContactoLinks = page.locator('.oxford.dashboardMode > .oxford-contact a');
        this.ribbonProductosItems = page.locator('.helsinki-ribbon-item');
		this.ribbonPrimerProductoIcono = this.ribbonProductosItems.first().locator('[class*="stream-productos_"]').first();
		this.tasasWidget = page.locator('.tocuyo-row-item.xsmall.collapsibleItem.lastItem');
		this.transaccionesFrecuentesWidget = page.locator('.tocuyo-row-item.xsmall').first();
		this.operacionesDestacadasWidget = page.locator('.tampere');
		this.ultimosPagosHeading = page.getByText(/.ltimos pagos/i).first();
		this.ultimasTransferenciasHeading = page.getByText(/.ltimas transferencias/i).first();
		this.ultimasTransferenciasWidget = page.locator('.tocuyo-row-item.small.collapsibleItem.lastItem');
	}

	async esperarDashboard(): Promise<void> {
		await this.page.waitForURL(/#\/administrationGeneral\/home/, { timeout: 80_000 });
		await this.page.waitForLoadState('domcontentloaded');
		await expect(this.dashboardMain).toBeVisible();
	}

	async validarPublicidadSegmentada(): Promise<void> {
		await expect(this.publicidadSegmentadaImage).toBeVisible();
	}

	async validarInformacionUsuario(): Promise<void> {
		await expect(this.fechaActualLoginText).toBeVisible();
		await expect(this.bienvenidaUsuarioText).toBeVisible();
		await expect(this.informacionUsuarioPanel).toBeVisible();
	}

	async validarInformacionContacto(): Promise<void> {
		await expect(this.informacionContactoPanel).toBeVisible();
		await expect(this.informacionContactoMail).toBeVisible();

		const totalLinks = await this.informacionContactoLinks.count();
		expect(totalLinks).toBeGreaterThan(0);

		await expect(this.informacionContactoLinks.first()).toBeVisible();

		if (totalLinks > 1) {
			await expect(this.informacionContactoLinks.nth(1)).toBeVisible();
		}

		if (totalLinks > 2) {
			await expect(this.informacionContactoLinks.nth(2)).toBeVisible();
		}
	}

	async validarRibbonProductosSiExiste(): Promise<void> {
		const totalProductos = await this.ribbonProductosItems.count();

		if (!totalProductos) {
			return;
		}

		const primerProducto = this.ribbonProductosItems.first();
        const loadingProductosRibbon = primerProducto.locator('.jyvaskyla-balls');

		await expect(primerProducto).toBeVisible();
		await expect(this.ribbonPrimerProductoIcono).toBeVisible();

        if (await loadingProductosRibbon.count()) {
            await expect(loadingProductosRibbon).toBeHidden({ timeout: 60000 });
        }

		await expect(primerProducto).toContainText(/Cuenta corriente|Cuenta de ahorros|Tarjeta de Cr.dito/i);
		await expect(primerProducto).toContainText(/(?:\d{1,3}(?:,\d{3})*|\d+)\.\d{2}/);
		await expect(primerProducto).toContainText(/\b(?:USD|GTQ|HNL|NIO)\b/);
		await expect(primerProducto).toContainText(/Saldo disponible|Saldo actual/i);
	}

	async validarTasas(): Promise<void> {
		await expect(this.tasasWidget).toBeVisible();
	}

	async validarTransaccionesFrecuentes(): Promise<void> {
		await expect(this.transaccionesFrecuentesWidget).toBeVisible();
	}

	async validarOperacionesDestacadas(): Promise<void> {
		await expect(this.operacionesDestacadasWidget).toBeVisible();
	}

	async validarUltimosPagos(): Promise<void> {
		await expect(this.ultimosPagosHeading).toBeVisible();
	}

	async validarUltimasTransferencias(): Promise<void> {
		if (await this.ultimasTransferenciasHeading.isVisible().catch(() => false)) {
			await expect(this.ultimasTransferenciasHeading).toBeVisible();
			return;
		}

		await expect(this.ultimasTransferenciasWidget).toBeVisible();
	}

	async validarDashboardPersonasNaturales(): Promise<void> {
		await this.validarPublicidadSegmentada();
		await this.validarInformacionUsuario();
		await this.validarInformacionContacto();
		await this.validarRibbonProductosSiExiste();
		await this.validarTasas();
		await this.validarTransaccionesFrecuentes();
		await this.validarOperacionesDestacadas();
		await this.validarUltimosPagos();
		await this.validarUltimasTransferencias();
	}
}
