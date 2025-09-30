import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PayslipLayout, PayslipSheet } from './payslip-layout'
import type { PayslipData } from './payslip-layout'

describe('PayslipLayout Component', () => {
	const mockPayslipData: PayslipData = {
		employeeId: 'emp-123',
		employeeNo: 'EMP001',
		employeeName: 'John Doe',
		email: 'john.doe@example.com',
		position: 'Software Engineer',
		department: 'Engineering',
		payPeriod: {
			id: 'pp-123',
			startDate: '2024-09-16',
			endDate: '2024-09-30',
			month: '9',
			year: '2024',
		},
		earnings: {
			basicPay: 50000,
			overtimePay: 5000,
			nightDiffPay: 2000,
			holidayPay: 3000,
			allowances: [
				{ name: 'Transport', amount: 1500 },
				{ name: 'Meal', amount: 2000 },
			],
			totalEarnings: 63500,
		},
		deductions: {
			absences: 1000,
			tardiness: 500,
			loans: [{ type: 'SSS Loan', amount: 2000 }],
			sssEE: 1600,
			philhealthEE: 437.5,
			hdmfEE: 200,
			withholdingTax: 8000,
			otherDeductions: [],
			totalDeductions: 13737.5,
		},
		netPay: 49762.5,
		verificationUrl: 'http://localhost:3000/payslips/verify/123',
		status: 'DRAFT',
	}

	it('renders employee information correctly', () => {
		render(<PayslipLayout data={mockPayslipData} />)

		expect(screen.getByText('EMP001')).toBeInTheDocument()
		expect(screen.getByText('John Doe')).toBeInTheDocument()
		expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
		expect(screen.getByText('Software Engineer')).toBeInTheDocument()
		expect(screen.getByText('Engineering')).toBeInTheDocument()
	})

	it('renders earnings section with correct values', () => {
		render(<PayslipLayout data={mockPayslipData} />)

		expect(screen.getByText('Basic Pay')).toBeInTheDocument()
		expect(screen.getByText('₱50,000.00')).toBeInTheDocument()
		expect(screen.getByText('Overtime Pay')).toBeInTheDocument()
		expect(screen.getByText('₱5,000.00')).toBeInTheDocument()
		expect(screen.getByText('Transport')).toBeInTheDocument()
		expect(screen.getByText('₱1,500.00')).toBeInTheDocument()
	})

	it('renders deductions section with correct values', () => {
		render(<PayslipLayout data={mockPayslipData} />)

		expect(screen.getByText('SSS Contribution')).toBeInTheDocument()
		expect(screen.getByText('₱1,600.00')).toBeInTheDocument()
		expect(screen.getByText('PhilHealth')).toBeInTheDocument()
		expect(screen.getByText('Withholding Tax')).toBeInTheDocument()
	})

	it('calculates and displays net pay correctly', () => {
		render(<PayslipLayout data={mockPayslipData} />)

		expect(screen.getByText('NET PAY')).toBeInTheDocument()
		expect(screen.getByText('₱49,762.50')).toBeInTheDocument()
	})

	it('shows watermark when provided', () => {
		render(<PayslipLayout data={mockPayslipData} watermark="DRAFT" />)

		expect(screen.getByText('DRAFT')).toHaveClass('payslip-watermark')
	})

	it('does not show QR code when showQRCode is false', () => {
		render(<PayslipLayout data={mockPayslipData} showQRCode={false} />)

		const qrCode = screen.queryByAltText('Verification QR Code')
		expect(qrCode).not.toBeInTheDocument()
	})

	it('handles zero amounts correctly', () => {
		const dataWithZeros: PayslipData = {
			...mockPayslipData,
			earnings: {
				...mockPayslipData.earnings,
				overtimePay: 0,
				nightDiffPay: 0,
				holidayPay: 0,
			},
		}

		render(<PayslipLayout data={dataWithZeros} />)

		expect(screen.queryByText('Overtime Pay')).not.toBeInTheDocument()
		expect(screen.queryByText('Night Differential')).not.toBeInTheDocument()
		expect(screen.queryByText('Holiday Pay')).not.toBeInTheDocument()
	})
})

