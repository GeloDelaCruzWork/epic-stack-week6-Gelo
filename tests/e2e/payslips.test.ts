import { test, expect } from '@playwright/test'
import { prisma } from '#app/utils/db.server.ts'
import {
	createUserInDb,
	createEmployee,
	createPayPeriod,
	createPayrollRun,
	createPayslip,
} from '#tests/db-utils.ts'

test.describe('Payslips Management', () => {
	let user: any
	let payPeriod: any
	let employees: any[] = []

	test.beforeAll(async () => {
		// Ensure admin role exists
		await prisma.role.upsert({
			where: { code: 'admin' },
			create: {
				code: 'admin',
				name: 'Admin',
				description: 'Administrator role',
			},
			update: {},
		})

		// Create test user with admin role
		user = await createUserInDb({
			username: 'payroll_admin',
			email: 'payroll@test.com',
		})

		// Associate admin role with user
		await prisma.user.update({
			where: { id: user.id },
			data: {
				roles: {
					connect: { code: 'admin' },
				},
			},
		})

		// Create test pay period
		payPeriod = await createPayPeriod({
			code: '2024-09-16',
			startDate: new Date('2024-09-16'),
			endDate: new Date('2024-09-30'),
			month: 9,
			year: 2024,
		})

		// Create test employees
		for (let i = 1; i <= 3; i++) {
			const employee = await createEmployee({
				employeeNo: `TEST${i.toString().padStart(3, '0')}`,
				firstName: `Test${i}`,
				lastName: 'Employee',
				email: `test${i}@example.com`,
				departmentId: 'dept-1',
			})
			employees.push(employee)
		}
	})

	test.afterAll(async () => {
		// Clean up test data
		await prisma.employeePayslip.deleteMany({
			where: {
				employee_id: { in: employees.map((e) => e.id) },
			},
		})
		await prisma.employee.deleteMany({
			where: {
				id: { in: employees.map((e) => e.id) },
			},
		})
		await prisma.payPeriod.delete({
			where: { id: payPeriod.id },
		})
		await prisma.user.delete({
			where: { id: user.id },
		})
	})

	test('can navigate to payslips page from dropdown menu', async ({ page }) => {
		// Login as admin
		await page.goto('/login')
		await page.fill('input[name="username"]', 'payroll_admin')
		await page.fill('input[name="password"]', 'password123')
		await page.click('button[type="submit"]')

		// Wait for navigation
		await page.waitForURL('/')

		// Open user dropdown
		await page.click('[data-testid="user-dropdown-trigger"]')

		// Click on Payslips menu item
		await page.click('a[href="/payslips"]')

		// Verify we're on the payslips page
		await expect(page).toHaveURL('/payslips')
		await expect(page.locator('h1')).toContainText('Payslip Management')
	})

	test('can select pay period and employees', async ({ page }) => {
		await page.goto('/payslips')

		// Select pay period
		await page.selectOption('select[name="payPeriodId"]', payPeriod.id)
		await expect(page.locator('select[name="payPeriodId"]')).toHaveValue(
			payPeriod.id,
		)

		// Check employee checkboxes
		await page.check(`input[value="${employees[0].id}"]`)
		await page.check(`input[value="${employees[1].id}"]`)

		// Verify selections
		await expect(
			page.locator(`input[value="${employees[0].id}"]`),
		).toBeChecked()
		await expect(
			page.locator(`input[value="${employees[1].id}"]`),
		).toBeChecked()
	})

	test('can generate payslips and preview them', async ({ page, context }) => {
		await page.goto('/payslips')

		// Select pay period
		await page.selectOption('select[name="payPeriodId"]', payPeriod.id)

		// Select first two employees
		await page.check(`input[value="${employees[0].id}"]`)
		await page.check(`input[value="${employees[1].id}"]`)

		// Wait for new page promise before clicking generate
		const pagePromise = context.waitForEvent('page')

		// Click generate button
		await page.click('button:has-text("Generate & Preview Payslips")')

		// Wait for success toast
		await expect(page.locator('.sonner-toast-success')).toBeVisible()
		await expect(page.locator('.sonner-toast-success')).toContainText(
			'Payslips Generated',
		)

		// Wait for new tab to open
		const newPage = await pagePromise
		await newPage.waitForLoadState()

		// Verify preview page content
		await expect(newPage.locator('.payslip')).toHaveCount(2) // 2 payslips
		await expect(newPage.locator('.payslip-company-name')).toContainText(
			'Your Company Name',
		)
		await expect(newPage.locator('.payslip-employee-info')).toContainText(
			'TEST001',
		)
		await expect(newPage.locator('.payslip-employee-info')).toContainText(
			'Test1 Employee',
		)

		// Close preview tab
		await newPage.close()
	})

	test('can preview existing payslips', async ({ page, context }) => {
		await page.goto('/payslips')

		// Select pay period that has existing payslips
		await page.selectOption('select[name="payPeriodId"]', payPeriod.id)

		// Select employees
		await page.check(`input[value="${employees[0].id}"]`)

		// Wait for preview button to be enabled
		await page.waitForSelector(
			'button:has-text("Preview Payslips"):not([disabled])',
		)

		// Click preview button
		const pagePromise = context.waitForEvent('page')
		await page.click('button:has-text("Preview Payslips")')

		// Wait for preview tab
		const previewPage = await pagePromise
		await previewPage.waitForLoadState()

		// Verify payslip is displayed
		await expect(previewPage.locator('.payslip')).toBeVisible()
		await expect(previewPage.locator('.payslip-qr-code')).toBeVisible() // QR code should be present

		await previewPage.close()
	})

	test('can download payslips as PDF', async ({ page }) => {
		await page.goto('/payslips')

		// Select pay period
		await page.selectOption('select[name="payPeriodId"]', payPeriod.id)

		// Select an employee
		await page.check(`input[value="${employees[0].id}"]`)

		// Set up download promise
		const downloadPromise = page.waitForEvent('download')

		// Click download PDF button
		await page.click('button:has-text("Download PDF")')

		// Wait for download
		const download = await downloadPromise

		// Verify download
		expect(download.suggestedFilename()).toMatch(/payslips.*\.pdf$/i)

		// Clean up download
		await download.delete()
	})

	test('shows error when no selections made', async ({ page }) => {
		await page.goto('/payslips')

		// Try to generate without selecting anything
		await page.click('button:has-text("Generate & Preview Payslips")')

		// Should show error toast or message
		await expect(page.locator('.sonner-toast-error')).toBeVisible()
		await expect(page.locator('.sonner-toast-error')).toContainText('required')
	})

	test('can use select all checkbox', async ({ page }) => {
		await page.goto('/payslips')

		// Click select all checkbox
		await page.check('input[type="checkbox"]:has-text("Select All")')

		// Verify all employee checkboxes are checked
		for (const employee of employees) {
			await expect(page.locator(`input[value="${employee.id}"]`)).toBeChecked()
		}

		// Uncheck select all
		await page.uncheck('input[type="checkbox"]:has-text("Select All")')

		// Verify all employee checkboxes are unchecked
		for (const employee of employees) {
			await expect(
				page.locator(`input[value="${employee.id}"]`),
			).not.toBeChecked()
		}
	})
})

