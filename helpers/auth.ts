import { expect as baseExpect, Page } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { LoginCredentials } from './env';

export { getLoginCredentials, getTransferData } from './env';

const expect = baseExpect.configure({ timeout: 15_000 });

export const attachCookieBannerHandler = async (page: Page, loginPage: LoginPage): Promise<void> => {
	await page.addLocatorHandler(loginPage.cookieTitle, async () => {
		if (await loginPage.cookieTitle.isVisible().catch(() => false)) {
			await loginPage.cookieAcceptButton.click();
			await expect(loginPage.cookieTitle).toBeHidden({ timeout: 10_000 });
		}
	});
};

export const loginAsAuthenticatedUser = async (
	page: Page,
	credentials: LoginCredentials,
): Promise<LoginPage> => {
	const loginPage = new LoginPage(page);

	await attachCookieBannerHandler(page, loginPage);
	await loginPage.gotoLogin(credentials.loginUrl);
	await loginPage.acceptCookiesIfVisible();
	await loginPage.waitForUsernameInput();
	await expect(loginPage.usernameInput).toBeVisible();

	await loginPage.submitUsername(credentials.loginUsername);
	await loginPage.waitForPasswordStep();
	await expect(loginPage.passwordInput).toBeVisible();

	await loginPage.submitPassword(credentials.loginPassword);
	await loginPage.handleTrustedDeviceIfVisible();
	await loginPage.handleDuplicateSessionIfVisible();
	await loginPage.waitForDashboard();
	await expect(loginPage.userOptionsButton).toBeVisible();

	return loginPage;
};