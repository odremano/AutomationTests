import { expect, Locator, Page } from '@playwright/test';

export class transfAlExteriorPage {
    readonly page: Page;
    readonly transferirMenuLink: Locator;
    readonly transferirMenuCompactLink: Locator;
    readonly alExteriorLink: Locator;
    readonly cuentaOrigenSelector: Locator;
    readonly cuentaOrigenOption: Locator;
    readonly cuentaDestinoSelector: Locator;
    readonly cuentaDestinoOption: Locator;
    readonly otraCuentaDestino: Locator;
    readonly cuentaNuevaDestinoSelector: Locator;
    readonly cuentaNuevaHeader: Locator;
    readonly descripcionInput: Locator;
    readonly countryInput: Locator;
    readonly radioSwiftButton: Locator;
    readonly codeInput: Locator;
    readonly codeInexistentText: Locator;
    readonly codeName: Locator;
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
        this.alExteriorLink = page.getByRole('navigation').locator('a').filter({ hasText: 'Al Exterior' });
        this.cuentaOrigenSelector = page.locator('.baku-selected_product-not_selected').first();
        this.cuentaOrigenOption = page.locator('.lisboa').first();
        this.cuentaDestinoSelector = page.locator('.stream-arrow_down_1.crawley-content-icon-arrow.baku-selected_product-icon');
        this.cuentaDestinoOption = page.getByText('test Automation 3301290511').first();
        this.otraCuentaDestino = page.getByRole('button', { name: 'Otra' });
        this.cuentaNuevaDestinoSelector = page.locator('.baku-selected_product-not_selected');
        this.cuentaNuevaHeader = page.getByText('Datos del producto tercero en');
        this.descripcionInput = page.locator('input[name="alias"]');
        this.countryInput = page.locator('icb-record-render').filter({ hasText: 'Descripción País Ålanda' }).getByRole('combobox');
        this.radioSwiftButton = page.locator('.naples-form-checkbox-right > .kinshasa > .kinshasa-radio_input > label > .kinshasa-radio_label-icon');
        this.codeInput = page.locator('input[name="thirdPartyProductAdditionalInfo.correspondentBankRoutingNumber"]');
        this.codeInexistentText = page.getByText('No hay ningún banco asociado');
        this.codeName = page.locator('div:nth-child(6) > icb-textbox > .venecia-main-box > .venecia-main-form-content');
        this.nameInput = page.locator('input[name="ownerName"]');
        this.creditAccFinalInput = page.locator('input[name="thirdPartyProductNumber"]');
        this.addressInput = page.locator('input[name="ownerAddress"]');
        this.confirmarCuentaNuevaButton = page.locator('icb-third-party-product-new a').filter({ hasText: 'Confirmar' }).first();
        this.overlayLoader = page.locator('.salto_overlay.salto_overlay-show');
        this.montoInput = page.getByRole('textbox', { name: 'Ingrese monto' });
        this.conceptoInput = page.getByRole('textbox', { name: 'Mínimo 12 caracteres, números' });
        this.correoInput = page.locator('input[name="baseTransferLogicHelpers.secondNotifyTo"]');
        this.siguienteButton = page.locator('.step.fl.ipswich-step-visible.full-height > .ipswich-main-wizard-footer > .ipswich-main-buttons-fixed > icb-button:nth-child(2) > .ipswich-main-buttons-link').first();
        this.transferenciasHeading = page.getByRole('heading', { name: 'Cuenta de tercero a acreditar' }).locator('headline');
        this.confirmarButtonEnabled = page.getByRole('main').locator('a').filter({ hasText: 'Confirmar' });
        this.transferenciaExitosaHeading = page.getByRole('heading', { name: /Tu transferencia ha sido|Tu transferencia no ha podido/ }).first();
        this.inicioButton = page.getByRole('main').locator('a').filter({ hasText: 'Inicio' });
    }

    async irAlExterior(): Promise<void> {
        if (await this.transferirMenuLink.first().isVisible({timeout: 20_000}).catch(() => false)) {
            await this.transferirMenuLink.first().click();
        } else {
            await expect(this.transferirMenuCompactLink.first()).toBeVisible();
            await this.transferirMenuCompactLink.first().click();
        }

        await expect(this.alExteriorLink).toBeVisible({ timeout: 20_000 });
        await this.alExteriorLink.click();
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

    async seleccionarCuentaDestinoNueva(concepto: string, codeABA: string, cuentaABA: string, description: string): Promise<void> {
        await expect(this.otraCuentaDestino).toBeVisible();
        await this.otraCuentaDestino.click();
        await expect(this.cuentaNuevaDestinoSelector).toBeVisible();
        await this.cuentaNuevaDestinoSelector.click();
        await expect(this.cuentaNuevaHeader).toBeVisible({ timeout: 10_000 });
        await this.descripcionInput.click();
        await this.descripcionInput.fill('');
        await this.descripcionInput.pressSequentially(description , { delay: 60 }); 
        await this.countryInput.selectOption('840');
        //await this.radioSwiftButton.click();
        await this.codeInput.click();
        await this.codeInput.fill('');
        await this.codeInput.pressSequentially(codeABA, { delay: 60 });
        await this.page.waitForTimeout(3_000);
        await expect(this.codeInexistentText).toBeHidden({ timeout: 20_000 });
        await expect(this.nameInput).toBeVisible({timeout: 20_000});
        await this.codeInput.press('Tab');
        await this.nameInput.fill('');
        await this.nameInput.pressSequentially(concepto, { delay: 60 });
        await this.nameInput.press('Tab');
        await this.creditAccFinalInput.fill('');
        await this.creditAccFinalInput.pressSequentially(cuentaABA, { delay: 60 });
        await this.creditAccFinalInput.press('Tab');
        await this.addressInput.fill('');
        await this.addressInput.pressSequentially('Test Address', { delay: 60 });
        await expect(this.confirmarCuentaNuevaButton).toBeEnabled({ timeout: 10_000 });
        await this.confirmarCuentaNuevaButton.click();
        await expect(this.overlayLoader).toBeHidden({ timeout: 20_000 });
        await expect(this.montoInput).toBeVisible({ timeout: 20_000 });
    }

    async seleccionarCuentaDestinoNuevaSwift(codeSWIFT: string, cuentaSWIFT: string, description: string): Promise<void> {
        await expect(this.otraCuentaDestino).toBeVisible();
        await this.otraCuentaDestino.click();
        await expect(this.cuentaNuevaDestinoSelector).toBeVisible();
        await this.cuentaNuevaDestinoSelector.click();
        await expect(this.cuentaNuevaHeader).toBeVisible({ timeout: 10_000 });
        await this.descripcionInput.click();
        await this.descripcionInput.fill('');
        await this.descripcionInput.pressSequentially(description , { delay: 60 });
        await expect(this.countryInput).toBeVisible();
        await this.countryInput.click();
        await this.countryInput.selectOption('840');
        await this.radioSwiftButton.click();
        await this.codeInput.click();
        await this.codeInput.fill('');
        await this.codeInput.pressSequentially(codeSWIFT, { delay: 60 });
        await this.page.waitForTimeout(3_000);
        await expect(this.codeInexistentText).toBeHidden({ timeout: 20_000 });
        await expect(this.nameInput).toBeVisible({timeout: 20_000});
        await this.codeInput.press('Tab');
        await this.nameInput.fill('');
        await this.nameInput.pressSequentially(description , { delay: 60 });
        await this.nameInput.press('Tab');
        await this.creditAccFinalInput.fill('');
        await this.creditAccFinalInput.pressSequentially(cuentaSWIFT, { delay: 60 });
        await this.creditAccFinalInput.press('Tab');
        await this.addressInput.fill('');
        await this.addressInput.pressSequentially('Test Address', { delay: 60 });
        await expect(this.confirmarCuentaNuevaButton).toBeEnabled({ timeout: 10_000 });
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