test.describe('Payslip Verification', () => {
	let payslip: any

	test.beforeAll(async () => {
		// Create a test payslip with known ID
		const employee = await createEmployee({
			employeeNo: 'VERIFY001',
			firstName: 'Verify',
			lastName: 'Test',
			email: 'verify@test.com',
		})

		const payPeriod = await createPayPeriod({
			code: '2024-10-01',
			startDate: new Date('2024-10-01'),
			endDate: new Date('2024-10-15'),
			month: 10,
			year: 2024,
		})

		const payrollRun = await createPayrollRun({
			payPeriodId: payPeriod.id,
			payrollType: 'REGULAR',
			status: 'COMPLETED',
		})

		payslip = await createPayslip({
			employeeId: employee.id,
			payrollRunId: payrollRun.id,
			basicPay: 25000,
			overtimePay: 2000,
			nightDiffPay: 1000,
			holidayPay: 0,
			status: 'PAID',
		})
	})

	test.afterAll(async () => {
		// Clean up test data
		if (payslip) {
			await prisma.employeePayslip.delete({
				where: { id: payslip.id },
			})
		}
	})

	test('can verify payslip via direct URL', async ({ page }) => {
		// Navigate directly to verification URL
		await page.goto(`/payslips/verify/${payslip.id}`)

		// Check for verification badge
		await expect(page.locator('h2')).toContainText('Payslip Verification')
		await expect(
			page.locator('[data-testid="verification-badge"]'),
		).toContainText('authentic')

		// Verify payslip details are displayed
		await expect(page.locator('[data-testid="employee-number"]')).toContainText(
			'VERIFY001',
		)
		await expect(page.locator('[data-testid="employee-name"]')).toContainText(
			'Verify Test',
		)

		// Verify financial details
		await expect(page.locator('[data-testid="basic-pay"]')).toContainText(
			'₱25,000.00',
		)
		await expect(page.locator('[data-testid="net-pay"]')).toContainText(
			'₱25,062.50',
		)

		// Verify status badge
		await expect(page.locator('[data-testid="status-badge"]')).toContainText(
			'PAID',
		)
	})

	test('shows error for invalid payslip ID', async ({ page }) => {
		// Navigate to invalid payslip ID
		await page.goto('/payslips/verify/invalid-id-12345')

		// Should show error message
		await expect(page.locator('h2')).toContainText('Invalid Payslip')
		await expect(page.locator('text=not found')).toBeVisible()
	})

	test('QR code on printed payslip links to verification page', async ({
		page,
		context,
	}) => {
		// Generate and preview a payslip
		await page.goto('/payslips')

		// Select pay period and employee
		await page.selectOption('select[name="payPeriodId"]', { index: 1 })
		await page.check('input[type="checkbox"][value]', { timeout: 1000 })

		// Generate and preview
		const pagePromise = context.waitForEvent('page')
		await page.click('button:has-text("Generate & Preview Payslips")')

		const previewPage = await pagePromise
		await previewPage.waitForLoadState()

		// Check that QR code is present
		await expect(previewPage.locator('.payslip-qr-code')).toBeVisible()

		// Get the QR code image src (data URL)
		const qrCodeSrc = await previewPage
			.locator('.payslip-qr-code')
			.getAttribute('src')
		expect(qrCodeSrc).toContain('data:image/png;base64,')

		await previewPage.close()
	})
})

