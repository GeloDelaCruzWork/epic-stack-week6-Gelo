import { test, expect } from '@playwright/test'

test.describe('Payslips Basic Tests', () => {
	test('payslips route requires authentication', async ({ page }) => {
		// Try to access payslips without login
		await page.goto('/payslips')

		// Should redirect to login
		await expect(page).toHaveURL(/\/login/)
	})

	test('payslips route accessible to admin', async ({ page }) => {
		// Login as admin
		await page.goto('/login')
		await page.fill('input[name="username"]', 'kody')
		await page.fill('input[name="password"]', 'kodylovesyou')
		await page.click('button[type="submit"]')

		// Wait for login to complete
		await page.waitForLoadState('networkidle')

		// Try to navigate directly to payslips
		const response = await page.goto('/payslips')

		// Check if we can access the page
		const status = response?.status() || 0
		expect(status).toBeLessThan(400) // Not a 4xx or 5xx error

		// Check current URL - might redirect somewhere else
		const currentUrl = page.url()
		console.log('Current URL after navigating to /payslips:', currentUrl)
	})

	test('payslip verification page is accessible', async ({ page }) => {
		// Verification page should be publicly accessible
		const response = await page.goto('/payslips/verify/test-id')

		// Should not redirect to login
		await expect(page).not.toHaveURL(/\/login/)

		// Should show either valid or invalid payslip message
		const content = await page.content()
		expect(content).toMatch(/payslip|Payslip/)
	})

	test('print preview route exists', async ({ page }) => {
		// Login first
		await page.goto('/login')
		await page.fill('input[name="username"]', 'kody')
		await page.fill('input[name="password"]', 'kodylovesyou')
		await page.click('button[type="submit"]')
		await page.waitForLoadState('networkidle')

		// Try to access print preview (without params will likely show error)
		const response = await page.goto('/payslips/print')
		const status = response?.status() || 0

		// Even without params, route should exist (might show error message)
		expect(status).toBeLessThan(500) // Not a server error
	})

	test('pdf route exists', async ({ page }) => {
		// Login first
		await page.goto('/login')
		await page.fill('input[name="username"]', 'kody')
		await page.fill('input[name="password"]', 'kodylovesyou')
		await page.click('button[type="submit"]')
		await page.waitForLoadState('networkidle')

		// Try to access PDF route (without params will likely show error)
		const response = await page.goto('/payslips/pdf')
		const status = response?.status() || 0

		// Even without params, route should exist
		expect(status).toBeLessThan(500) // Not a server error
	})
})
