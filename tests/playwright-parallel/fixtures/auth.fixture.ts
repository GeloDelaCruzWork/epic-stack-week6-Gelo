import { test as base, Page } from '@playwright/test'

export type AuthFixtures = {
	authenticatedPage: Page
}

export const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ page }, use) => {
		// Navigate to login page
		await page.goto('/login')

		// Perform login using the actual form IDs
		await page.fill('#login-form-username', 'kody')
		await page.fill('#login-form-password', 'kodylovesyou')
		await page.click('button[type="submit"]:has-text("Log in")')

		// Wait for navigation after login
		await page.waitForURL((url) => !url.pathname.includes('/login'), {
			timeout: 10000,
		})

		// Verify we're logged in by checking we're on user page
		const currentUrl = page.url()
		if (currentUrl.includes('/login')) {
			throw new Error('Login failed - still on login page')
		}

		// Use the authenticated page
		await use(page)
	},
})

export { expect } from '@playwright/test'
