import { expect, Locator, Page } from '@playwright/test';

export class transfATercerosPage {
    readonly page: Page;
    readonly transferirMenuLink: Locator;
    readonly transferirMenuCompactLink: Locator;
    readonly aTercerosLink: Locator;
    readonly cuentaOrigenSelector: Locator;
    readonly cuentaOrigenOption: Locator;
    readonly cuentaDestinoSelector: Locator;
    readonly cuentaDestinoOption: Locator;
    readonly otraCuentaDestino: Locator;
    readonly cuentaNuevaDestinoSelector: Locator;
    readonly cuentaNuevaHeader: Locator;
    readonly descripcionInput: Locator;
    readonly productoInput: Locator;
    readonly confirmarCuentaNuevaButton: Locator;
    readonly overlayLoader: Locator;
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
        this.aTercerosLink = page.getByRole('navigation').locator('a').filter({ hasText: 'Terceros en Ficohsa' });
        this.cuentaOrigenSelector = page.locator('.baku-selected_product-not_selected').first();
        this.cuentaOrigenOption = page.locator('.lisboa').first();
        this.cuentaDestinoSelector = page.locator('.stream-arrow_down_1.crawley-content-icon-arrow.baku-selected_product-icon');
        this.cuentaDestinoOption = page.getByText('Cuenta de cheques Prueba').first();
        this.otraCuentaDestino = page.getByRole('button', { name: 'Otra' });
        this.cuentaNuevaDestinoSelector = page.locator('.baku-selected_product-not_selected');
        this.cuentaNuevaHeader = page.getByText('Datos del producto tercero');
        this.descripcionInput = page.locator('fico-input-text-control').filter({ hasText: 'Descripción' }).getByRole('textbox');
        this.productoInput = page.locator('fico-input-text-control').filter({ hasText: 'Número producto' }).getByRole('textbox').first();
        this.confirmarCuentaNuevaButton = page.locator('icb-third-party-product-new a').filter({ hasText: 'Confirmar' }).first();
        this.overlayLoader = page.locator('.salto_overlay.salto_overlay-show');
        this.montoInput = page.getByRole('textbox', { name: 'Ingrese monto' });
        this.conceptoInput = page.getByRole('textbox', { name: 'Concepto' });
        this.correoInput = page.locator('input[name="baseTransferLogicHelpers.secondNotifyTo"]');
        this.siguienteButton = page.locator('.step.fl.ipswich-step-visible.full-height > .ipswich-main-wizard-footer > .ipswich-main-buttons-fixed > icb-button:nth-child(2) > .ipswich-main-buttons-link').first();
        this.transferenciasHeading = page.getByRole('heading', { name: 'Cuenta de tercero a acreditar' }).locator('headline');
        this.confirmarButtonEnabled = page
            .locator('main a.ipswich-main-buttons-link:not(.inactive)')
            .filter({ hasText: 'Confirmar' })
            .first();
        this.transferenciaExitosaHeading = page.getByRole('heading', { name: /Tu transferencia ha sido/i });
        this.inicioButton = page.getByRole('main').locator('a').filter({ hasText: 'Inicio' });
    }

    async irATerceros(): Promise<void> {
        if (await this.transferirMenuLink.first().isVisible().catch(() => false)) {
            await this.transferirMenuLink.first().click();
        } else {
            await expect(this.transferirMenuCompactLink.first()).toBeVisible();
            await this.transferirMenuCompactLink.first().click();
        }

        await expect(this.aTercerosLink).toBeVisible({ timeout: 20_000 });
        await this.aTercerosLink.click();
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

    async seleccionarCuentaDestinoNueva(concepto: string, cuentaGT: string): Promise<void> {
        await expect(this.otraCuentaDestino).toBeVisible();
        await this.otraCuentaDestino.click();
        await expect(this.cuentaNuevaDestinoSelector).toBeVisible();
        await this.cuentaNuevaDestinoSelector.click();
        await expect(this.cuentaNuevaHeader).toBeVisible({ timeout: 10_000 });
        await this.descripcionInput.click();
        await this.descripcionInput.fill('');
        await this.descripcionInput.pressSequentially(concepto, { delay: 60 });
        await this.productoInput.click();
        await this.productoInput.fill('');
        await this.productoInput.pressSequentially(cuentaGT, { delay: 60 });
        await expect(this.confirmarCuentaNuevaButton).toBeEnabled({ timeout: 60_000 });
        await this.page.waitForTimeout(20_000);
        await this.confirmarCuentaNuevaButton.click();
        await expect(this.overlayLoader).toBeHidden({ timeout: 20_000 });
        await expect(this.montoInput).toBeVisible({ timeout: 20_000 });
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
        await this.page.waitForTimeout(30_000);
        await this.confirmarButtonEnabled.click();

        await expect(this.transferenciaExitosaHeading).toBeVisible(({ timeout: 30_000 }));
    }

    async volverAInicio(): Promise<void> {
        await expect(this.inicioButton).toBeVisible();
        await this.inicioButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}