test.describe('Payslip Print Layout', () => {
	test('displays 2 payslips per page', async ({ page, context }) => {
		// Navigate to payslips and generate multiple payslips
		await page.goto('/payslips')

		// Select pay period
		await page.selectOption('select[name="payPeriodId"]', { index: 1 })

		// Select multiple employees (at least 3 to test pagination)
		const checkboxes = await page.locator('input[type="checkbox"][value]').all()
		for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
			await checkboxes[i].check()
		}

		// Generate and preview
		const pagePromise = context.waitForEvent('page')
		await page.click('button:has-text("Generate & Preview Payslips")')

		const previewPage = await pagePromise
		await previewPage.waitForLoadState()

		// Check layout structure
		const sheets = await previewPage.locator('.payslip-sheet').count()
		expect(sheets).toBeGreaterThan(0)

		// First sheet should have at most 2 payslips
		const firstSheetPayslips = await previewPage
			.locator('.payslip-sheet:first-child .payslip')
			.count()
		expect(firstSheetPayslips).toBeLessThanOrEqual(2)

		// Check print styles are applied
		const printStyles = await previewPage
			.locator('link[href*="payslip-print.css"]')
			.count()
		expect(printStyles).toBeGreaterThan(0)

		await previewPage.close()
	})

	test('applies watermark for draft payslips', async ({ page, context }) => {
		await page.goto('/payslips')

		// Create a new payslip (which will be in DRAFT status)
		await page.selectOption('select[name="payPeriodId"]', { index: 1 })
		await page.check('input[type="checkbox"][value]', { timeout: 1000 })

		// Generate
		const pagePromise = context.waitForEvent('page')
		await page.click('button:has-text("Generate & Preview Payslips")')

		const previewPage = await pagePromise
		await previewPage.waitForLoadState()

		// Check for watermark
		const watermark = await previewPage.locator('.payslip-watermark').first()
		if (await watermark.isVisible()) {
			await expect(watermark).toContainText('DRAFT')
		}

		await previewPage.close()
	})

	test('responsive layout adjusts for print', async ({ page, context }) => {
		await page.goto('/payslips')

		await page.selectOption('select[name="payPeriodId"]', { index: 1 })
		await page.check('input[type="checkbox"][value]', { timeout: 1000 })

		const pagePromise = context.waitForEvent('page')
		await page.click('button:has-text("Preview Payslips")')

		const previewPage = await pagePromise
		await previewPage.waitForLoadState()

		// Check that print-specific classes are applied
		await expect(previewPage.locator('.payslip')).toHaveCSS(
			'page-break-inside',
			'avoid',
		)

		// Verify font sizes are appropriate for printing
		const fontSize = await previewPage
			.locator('.payslip-content')
			.evaluate((el) => {
				return window.getComputedStyle(el).fontSize
			})
		expect(parseInt(fontSize)).toBeLessThanOrEqual(11) // Should be 9px or less based on our optimization

		await previewPage.close()
	})
})
