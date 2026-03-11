import { expect, test as base, type Page } from '@playwright/test';

import { requiredEnv } from '../helpers/env';
import { LoginPage } from '../pages/LoginPage';

type AuthenticatedPageFixtures = {
	authenticatedPage: Page;
};

export const test = base.extend<AuthenticatedPageFixtures>({
	authenticatedPage: async ({ page }, use) => {
		const loginPage = new LoginPage(page);

		await loginPage.registerCookieBannerHandler();
		await loginPage.gotoLogin(requiredEnv('LOGIN_URL'));
		await loginPage.acceptCookiesIfVisible();
		await loginPage.waitForUsernameInput();
		await loginPage.submitUsername(requiredEnv('LOGIN_USERNAME'));
		await loginPage.waitForPasswordStep();
		await loginPage.submitPassword(requiredEnv('LOGIN_PASSWORD'));
		await loginPage.handleTrustedDeviceIfVisible();
		await loginPage.handleDuplicateSessionIfVisible();
		await loginPage.waitForDashboard();

		await use(page);
	},
});

export { expect };