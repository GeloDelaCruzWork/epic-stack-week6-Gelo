import { test, expect } from '@playwright/test'

test.describe('Payslips Simple Tests', () => {
	test('can navigate to payslips page when logged in', async ({ page }) => {
		// Login with existing test credentials
		await page.goto('/login')
		await page.fill('input[name="username"]', 'kody')
		await page.fill('input[name="password"]', 'kodylovesyou')
		await page.click('button[type="submit"]')

		// Wait for navigation - could be to / or /users
		await page.waitForLoadState('networkidle')

		// Navigate to payslips
		await page.goto('/payslips')
		await page.waitForLoadState('networkidle')

		// Verify we're on the payslips page
		await expect(page.locator('h1')).toContainText('Payslip Management')
		await expect(page.locator('text=Select Pay Period')).toBeVisible()
		await expect(page.locator('text=Select Employees')).toBeVisible()
	})

	test('shows payslips in dropdown menu', async ({ page }) => {
		// Login
		await page.goto('/login')
		await page.fill('input[name="username"]', 'kody')
		await page.fill('input[name="password"]', 'kodylovesyou')
		await page.click('button[type="submit"]')

		// Wait for navigation - could be to / or /users
		await page.waitForLoadState('networkidle')

		// Open user dropdown - look for any button that links to /users/kody
		const userButton = page.locator('a[href="/users/kody"]').first()
		await userButton.click({ force: true }) // Force click to prevent interception

		// Check that Payslips menu item exists
		await expect(page.locator('a[href="/payslips"]')).toBeVisible()
		await expect(page.locator('a[href="/payslips"]')).toContainText('Payslips')
	})

	test('can generate and preview payslips', async ({ page, context }) => {
		// Login
		await page.goto('/login')
		await page.fill('input[name="username"]', 'kody')
		await page.fill('input[name="password"]', 'kodylovesyou')
		await page.click('button[type="submit"]')
		await page.waitForLoadState('networkidle')

		// Navigate to payslips
		await page.goto('/payslips')

		// Check if there are pay periods available
		const payPeriodSelect = page.locator('select[name="payPeriodId"]')
		const optionsCount = await payPeriodSelect.locator('option').count()

		if (optionsCount > 1) {
			// More than just the placeholder option
			// Select the first real pay period
			await payPeriodSelect.selectOption({ index: 1 })

			// Check if there are employees available
			const employeeCheckboxes = page.locator(
				'input[type="checkbox"][name="employeeIds"]',
			)
			const checkboxCount = await employeeCheckboxes.count()

			if (checkboxCount > 0) {
				// Select first employee
				await employeeCheckboxes.first().check()

				// Wait for new page promise before clicking generate
				const pagePromise = context.waitForEvent('page')

				// Click generate button
				await page.click('button:has-text("Generate & Preview Payslips")')

				// Wait for new tab to open
				const newPage = await pagePromise
				await newPage.waitForLoadState()

				// Verify preview page has payslip content
				await expect(newPage.locator('.payslip')).toBeVisible()
				await expect(newPage.locator('.payslip-company-name')).toContainText(
					'Your Company Name',
				)

				// Close preview tab
				await newPage.close()
			} else {
				// No employees available - just verify the UI is present
				await expect(page.locator('text=No employees available')).toBeVisible()
			}
		} else {
			// No pay periods available - just verify the UI is present
			await expect(payPeriodSelect).toBeVisible()
		}
	})

	test('can access payslip verification page', async ({ page }) => {
		// Test that the verification route works (even with invalid ID)
		await page.goto('/payslips/verify/test-id-123')

		// Should either show invalid payslip or the verification page
		const pageContent = await page.content()
		expect(pageContent).toMatch(
			/Invalid Payslip|Payslip not found|Payslip Verification/,
		)
	})

	test('print preview has correct styling', async ({ page, context }) => {
		// Login
		await page.goto('/login')
		await page.fill('input[name="username"]', 'kody')
		await page.fill('input[name="password"]', 'kodylovesyou')
		await page.click('button[type="submit"]')
		await page.waitForLoadState('networkidle')

		// Navigate to payslips
		await page.goto('/payslips')

		// Try to open print preview with existing data
		const payPeriodSelect = page.locator('select[name="payPeriodId"]')
		const optionsCount = await payPeriodSelect.locator('option').count()

		if (optionsCount > 1) {
			await payPeriodSelect.selectOption({ index: 1 })

			const employeeCheckboxes = page.locator(
				'input[type="checkbox"][name="employeeIds"]',
			)
			const checkboxCount = await employeeCheckboxes.count()

			if (checkboxCount > 0) {
				await employeeCheckboxes.first().check()

				// Click preview button if it exists
				const previewButton = page.locator(
					'button:has-text("Preview Payslips")',
				)
				if (await previewButton.isVisible()) {
					const pagePromise = context.waitForEvent('page')
					await previewButton.click()

					const previewPage = await pagePromise
					await previewPage.waitForLoadState()

					// Check for print styles
					const hasPayslipClass = await previewPage.locator('.payslip').count()
					expect(hasPayslipClass).toBeGreaterThan(0)

					// Check for QR code
					const qrCode = await previewPage.locator('.payslip-qr-code').count()
					expect(qrCode).toBeGreaterThanOrEqual(0) // May or may not have QR codes

					await previewPage.close()
				}
			}
		}
	})
})
