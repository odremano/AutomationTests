import { expect, Locator, Page } from '@playwright/test';

export class transfCtasPropiasPage {
	readonly page: Page;
	readonly transferirMenuLink: Locator;
	readonly transferirMenuCompactLink: Locator;
	readonly entreCuentasPropiasLink: Locator;
	readonly cuentaOrigenSelector: Locator;
	readonly cuentaOrigenOption: Locator;
	readonly cuentaDestinoSelector: Locator;
	readonly cuentaDestinoOption: Locator;
	readonly montoInput: Locator;
	readonly conceptoInput: Locator;
	readonly correoInput: Locator;
	readonly siguienteButton: Locator;
	readonly transferenciasHeading: Locator;
	readonly confirmarButtonEnabled: Locator;
	readonly transferenciaExitosaHeading: Locator;
	readonly inicioButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.transferirMenuLink = page.getByRole('list').locator('a').filter({ hasText: 'Transferir' });
		this.transferirMenuCompactLink = page.getByRole('listitem').filter({ hasText: 'Transferir' });
		this.entreCuentasPropiasLink = page.getByRole('navigation').locator('a').filter({ hasText: 'Entre cuentas propias' });
		this.cuentaOrigenSelector = page.locator('.baku-selected_product-not_selected').first();
		this.cuentaOrigenOption = page.locator('.lisboa').first();
		this.cuentaDestinoSelector = page.locator('#creditProductId .baku-selected_product-not_selected');
		this.cuentaDestinoOption = page.locator('#creditProductId .lisboa').first();
		this.montoInput = page.getByRole('textbox', { name: 'Ingrese monto' });
		this.conceptoInput = page.getByRole('textbox', { name: 'Concepto' });
		this.correoInput = page.locator('input[name="baseTransferLogicHelpers.secondNotifyTo"]');
		this.siguienteButton = page.locator('main a.ipswich-main-buttons-link').filter({ hasText: /Continuar|Siguiente/i }).first();
		this.transferenciasHeading = page.getByRole('heading', { name: /Transferir|Transferencias Entre Cuentas Propias/i }).first();
		this.confirmarButtonEnabled = page
			.locator('main a.ipswich-main-buttons-link:not(.inactive)')
			.filter({ hasText: 'Confirmar' })
			.first();
		this.transferenciaExitosaHeading = page.getByRole('heading', { name: /Tu transferencia ha sido/i });
		this.inicioButton = page.getByRole('main').locator('a').filter({ hasText: 'Inicio' });
	}

	async irAEntreCuentasPropias(): Promise<void> {
		if (await this.transferirMenuLink.first().isVisible().catch(() => false)) {
			await this.transferirMenuLink.first().click();
		} else {
			await expect(this.transferirMenuCompactLink.first()).toBeVisible({ timeout: 20_000 });
			await this.transferirMenuCompactLink.first().click();
		}

		await expect(this.entreCuentasPropiasLink).toBeVisible();
		await this.entreCuentasPropiasLink.click();
		await this.page.waitForLoadState('networkidle');
		await expect(this.cuentaOrigenSelector).toBeVisible();
	}

	async seleccionarCuentaOrigen(): Promise<void> {
		await expect(this.cuentaOrigenSelector).toBeVisible();
		await this.cuentaOrigenSelector.click();
		await expect(this.cuentaOrigenOption).toBeVisible({ timeout: 30_000 });
		await this.cuentaOrigenOption.click();
		await expect(this.cuentaDestinoSelector).toBeVisible();
	}

	async seleccionarCuentaDestino(): Promise<void> {
		await expect(this.cuentaDestinoSelector).toBeVisible();
		await this.cuentaDestinoSelector.click();
		await expect(this.cuentaDestinoOption).toBeVisible({ timeout: 30_000 });
		await this.cuentaDestinoOption.click();
		await expect(this.montoInput).toBeVisible();
	}

	async completarFormulario(monto: string, concepto: string, correo: string): Promise<void> {
		await this.montoInput.click();
		await this.montoInput.fill('');
		await this.montoInput.pressSequentially(monto, { delay: 120 });
		await expect(this.montoInput).toHaveValue(monto);
		await this.montoInput.press('Tab');

		if (concepto) {
			await this.conceptoInput.click();
			await this.conceptoInput.fill('');
			await this.conceptoInput.pressSequentially(concepto, { delay: 60 });
			await expect(this.conceptoInput).toHaveValue(concepto);
			await this.conceptoInput.press('Tab');
		}

		if (correo) {
			await this.correoInput.click();
			await this.correoInput.fill('');
			await this.correoInput.pressSequentially(correo, { delay: 60 });
			await expect(this.correoInput).toHaveValue(correo);
			await this.correoInput.press('Tab');
		}

		await this.transferenciasHeading.click().catch(() => this.page.keyboard.press('Tab').catch(() => {}));
		await this.page.waitForTimeout(750);
	}

	async continuarYConfirmar(): Promise<void> {
		await expect(this.siguienteButton).toBeVisible();
		await expect(this.siguienteButton).not.toHaveClass(/inactive/, { timeout: 20_000 });
		await this.siguienteButton.click();

		await expect(this.confirmarButtonEnabled).toBeVisible({ timeout: 15_000 });
		await this.confirmarButtonEnabled.click();

		await expect(this.transferenciaExitosaHeading).toBeVisible(({ timeout: 25_000 }));
	}

	async volverAInicio(): Promise<void> {
		await expect(this.inicioButton).toBeVisible();
		await this.inicioButton.click();
		await this.page.waitForLoadState('networkidle');
	}
}
