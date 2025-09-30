import { type LoaderFunctionArgs } from 'react-router'
import { prisma } from '#app/utils/db.server.ts'
import { renderToString } from 'react-dom/server'
import {
	PayslipSheet,
	type PayslipData,
	generateQRCodes,
} from '#app/components/payslip/payslip-layout.server.tsx'
import fs from 'fs'
import path from 'path'

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const employeeIds = url.searchParams.getAll('id')
	const payPeriodId = url.searchParams.get('period')
	const watermark = url.searchParams.get('watermark')

	if (!payPeriodId) {
		throw new Response('Pay period ID is required', { status: 400 })
	}

	if (employeeIds.length === 0) {
		throw new Response('At least one employee ID is required', { status: 400 })
	}

	// Fetch pay period details
	const payPeriod = await prisma.payPeriod.findUnique({
		where: { id: payPeriodId },
		select: {
			id: true,
			code: true,
			year: true,
			month: true,
			from: true,
			to: true,
			start_date: true,
			end_date: true,
		},
	})

	if (!payPeriod) {
		throw new Response('Pay period not found', { status: 404 })
	}

	// First, find the payroll run for this pay period
	const payrollRun = await prisma.payrollRun.findFirst({
		where: {
			pay_period_id: payPeriodId,
			payroll_type: 'REGULAR',
		},
	})

	if (!payrollRun) {
		throw new Response('No payroll run found for this pay period', {
			status: 404,
		})
	}

	// Fetch payslips for selected employees
	const payslips = await prisma.employeePayslip.findMany({
		where: {
			employee_id: { in: employeeIds },
			payroll_run_id: payrollRun.id,
		},
	})

	// Fetch employee details
	const employees = await prisma.employee.findMany({
		where: { id: { in: employeeIds } },
		select: {
			id: true,
			employee_no: true,
			first_name: true,
			last_name: true,
			middle_name: true,
			email: true,
			department_id: true,
		},
	})

	// Create employee lookup map
	const employeeMap = new Map(
		employees.map((emp) => [
			emp.id,
			{
				...emp,
				fullName: `${emp.first_name} ${emp.middle_name ? emp.middle_name + ' ' : ''}${emp.last_name}`,
			},
		]),
	)

	// Transform data for payslip component
	const payslipData: PayslipData[] = payslips.map((payslip) => {
		const employee = employeeMap.get(payslip.employee_id)
		if (!employee) {
			throw new Error(`Employee not found for ID: ${payslip.employee_id}`)
		}

		// Parse allowances and deductions from JSON if stored
		let allowances: Array<{ name: string; amount: number }> = []
		let otherDeductions: Array<{ name: string; amount: number }> = []
		let loans: Array<{ type: string; amount: number }> = []

		// Parse allowances detail if it's JSON
		if (payslip.allowances_detail) {
			try {
				const detail =
					typeof payslip.allowances_detail === 'string'
						? JSON.parse(payslip.allowances_detail)
						: payslip.allowances_detail
				if (Array.isArray(detail)) {
					allowances = detail
				}
			} catch (e) {
				console.error('Failed to parse allowances detail:', e)
			}
		}

		return {
			employeeId: payslip.employee_id,
			employeeNo: employee.employee_no,
			employeeName: employee.fullName,
			email: employee.email || undefined,
			position: 'Security Guard', // TODO: Get from assignment
			department: employee.department_id || 'Operations',
			payPeriod: {
				id: payPeriod.id,
				startDate: payPeriod.start_date.toISOString(),
				endDate: payPeriod.end_date.toISOString(),
				month: payPeriod.month.toString(),
				year: payPeriod.year.toString(),
			},
			earnings: {
				basicPay: Number(payslip.basic_pay),
				overtimePay: Number(payslip.overtime_pay),
				nightDiffPay: Number(payslip.night_diff_pay),
				holidayPay: Number(payslip.holiday_pay),
				allowances,
				totalEarnings: Number(payslip.gross_pay),
			},
			deductions: {
				absences: Number(payslip.absences_amount),
				tardiness: Number(payslip.tardiness_amount),
				loans,
				sssEE: Number(payslip.sss_ee),
				philhealthEE: Number(payslip.philhealth_ee),
				hdmfEE: Number(payslip.hdmf_ee),
				withholdingTax: Number(payslip.withholding_tax),
				otherDeductions,
				totalDeductions: Number(payslip.total_deductions),
			},
			netPay: Number(payslip.net_pay),
			verificationUrl: `${url.origin}/payslips/verify/${payslip.id}`,
			status: payslip.status as 'DRAFT' | 'APPROVED' | 'PAID',
		}
	})

	// Sort by employee name
	payslipData.sort((a, b) => a.employeeName.localeCompare(b.employeeName))

	// Generate QR codes for all payslips
	const payslipsWithQR = await generateQRCodes(payslipData)

	// Read CSS file
	const cssPath = path.join(process.cwd(), 'app', 'styles', 'payslip-print.css')
	const css = fs.readFileSync(cssPath, 'utf-8')

	// Generate HTML
	const htmlContent = renderToString(
		<PayslipSheet
			payslips={payslipsWithQR}
			showQRCode={true}
			watermark={watermark || undefined}
		/>,
	)

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Payslips - Print Preview</title>
	<style>${css}</style>
</head>
<body>
	<div class="payslip-preview-container">
		<div class="payslip-preview">
			${htmlContent}
		</div>
	</div>
</body>
</html>`

	// Return HTML response directly
	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store, no-cache, must-revalidate',
		},
	})
}
