import { type LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'
import { prisma } from '#app/utils/db.server.ts'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export async function loader({ params }: LoaderFunctionArgs) {
	const payslipId = params.id

	if (!payslipId) {
		throw new Response('Payslip ID is required', { status: 400 })
	}

	// Fetch payslip with all related data
	const payslip = await prisma.employeePayslip.findUnique({
		where: { id: payslipId },
	})

	if (!payslip) {
		throw new Response('Payslip not found', { status: 404 })
	}

	// Fetch employee details
	const employee = await prisma.employee.findUnique({
		where: { id: payslip.employee_id },
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

	// Fetch payroll run and pay period
	const payrollRun = await prisma.payrollRun.findUnique({
		where: { id: payslip.payroll_run_id },
	})

	let payPeriod = null
	if (payrollRun) {
		payPeriod = await prisma.payPeriod.findUnique({
			where: { id: payrollRun.pay_period_id },
		})
	}

	// Serialize Decimal fields to strings to avoid hydration issues
	const serializedPayslip = {
		...payslip,
		basic_pay: payslip.basic_pay.toString(),
		overtime_pay: payslip.overtime_pay.toString(),
		night_diff_pay: payslip.night_diff_pay.toString(),
		holiday_pay: payslip.holiday_pay.toString(),
		allowances_total: payslip.allowances_total.toString(),
		absences_amount: payslip.absences_amount.toString(),
		tardiness_amount: payslip.tardiness_amount.toString(),
		loans_total: payslip.loans_total.toString(),
		other_deductions: payslip.other_deductions.toString(),
		sss_ee: payslip.sss_ee.toString(),
		sss_er: payslip.sss_er.toString(),
		philhealth_ee: payslip.philhealth_ee.toString(),
		philhealth_er: payslip.philhealth_er.toString(),
		hdmf_ee: payslip.hdmf_ee.toString(),
		hdmf_er: payslip.hdmf_er.toString(),
		taxable_income: payslip.taxable_income.toString(),
		withholding_tax: payslip.withholding_tax.toString(),
		gross_pay: payslip.gross_pay.toString(),
		total_deductions: payslip.total_deductions.toString(),
		net_pay: payslip.net_pay.toString(),
	}

	return {
		payslip: serializedPayslip,
		employee,
		payrollRun,
		payPeriod,
	}
}

function formatCurrency(amount: number | string | any): string {
	// Convert to number, handling various input types
	let numAmount: number

	// Handle null or undefined
	if (amount === null || amount === undefined) {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(0)
	}

	// Convert to string first (handles Decimal objects too)
	const strAmount = String(amount)

	// Parse the string to number
	numAmount = parseFloat(strAmount)

	// Check for NaN and provide fallback
	if (isNaN(numAmount)) {
		console.warn('Invalid amount for currency formatting:', amount)
		numAmount = 0
	}

	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numAmount)
}

function formatDate(dateString: string | Date): string {
	return new Date(dateString).toLocaleDateString('en-PH', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

function getStatusIcon(status: string) {
	switch (status) {
		case 'PAID':
			return <CheckCircle className="h-5 w-5 text-green-500" />
		case 'APPROVED':
			return <AlertCircle className="h-5 w-5 text-blue-500" />
		case 'DRAFT':
			return <AlertCircle className="h-5 w-5 text-yellow-500" />
		default:
			return <XCircle className="h-5 w-5 text-red-500" />
	}
}

function getStatusColor(status: string) {
	switch (status) {
		case 'PAID':
			return 'success'
		case 'APPROVED':
			return 'info'
		case 'DRAFT':
			return 'warning'
		default:
			return 'destructive'
	}
}

export default function PayslipVerificationPage() {
	const { payslip, employee, payrollRun, payPeriod } =
		useLoaderData<typeof loader>()

	if (!employee || !payPeriod) {
		return (
			<div className="container mx-auto max-w-2xl p-6">
				<Card className="border-red-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<XCircle className="h-6 w-6 text-red-500" />
							Invalid Payslip
						</CardTitle>
						<CardDescription>
							This payslip has incomplete data and cannot be verified.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	const fullName = `${employee.first_name} ${employee.middle_name ? employee.middle_name + ' ' : ''}${employee.last_name}`

	// Parse allowances if stored as JSON
	let allowances: Array<{ name: string; amount: number }> = []
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

	return (
		<div className="container mx-auto max-w-4xl p-6">
			{/* Verification Header */}
			<Card className="mb-6 border-green-200 bg-green-50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-green-800">
						<CheckCircle className="h-6 w-6 text-green-600" />
						Payslip Verification
					</CardTitle>
					<CardDescription className="text-green-700">
						This payslip is authentic and has been verified from our records.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-gray-600">
								Verification ID:
							</span>
							<p className="mt-1 font-mono text-xs">{payslip.id}</p>
						</div>
						<div>
							<span className="font-medium text-gray-600">Generated on:</span>
							<p className="mt-1">{formatDate(payslip.created_at)}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Employee Information */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Employee Information</CardTitle>
					<div className="mt-2 flex items-center gap-2">
						{getStatusIcon(payslip.status)}
						<Badge variant={getStatusColor(payslip.status) as any}>
							{payslip.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<p className="text-sm text-gray-600">Employee Number</p>
							<p className="font-medium">{employee.employee_no}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Full Name</p>
							<p className="font-medium">{fullName}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Email</p>
							<p className="font-medium">{employee.email || 'N/A'}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Department</p>
							<p className="font-medium">{employee.department_id || 'N/A'}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Pay Period Information */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Pay Period Details</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<p className="text-sm text-gray-600">Period Code</p>
							<p className="font-medium">{payPeriod.code}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Period</p>
							<p className="font-medium">
								{formatDate(payPeriod.start_date)} -{' '}
								{formatDate(payPeriod.end_date)}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Month/Year</p>
							<p className="font-medium">
								{payPeriod.month}/{payPeriod.year}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Payroll Type</p>
							<p className="font-medium">
								{payrollRun?.payroll_type || 'REGULAR'}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Earnings Summary */}
			<div className="mb-6 grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Earnings</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Basic Pay</span>
								<span className="font-medium">
									{formatCurrency(payslip.basic_pay)}
								</span>
							</div>
							{Number(payslip.overtime_pay) > 0 && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Overtime Pay</span>
									<span className="font-medium">
										{formatCurrency(payslip.overtime_pay)}
									</span>
								</div>
							)}
							{Number(payslip.night_diff_pay) > 0 && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">
										Night Differential
									</span>
									<span className="font-medium">
										{formatCurrency(payslip.night_diff_pay)}
									</span>
								</div>
							)}
							{Number(payslip.holiday_pay) > 0 && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Holiday Pay</span>
									<span className="font-medium">
										{formatCurrency(payslip.holiday_pay)}
									</span>
								</div>
							)}
							{allowances.map((allowance, idx) => (
								<div key={idx} className="flex justify-between">
									<span className="text-sm text-gray-600">
										{allowance.name}
									</span>
									<span className="font-medium">
										{formatCurrency(allowance.amount)}
									</span>
								</div>
							))}
							<div className="flex justify-between border-t pt-2 font-semibold">
								<span>Total Earnings</span>
								<span>{formatCurrency(payslip.gross_pay)}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Deductions Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Deductions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{Number(payslip.absences_amount) > 0 && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Absences</span>
									<span className="font-medium">
										{formatCurrency(payslip.absences_amount)}
									</span>
								</div>
							)}
							{Number(payslip.tardiness_amount) > 0 && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Tardiness</span>
									<span className="font-medium">
										{formatCurrency(payslip.tardiness_amount)}
									</span>
								</div>
							)}
							{Number(payslip.loans_total) > 0 && (
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Loans</span>
									<span className="font-medium">
										{formatCurrency(payslip.loans_total)}
									</span>
								</div>
							)}
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">SSS Contribution</span>
								<span className="font-medium">
									{formatCurrency(payslip.sss_ee)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">PhilHealth</span>
								<span className="font-medium">
									{formatCurrency(payslip.philhealth_ee)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Pag-IBIG</span>
								<span className="font-medium">
									{formatCurrency(payslip.hdmf_ee)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600">Withholding Tax</span>
								<span className="font-medium">
									{formatCurrency(payslip.withholding_tax)}
								</span>
							</div>
							<div className="flex justify-between border-t pt-2 font-semibold">
								<span>Total Deductions</span>
								<span>{formatCurrency(payslip.total_deductions)}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Net Pay */}
			<Card className="border-blue-200 bg-blue-50">
				<CardHeader>
					<CardTitle className="text-xl">Net Pay</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-3xl font-bold text-blue-700">
						{formatCurrency(payslip.net_pay)}
					</p>
				</CardContent>
			</Card>

			{/* Footer */}
			<div className="mt-8 text-center text-sm text-gray-500">
				<p>This verification page confirms the authenticity of the payslip.</p>
				<p>For any discrepancies, please contact the HR department.</p>
				<p className="mt-2 font-mono text-xs">
					Verification performed at: {new Date().toLocaleString()}
				</p>
			</div>
		</div>
	)
}
