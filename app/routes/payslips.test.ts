import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loader, action } from './payslips'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'

// Mock dependencies
vi.mock('#app/utils/auth.server', () => ({
	requireUserId: vi.fn(),
}))

vi.mock('#app/utils/db.server', () => ({
	prisma: {
		payPeriod: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
		employee: {
			findMany: vi.fn(),
		},
		employeePayslip: {
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			findFirst: vi.fn(),
		},
		payrollRun: {
			findFirst: vi.fn(),
			create: vi.fn(),
		},
	},
}))

describe('Payslips Route', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('loader', () => {
		it('loads pay periods and employees for authenticated users', async () => {
			const mockRequest = new Request('http://localhost:3000/payslips')
			vi.mocked(requireUserId).mockResolvedValue('user-123')

			const mockPayPeriods = [
				{
					id: 'pp-1',
					code: '2024-09-16',
					start_date: new Date('2024-09-16'),
					end_date: new Date('2024-09-30'),
					month: 9,
					year: 2024,
				},
			]

			const mockEmployees = [
				{
					id: 'emp-1',
					employee_no: 'EMP001',
					first_name: 'John',
					last_name: 'Doe',
					middle_name: null,
					email: 'john@example.com',
					department_id: 'dept-1',
				},
			]

			vi.mocked(prisma.payPeriod.findMany).mockResolvedValue(mockPayPeriods)
			vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees)
			vi.mocked(prisma.employeePayslip.findMany).mockResolvedValue([])

			const response = await loader({
				request: mockRequest,
				params: {},
				context: {},
			})
			const data = response

			expect(requireUserId).toHaveBeenCalledWith(mockRequest)
			expect(data.payPeriods).toHaveLength(1)
			expect(data.employees).toHaveLength(1)
			expect(data.existingPayslips).toEqual([])
		})

		it('handles payPeriodId query parameter', async () => {
			const mockRequest = new Request(
				'http://localhost:3000/payslips?payPeriodId=pp-1',
			)
			vi.mocked(requireUserId).mockResolvedValue('user-123')

			const mockPayPeriod = {
				id: 'pp-1',
				code: '2024-09-16',
				start_date: new Date('2024-09-16'),
				end_date: new Date('2024-09-30'),
				month: 9,
				year: 2024,
			}

			vi.mocked(prisma.payPeriod.findMany).mockResolvedValue([mockPayPeriod])
			vi.mocked(prisma.employee.findMany).mockResolvedValue([])
			vi.mocked(prisma.payPeriod.findUnique).mockResolvedValue(mockPayPeriod)
			vi.mocked(prisma.employeePayslip.findMany).mockResolvedValue([])

			const response = await loader({
				request: mockRequest,
				params: {},
				context: {},
			})
			const data = response

			expect(prisma.payPeriod.findUnique).toHaveBeenCalledWith({
				where: { id: 'pp-1' },
			})
			expect(data.selectedPayPeriod).toEqual(mockPayPeriod)
		})

		it('handles employeeIds query parameter', async () => {
			const mockRequest = new Request(
				'http://localhost:3000/payslips?employeeIds=emp-1,emp-2',
			)
			vi.mocked(requireUserId).mockResolvedValue('user-123')

			vi.mocked(prisma.payPeriod.findMany).mockResolvedValue([])
			vi.mocked(prisma.employee.findMany).mockResolvedValue([])
			vi.mocked(prisma.employeePayslip.findMany).mockResolvedValue([])

			const response = await loader({
				request: mockRequest,
				params: {},
				context: {},
			})
			const data = response

			expect(data.selectedEmployeeIds).toEqual(['emp-1', 'emp-2'])
		})
	})

	describe('action', () => {
		it('generates payslips for selected employees', async () => {
			const formData = new FormData()
			formData.set('intent', 'generate')
			formData.set('payPeriodId', 'pp-1')
			formData.append('employeeIds', 'emp-1')
			formData.append('employeeIds', 'emp-2')

			const mockRequest = new Request('http://localhost:3000/payslips', {
				method: 'POST',
				body: formData,
			})

			vi.mocked(requireUserId).mockResolvedValue('user-123')

			const mockPayrollRun = {
				id: 'pr-1',
				pay_period_id: 'pp-1',
				payroll_type: 'REGULAR',
				status: 'PROCESSING',
				created_at: new Date(),
				updated_at: new Date(),
			}

			vi.mocked(prisma.payrollRun.findFirst).mockResolvedValue(null)
			vi.mocked(prisma.payrollRun.create).mockResolvedValue(mockPayrollRun)

			const mockEmployees = [
				{
					id: 'emp-1',
					employee_no: 'EMP001',
					first_name: 'John',
					last_name: 'Doe',
					middle_name: null,
					email: 'john@example.com',
					department_id: 'dept-1',
				},
				{
					id: 'emp-2',
					employee_no: 'EMP002',
					first_name: 'Jane',
					last_name: 'Smith',
					middle_name: null,
					email: 'jane@example.com',
					department_id: 'dept-1',
				},
			]

			vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees)
			vi.mocked(prisma.employeePayslip.findFirst).mockResolvedValue(null)

			const mockPayslip = {
				id: 'payslip-1',
				employee_id: 'emp-1',
				payroll_run_id: 'pr-1',
				basic_pay: 30000,
				overtime_pay: 0,
				night_diff_pay: 0,
				holiday_pay: 0,
				allowances_total: 0,
				absences_amount: 0,
				tardiness_amount: 0,
				loans_total: 0,
				other_deductions: 0,
				sss_ee: 1350,
				sss_er: 2000,
				philhealth_ee: 375,
				philhealth_er: 375,
				hdmf_ee: 200,
				hdmf_er: 200,
				taxable_income: 28075,
				withholding_tax: 2000,
				gross_pay: 30000,
				total_deductions: 3925,
				net_pay: 26075,
				status: 'DRAFT',
				created_at: new Date(),
				updated_at: new Date(),
				allowances_detail: null,
				loans_detail: null,
				other_deductions_detail: null,
			}

			vi.mocked(prisma.employeePayslip.create).mockResolvedValue(mockPayslip)

			const response = await action({
				request: mockRequest,
				params: {},
				context: {},
			})

			expect(prisma.payrollRun.create).toHaveBeenCalled()
			expect(prisma.employeePayslip.create).toHaveBeenCalledTimes(2) // For 2 employees
			expect(response).toEqual({
				success: true,
				message: 'Generated 2 payslips for pay period pp-1',
				payPeriodId: 'pp-1',
				employeeIds: ['emp-1', 'emp-2'],
			})
		})

		it('updates existing payslips instead of creating duplicates', async () => {
			const formData = new FormData()
			formData.set('intent', 'generate')
			formData.set('payPeriodId', 'pp-1')
			formData.append('employeeIds', 'emp-1')

			const mockRequest = new Request('http://localhost:3000/payslips', {
				method: 'POST',
				body: formData,
			})

			vi.mocked(requireUserId).mockResolvedValue('user-123')

			const existingPayslip = {
				id: 'existing-payslip-1',
				employee_id: 'emp-1',
				payroll_run_id: 'pr-1',
				basic_pay: 25000,
				// ... other fields
			}

			vi.mocked(prisma.payrollRun.findFirst).mockResolvedValue({
				id: 'pr-1',
				pay_period_id: 'pp-1',
				payroll_type: 'REGULAR',
				status: 'PROCESSING',
				created_at: new Date(),
				updated_at: new Date(),
			})

			vi.mocked(prisma.employee.findMany).mockResolvedValue([
				{
					id: 'emp-1',
					employee_no: 'EMP001',
					first_name: 'John',
					last_name: 'Doe',
					middle_name: null,
					email: 'john@example.com',
					department_id: 'dept-1',
				},
			])

			vi.mocked(prisma.employeePayslip.findFirst).mockResolvedValue(
				existingPayslip,
			)
			vi.mocked(prisma.employeePayslip.update).mockResolvedValue({
				...existingPayslip,
				basic_pay: 30000,
			})

			const response = await action({
				request: mockRequest,
				params: {},
				context: {},
			})

			expect(prisma.employeePayslip.update).toHaveBeenCalledWith({
				where: { id: 'existing-payslip-1' },
				data: expect.objectContaining({
					basic_pay: expect.any(Number),
				}),
			})
			expect(prisma.employeePayslip.create).not.toHaveBeenCalled()
			expect(response.success).toBe(true)
		})

		it('returns error for missing required fields', async () => {
			const formData = new FormData()
			formData.set('intent', 'generate')
			// Missing payPeriodId and employeeIds

			const mockRequest = new Request('http://localhost:3000/payslips', {
				method: 'POST',
				body: formData,
			})

			vi.mocked(requireUserId).mockResolvedValue('user-123')

			const response = await action({
				request: mockRequest,
				params: {},
				context: {},
			})

			expect(response).toEqual({
				error: 'Pay period and employees are required',
			})
		})

		it('returns error for invalid intent', async () => {
			const formData = new FormData()
			formData.set('intent', 'invalid')

			const mockRequest = new Request('http://localhost:3000/payslips', {
				method: 'POST',
				body: formData,
			})

			vi.mocked(requireUserId).mockResolvedValue('user-123')

			const response = await action({
				request: mockRequest,
				params: {},
				context: {},
			})

			expect(response).toEqual({
				error: 'Invalid intent',
			})
		})
	})
})
