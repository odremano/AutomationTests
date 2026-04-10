import { expect, Locator, Page } from '@playwright/test';

export class transfACHPage {
    readonly page: Page;
    readonly transferirMenuLink: Locator;
    readonly transferirMenuCompactLink: Locator;
    readonly ACHLink: Locator;
    readonly cuentaOrigenSelector: Locator;
    readonly cuentaOrigenOption: Locator;
    readonly cuentaDestinoSelector: Locator;
    readonly cuentaDestinoOption: Locator;
    readonly otraCuentaDestino: Locator;
    readonly cuentaNuevaDestinoSelector: Locator;
    readonly cuentaNuevaHeader: Locator;
    readonly descripcionInput: Locator;
    readonly bankInput: Locator;
    readonly productoInput: Locator;
    readonly productInexistentText: Locator;
    readonly nameInput: Locator;
    readonly creditAccFinalInput: Locator;
    readonly addressInput: Locator;
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
        this.ACHLink = page.locator('a').filter({ hasText: 'ACH' }).nth(2)
        this.cuentaOrigenSelector = page.locator('.baku-selected_product-not_selected').first();
        this.cuentaOrigenOption = page.locator('.lisboa').first();
        this.cuentaDestinoSelector = page.locator('.stream-arrow_down_1.crawley-content-icon-arrow.baku-selected_product-icon');
        this.cuentaDestinoOption = page.getByText('Prueba QA 1106015801 Prueba').first();
        this.otraCuentaDestino = page.getByRole('button', { name: 'Otra' });
        this.cuentaNuevaDestinoSelector = page.locator('.baku-selected_product-not_selected');
        this.cuentaNuevaHeader = page.getByText('Datos del producto tercero en');
        this.descripcionInput = page.locator('fico-input-text-control').filter({ hasText: 'Descripción' }).getByRole('textbox');
        this.bankInput = page.locator('fico-select-control').filter({ hasText: /Banco/ }).getByRole('combobox');
        this.productoInput = page.getByRole('textbox', { name: 'Texto de 10 caracteres de' });
        this.productInexistentText = page.getByText('No hay ningún banco asociado');
        this.nameInput = page.locator('fico-input-text-control').filter({ hasText: 'Nombre' }).getByRole('textbox');
        this.creditAccFinalInput = page.locator('input[name="thirdPartyProductNumber"]');
        this.addressInput = page.locator('input[name="ownerAddress"]');
        this.confirmarCuentaNuevaButton = page.locator('icb-third-party-product-new a').filter({ hasText: 'Confirmar' }).first();
        this.overlayLoader = page.locator('.salto_overlay.salto_overlay-show');
        this.montoInput = page.getByRole('textbox', { name: 'Ingrese monto' });
        this.conceptoInput = page.getByRole('textbox', { name: 'Concepto' });
        this.correoInput = page.locator('input[name="baseTransferLogicHelpers.secondNotifyTo"]');
        this.siguienteButton = page.locator('.step.fl.ipswich-step-visible.full-height > .ipswich-main-wizard-footer > .ipswich-main-buttons-fixed > icb-button:nth-child(2) > .ipswich-main-buttons-link').first();
        this.transferenciasHeading = page.getByRole('heading', { name: 'Cuenta de tercero a acreditar' }).locator('headline');
        this.confirmarButtonEnabled = page.getByRole('main').locator('a').filter({ hasText: 'Confirmar' });
        this.transferenciaExitosaHeading = page.getByRole('heading', { name: /Tu transferencia ha sido/i });
        this.inicioButton = page.getByRole('main').locator('a').filter({ hasText: 'Inicio' });
    }

    async irACH(): Promise<void> {
        if (await this.transferirMenuLink.first().isVisible().catch(() => false)) {
            await this.transferirMenuLink.first().click();
        } else {
            await expect(this.transferirMenuCompactLink.first()).toBeVisible();
            await this.transferirMenuCompactLink.first().click();
        }

        await expect(this.ACHLink).toBeVisible({ timeout: 20_000 });
        await this.ACHLink.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.cuentaOrigenSelector).toBeVisible();
    }

    async seleccionarCuentaOrigen(): Promise<void> {
        await expect(this.cuentaOrigenSelector).toBeVisible();
        await this.cuentaOrigenSelector.click();
        await expect(this.cuentaOrigenOption).toBeVisible({ timeout: 40_000 });
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

    async seleccionarCuentaDestinoNueva(descripcion: string, cuentaACH: string): Promise<void> {
        await expect(this.otraCuentaDestino).toBeVisible();
        await this.otraCuentaDestino.click();
        await expect(this.cuentaNuevaDestinoSelector).toBeVisible();
        await this.cuentaNuevaDestinoSelector.click();
        await expect(this.cuentaNuevaHeader).toBeVisible({ timeout: 10_000 });
        await this.descripcionInput.click();
        await this.descripcionInput.fill('');
        await this.descripcionInput.pressSequentially(descripcion, { delay: 60 });
        await this.bankInput.click();
        await this.bankInput.selectOption('10: Object'); //Mejorable a variable de entorno para no tener valor fijo.
        await this.productoInput.click();
        await this.productoInput.fill('');
        await this.productoInput.pressSequentially(cuentaACH, { delay: 60 });
        await this.nameInput.click();
        await this.nameInput.fill('');
        await this.nameInput.pressSequentially(descripcion, { delay: 60 });
        await expect(this.confirmarCuentaNuevaButton).toBeEnabled({ timeout: 60_000 });
        await this.page.waitForTimeout(10_000);
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
            await this.conceptoInput.pressSequentially("Prueba transf Automation", { delay: 60 });
            await expect(this.conceptoInput).toHaveValue("Prueba transf Automation");
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

        await this.page.waitForTimeout(30_000);
        await expect(this.confirmarButtonEnabled).toBeVisible({ timeout: 25_000 });
        await this.confirmarButtonEnabled.click();

        await expect(this.transferenciaExitosaHeading).toBeVisible(({ timeout: 30_000 }));
    }

    async volverAInicio(): Promise<void> {
        await expect(this.inicioButton).toBeVisible();
        await this.inicioButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}
