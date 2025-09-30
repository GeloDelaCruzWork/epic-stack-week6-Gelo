import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router'
import {
	Form,
	useLoaderData,
	Link,
	useActionData,
	useNavigate,
} from 'react-router'
import { useState, useEffect } from 'react'
import { prisma } from '#app/utils/db.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select.tsx'
import { Checkbox } from '#app/components/ui/checkbox.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { toast as showToast } from 'sonner'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	// Check if user has admin role
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { roles: true },
	})

	const hasAdminRole = user?.roles.some((role) => role.code === 'admin')
	if (!hasAdminRole) {
		throw new Response('Unauthorized', { status: 403 })
	}

	// Fetch pay periods
	const payPeriods = await prisma.payPeriod.findMany({
		orderBy: [{ year: 'desc' }, { month: 'desc' }, { from: 'desc' }],
		take: 12,
		select: {
			id: true,
			code: true,
			year: true,
			month: true,
			from: true,
			to: true,
			status: true,
		},
	})

	// Fetch employees with payslips
	const employees = await prisma.employee.findMany({
		where: {
			employment_status: 'ACTIVE',
		},
		orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
		select: {
			id: true,
			employee_no: true,
			first_name: true,
			last_name: true,
			middle_name: true,
			email: true,
			employee_type: true,
			classification: true,
		},
	})

	return {
		payPeriods,
		employees,
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

	// Check if user has admin role
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { roles: true },
	})

	const hasAdminRole = user?.roles.some((role) => role.code === 'admin')
	if (!hasAdminRole) {
		throw new Response('Unauthorized', { status: 403 })
	}

	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'generate-payslips') {
		const payPeriodId = formData.get('payPeriodId') as string
		const employeeIds = formData.getAll('employeeIds') as string[]
		const watermark = formData.get('watermark') as string

		if (!payPeriodId) {
			return redirectWithToast('/payslips', {
				type: 'error',
				title: 'Error',
				description: 'Please select a pay period',
			})
		}

		if (employeeIds.length === 0) {
			return redirectWithToast('/payslips', {
				type: 'error',
				title: 'Error',
				description: 'Please select at least one employee',
			})
		}

		// Check if payroll run exists
		let payrollRun = await prisma.payrollRun.findFirst({
			where: {
				pay_period_id: payPeriodId,
				payroll_type: 'REGULAR',
			},
		})

		// Create payroll run if it doesn't exist
		if (!payrollRun) {
			payrollRun = await prisma.payrollRun.create({
				data: {
					company_id: 'default', // TODO: Get from context
					pay_period_id: payPeriodId,
					payroll_type: 'REGULAR',
					status: 'DRAFT',
					created_by: 'system', // TODO: Get actual user
				},
			})
		}

		// Generate payslips for selected employees
		// This is a simplified version - in production, you'd calculate actual values
		const payslipPromises = employeeIds.map(async (employeeId) => {
			// Check if payslip already exists
			const existingPayslip = await prisma.employeePayslip.findFirst({
				where: {
					employee_id: employeeId,
					payroll_run_id: payrollRun.id,
				},
			})

			if (existingPayslip) {
				return existingPayslip
			}

			// Create new payslip with sample data
			// In production, these values would be calculated from timesheets, attendance, etc.
			return prisma.employeePayslip.create({
				data: {
					company_id: 'default',
					payroll_run_id: payrollRun.id,
					employee_id: employeeId,
					basic_pay: 15000.0,
					overtime_pay: 2000.0,
					night_diff_pay: 500.0,
					holiday_pay: 0.0,
					allowances_total: 1000.0,
					allowances_detail: JSON.stringify([
						{ name: 'Transportation', amount: 500 },
						{ name: 'Meal', amount: 500 },
					]),
					absences_amount: 0.0,
					tardiness_amount: 0.0,
					loans_total: 500.0,
					other_deductions: 0.0,
					sss_ee: 495.0,
					sss_er: 1210.0,
					philhealth_ee: 400.0,
					philhealth_er: 400.0,
					hdmf_ee: 100.0,
					hdmf_er: 100.0,
					taxable_income: 17005.0,
					withholding_tax: 1250.0,
					gross_pay: 18500.0,
					total_deductions: 3245.0,
					net_pay: 15255.0,
					status: 'DRAFT',
				},
			})
		})

		await Promise.all(payslipPromises)

		// Return success and let client handle the preview
		return {
			success: true,
			message: `Generated ${employeeIds.length} payslip(s)`,
			payPeriodId,
			employeeIds,
			watermark,
		}
	}

	return null
}

