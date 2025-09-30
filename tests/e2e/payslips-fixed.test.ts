import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'
import {
	createEmployee,
	createPayPeriod,
	createPayrollRun,
	createPayslip,
} from '#tests/db-utils.ts'

test.describe('Payslips Management', () => {
	test('can navigate to payslips page', async ({ page, login }) => {
		// Create user with admin role
		const user = await login()

		// Give user admin role
		await prisma.user.update({
			where: { id: user.id },
			data: {
				roles: {
					connect: { code: 'admin' },
				},
			},
		})

		// Navigate to payslips
		await page.goto('/payslips')

		// Verify we're on the payslips page
		await expect(page.locator('h1')).toContainText('Payslip Management')
		await expect(page.locator('text=Select Pay Period')).toBeVisible()
		await expect(page.locator('text=Select Employees')).toBeVisible()
	})

	test('shows payslips in dropdown menu for admin', async ({ page, login }) => {
		// Create user with admin role
		const user = await login()

		// Give user admin role
		await prisma.user.update({
			where: { id: user.id },
			data: {
				roles: {
					connect: { code: 'admin' },
				},
			},
		})

		// Navigate to home
		await page.goto('/')

		// Open user dropdown - click on the user link/button
		const userButton = page.locator(`a[href="/users/${user.username}"]`).first()
		await userButton.click()

		// Check that Payslips menu item exists
		await expect(page.locator('a[href="/payslips"]')).toBeVisible()
		await expect(page.locator('a[href="/payslips"]')).toContainText('Payslips')
	})

	test('can generate and preview payslips', async ({
		page,
		context,
		login,
	}) => {
		// Create admin user
		const user = await login()

		// Give user admin role
		await prisma.user.update({
			where: { id: user.id },
			data: {
				roles: {
					connect: { code: 'admin' },
				},
			},
		})

		// Create test data
		const payPeriod = await createPayPeriod({
			code: '2024-10-test',
			startDate: new Date('2024-10-01'),
			endDate: new Date('2024-10-15'),
			month: 10,
			year: 2024,
		})

		const employee = await createEmployee({
			employeeNo: 'TEST001',
			firstName: 'Test',
			lastName: 'Employee',
			email: 'test@example.com',
		})

		// Navigate to payslips
		await page.goto('/payslips')

		// Select pay period
		await page.selectOption('select[name="payPeriodId"]', payPeriod.id)

		// Select employee
		await page.check(`input[value="${employee.id}"]`)

		// Wait for new page promise before clicking generate
		const pagePromise = context.waitForEvent('page')

		// Click generate button
		await page.click('button:has-text("Generate & Preview Payslips")')

		// Wait for success toast
		await expect(page.locator('.sonner-toast-success')).toBeVisible({
			timeout: 10000,
		})

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

		// Clean up test data
		await prisma.employeePayslip.deleteMany({
			where: { employee_id: employee.id },
		})
		await prisma.payrollRun.deleteMany({
			where: { pay_period_id: payPeriod.id },
		})
		await prisma.employee.delete({ where: { id: employee.id } })
		await prisma.payPeriod.delete({ where: { id: payPeriod.id } })
	})

	test('can access payslip verification page', async ({ page }) => {
		// Create test payslip
		const employee = await createEmployee({
			employeeNo: 'VERIFY001',
			firstName: 'Verify',
			lastName: 'Test',
			email: 'verify@test.com',
		})

		const payPeriod = await createPayPeriod({
			code: '2024-10-verify',
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

		const payslip = await createPayslip({
			employeeId: employee.id,
			payrollRunId: payrollRun.id,
			basicPay: 30000,
			status: 'PAID',
		})

		// Navigate to verification URL
		await page.goto(`/payslips/verify/${payslip.id}`)

		// Check for verification content
		await expect(page.locator('h2')).toContainText('Payslip Verification')
		await expect(page.locator('text=authentic')).toBeVisible()

		// Verify employee details are displayed
		await expect(page.getByText('VERIFY001')).toBeVisible()
		await expect(page.getByText('Verify Test')).toBeVisible()

		// Clean up
		await prisma.employeePayslip.delete({ where: { id: payslip.id } })
		await prisma.payrollRun.delete({ where: { id: payrollRun.id } })
		await prisma.payPeriod.delete({ where: { id: payPeriod.id } })
		await prisma.employee.delete({ where: { id: employee.id } })
	})

	test('payslips route requires authentication', async ({ page }) => {
		// Try to access payslips without login
		await page.goto('/payslips')

		// Should redirect to login
		await expect(page).toHaveURL(/\/login/)
	})

	test('non-admin users cannot access payslips', async ({ page, login }) => {
		// Create regular user (without admin role)
		const user = await login()

		// Try to navigate to payslips
		await page.goto('/payslips')

		// Should not show payslip management page
		await expect(page.locator('h1')).not.toContainText('Payslip Management')

		// Could redirect to home or show unauthorized
		const url = page.url()
		expect(url).not.toContain('/payslips')
	})
})

test.describe('Payslip Print and PDF', () => {
	test('print preview route works', async ({ page, login }) => {
		// Create admin user
		const user = await login()

		// Give user admin role
		await prisma.user.update({
			where: { id: user.id },
			data: {
				roles: {
					connect: { code: 'admin' },
				},
			},
		})

		// Create test data
		const payPeriod = await createPayPeriod()
		const employee = await createEmployee()
		const payrollRun = await createPayrollRun({ payPeriodId: payPeriod.id })
		const payslip = await createPayslip({
			employeeId: employee.id,
			payrollRunId: payrollRun.id,
		})

		// Access print preview with params
		await page.goto(
			`/payslips/print?payPeriodId=${payPeriod.id}&employeeIds=${employee.id}`,
		)

		// Should show payslip content
		await expect(page.locator('.payslip')).toBeVisible()

		// Clean up
		await prisma.employeePayslip.delete({ where: { id: payslip.id } })
		await prisma.payrollRun.delete({ where: { id: payrollRun.id } })
		await prisma.payPeriod.delete({ where: { id: payPeriod.id } })
		await prisma.employee.delete({ where: { id: employee.id } })
	})
})