describe('PayslipSheet Component', () => {
	const mockPayslips: PayslipData[] = [
		{
			employeeId: 'emp-1',
			employeeNo: 'EMP001',
			employeeName: 'John Doe',
			payPeriod: {
				id: 'pp-1',
				startDate: '2024-09-16',
				endDate: '2024-09-30',
				month: '9',
				year: '2024',
			},
			earnings: {
				basicPay: 30000,
				overtimePay: 0,
				nightDiffPay: 0,
				holidayPay: 0,
				allowances: [],
				totalEarnings: 30000,
			},
			deductions: {
				absences: 0,
				tardiness: 0,
				loans: [],
				sssEE: 1350,
				philhealthEE: 375,
				hdmfEE: 200,
				withholdingTax: 2000,
				otherDeductions: [],
				totalDeductions: 3925,
			},
			netPay: 26075,
		},
		{
			employeeId: 'emp-2',
			employeeNo: 'EMP002',
			employeeName: 'Jane Smith',
			payPeriod: {
				id: 'pp-1',
				startDate: '2024-09-16',
				endDate: '2024-09-30',
				month: '9',
				year: '2024',
			},
			earnings: {
				basicPay: 35000,
				overtimePay: 3000,
				nightDiffPay: 0,
				holidayPay: 0,
				allowances: [],
				totalEarnings: 38000,
			},
			deductions: {
				absences: 0,
				tardiness: 0,
				loans: [],
				sssEE: 1575,
				philhealthEE: 437.5,
				hdmfEE: 200,
				withholdingTax: 3500,
				otherDeductions: [],
				totalDeductions: 5712.5,
			},
			netPay: 32287.5,
		},
		{
			employeeId: 'emp-3',
			employeeNo: 'EMP003',
			employeeName: 'Bob Johnson',
			payPeriod: {
				id: 'pp-1',
				startDate: '2024-09-16',
				endDate: '2024-09-30',
				month: '9',
				year: '2024',
			},
			earnings: {
				basicPay: 40000,
				overtimePay: 0,
				nightDiffPay: 0,
				holidayPay: 0,
				allowances: [],
				totalEarnings: 40000,
			},
			deductions: {
				absences: 0,
				tardiness: 0,
				loans: [],
				sssEE: 1800,
				philhealthEE: 500,
				hdmfEE: 200,
				withholdingTax: 5000,
				otherDeductions: [],
				totalDeductions: 7500,
			},
			netPay: 32500,
		},
	]

	it('groups payslips into pairs for 2-per-page layout', () => {
		const { container } = render(<PayslipSheet payslips={mockPayslips} />)

		const sheets = container.querySelectorAll('.payslip-sheet')
		expect(sheets).toHaveLength(2) // 3 payslips = 2 sheets (2 + 1)
	})

	it('renders all payslips', () => {
		render(<PayslipSheet payslips={mockPayslips} />)

		expect(screen.getByText('EMP001')).toBeInTheDocument()
		expect(screen.getByText('EMP002')).toBeInTheDocument()
		expect(screen.getByText('EMP003')).toBeInTheDocument()
		expect(screen.getByText('John Doe')).toBeInTheDocument()
		expect(screen.getByText('Jane Smith')).toBeInTheDocument()
		expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
	})

	it('adds empty space for odd number of payslips', () => {
		const { container } = render(<PayslipSheet payslips={mockPayslips} />)

		const lastSheet = container.querySelectorAll('.payslip-sheet')[1]
		const payslipsInLastSheet = lastSheet?.querySelectorAll('.payslip')

		expect(payslipsInLastSheet).toHaveLength(2) // 1 actual + 1 empty
	})

	it('applies watermark to all payslips', () => {
		render(<PayslipSheet payslips={mockPayslips} watermark="CONFIDENTIAL" />)

		const watermarks = screen.getAllByText('CONFIDENTIAL')
		expect(watermarks).toHaveLength(3) // One for each payslip
	})
})