export default function PayslipsPage() {
	const { payPeriods, employees } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const navigate = useNavigate()
	const [selectedPayPeriod, setSelectedPayPeriod] = useState<string>('')
	const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
	const [selectAll, setSelectAll] = useState(false)
	const [watermark, setWatermark] = useState('DRAFT')

	// Handle successful payslip generation
	useEffect(() => {
		if (actionData?.success) {
			// Show success toast
			showToast.success('Payslips Generated', {
				description: actionData.message,
			})

			// Build the preview URL
			const params = new URLSearchParams()
			params.append('period', actionData.payPeriodId)
			actionData.employeeIds.forEach((id: string) => params.append('id', id))
			if (actionData.watermark) params.append('watermark', actionData.watermark)

			// Open preview in new tab
			const previewUrl = `/payslips/print?${params.toString()}`
			window.open(previewUrl, '_blank')
		}
	}, [actionData])

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedEmployees([])
		} else {
			setSelectedEmployees(employees.map((e) => e.id))
		}
		setSelectAll(!selectAll)
	}

	const handleEmployeeToggle = (employeeId: string) => {
		if (selectedEmployees.includes(employeeId)) {
			setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId))
			setSelectAll(false)
		} else {
			setSelectedEmployees([...selectedEmployees, employeeId])
			if (selectedEmployees.length + 1 === employees.length) {
				setSelectAll(true)
			}
		}
	}

	const generatePrintUrl = () => {
		if (!selectedPayPeriod || selectedEmployees.length === 0) return '#'

		const params = new URLSearchParams()
		params.append('period', selectedPayPeriod)
		selectedEmployees.forEach((id) => params.append('id', id))
		if (watermark) params.append('watermark', watermark)

		return `/payslips/print?${params.toString()}`
	}

	const generatePDFUrl = () => {
		if (!selectedPayPeriod || selectedEmployees.length === 0) return '#'

		const params = new URLSearchParams()
		params.append('period', selectedPayPeriod)
		selectedEmployees.forEach((id) => params.append('id', id))
		if (watermark) params.append('watermark', watermark)

		return `/payslips/pdf?${params.toString()}`
	}

	return (
		<div className="container mx-auto max-w-7xl p-6">
			<div className="mb-8">
				<h1 className="mb-2 text-3xl font-bold">Payslip Management</h1>
				<p className="text-muted-foreground">
					Generate and print employee payslips for any pay period
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Configuration Panel */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Configuration</CardTitle>
							<CardDescription>Select pay period and employees</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="payPeriod">Pay Period</Label>
								<Select
									value={selectedPayPeriod}
									onValueChange={setSelectedPayPeriod}
								>
									<SelectTrigger id="payPeriod">
										<SelectValue placeholder="Select a pay period" />
									</SelectTrigger>
									<SelectContent>
										{payPeriods.map((period) => (
											<SelectItem key={period.id} value={period.id}>
												{period.code} ({period.year}-
												{String(period.month).padStart(2, '0')}: {period.from}-
												{period.to})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="watermark">Watermark (optional)</Label>
								<Input
									id="watermark"
									value={watermark}
									onChange={(e) => setWatermark(e.target.value)}
									placeholder="e.g., DRAFT, PAID"
								/>
							</div>

							<div className="space-y-2 pt-4">
								<Form method="post" className="space-y-3">
									<input
										type="hidden"
										name="intent"
										value="generate-payslips"
									/>
									<input
										type="hidden"
										name="payPeriodId"
										value={selectedPayPeriod}
									/>
									<input type="hidden" name="watermark" value={watermark} />
									{selectedEmployees.map((id) => (
										<input
											key={id}
											type="hidden"
											name="employeeIds"
											value={id}
										/>
									))}

									<Button
										type="submit"
										className="w-full"
										disabled={
											!selectedPayPeriod || selectedEmployees.length === 0
										}
									>
										Generate & Preview Payslips
									</Button>
								</Form>

								<Link
									to={generatePrintUrl()}
									target="_blank"
									className={`block ${!selectedPayPeriod || selectedEmployees.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
								>
									<Button variant="outline" className="w-full">
										Preview Payslips
									</Button>
								</Link>

								<Link
									to={generatePDFUrl()}
									target="_blank"
									className={`block ${!selectedPayPeriod || selectedEmployees.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
								>
									<Button variant="outline" className="w-full">
										Download PDF
									</Button>
								</Link>
							</div>

							<div className="text-muted-foreground border-t pt-4 text-sm">
								<p>Selected: {selectedEmployees.length} employee(s)</p>
								<p>Layout: 2 payslips per A4 page</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Employee Selection */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Select Employees</CardTitle>
							<CardDescription>
								Choose which employees to generate payslips for
							</CardDescription>
							<div className="pt-2">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="selectAll"
										checked={selectAll}
										onCheckedChange={handleSelectAll}
									/>
									<Label htmlFor="selectAll" className="font-medium">
										Select All ({employees.length} employees)
									</Label>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="max-h-[500px] overflow-y-auto rounded-lg border">
								<table className="w-full">
									<thead className="bg-muted sticky top-0">
										<tr>
											<th className="w-12 p-3 text-left"></th>
											<th className="p-3 text-left">Employee No</th>
											<th className="p-3 text-left">Name</th>
											<th className="p-3 text-left">Type</th>
											<th className="p-3 text-left">Email</th>
										</tr>
									</thead>
									<tbody>
										{employees.map((employee) => {
											const fullName = `${employee.last_name}, ${employee.first_name} ${employee.middle_name || ''}`
											return (
												<tr
													key={employee.id}
													className="hover:bg-muted/50 border-t"
												>
													<td className="p-3">
														<Checkbox
															checked={selectedEmployees.includes(employee.id)}
															onCheckedChange={() =>
																handleEmployeeToggle(employee.id)
															}
														/>
													</td>
													<td className="p-3 font-mono text-sm">
														{employee.employee_no}
													</td>
													<td className="p-3">{fullName}</td>
													<td className="p-3">
														<span className="bg-muted rounded px-2 py-1 text-xs">
															{employee.classification ||
																employee.employee_type}
														</span>
													</td>
													<td className="p-3 text-sm">
														{employee.email || 'N/A'}
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
