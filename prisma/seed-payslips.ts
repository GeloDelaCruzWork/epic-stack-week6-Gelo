import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPayslipData() {
	console.log('🌱 Seeding payslip data...')

	// Create a test company if it doesn't exist
	const company = await prisma.company.upsert({
		where: { code: 'TESTCO' },
		update: {},
		create: {
			id: 'default',
			legal_name: 'Test Company Inc.',
			code: 'TESTCO',
			tin: '123-456-789',
			address: '123 Business Street, City',
			status: 'ACTIVE',
		},
	})

	// Create all pay periods for 2025
	console.log('📅 Creating pay periods for 2025...')

	// Define the last day of each month in 2025
	const lastDayOfMonth = {
		1: 31,
		2: 28,
		3: 31,
		4: 30,
		5: 31,
		6: 30,
		7: 31,
		8: 31,
		9: 30,
		10: 31,
		11: 30,
		12: 31,
	}

	const payPeriods = []

	for (let month = 1; month <= 12; month++) {
		const monthStr = String(month).padStart(2, '0')

		// First half of month (1-15) - Period A
		const periodA = await prisma.payPeriod.upsert({
			where: {
				company_id_code: {
					company_id: company.id,
					code: `2025-${monthStr}-A`,
				},
			},
			update: {},
			create: {
				company_id: company.id,
				code: `2025-${monthStr}-A`,
				year: 2025,
				month: month,
				from: 1,
				to: 15,
				start_date: new Date(2025, month - 1, 1),
				end_date: new Date(2025, month - 1, 15),
				status: 'OPEN',
			},
		})
		payPeriods.push(periodA)
		console.log(
			`   ✓ Created pay period: 2025-${monthStr}-A (${month}/1 - ${month}/15)`,
		)

		// Second half of month (16-end) - Period B
		const lastDay = lastDayOfMonth[month]
		const periodB = await prisma.payPeriod.upsert({
			where: {
				company_id_code: {
					company_id: company.id,
					code: `2025-${monthStr}-B`,
				},
			},
			update: {},
			create: {
				company_id: company.id,
				code: `2025-${monthStr}-B`,
				year: 2025,
				month: month,
				from: 16,
				to: lastDay,
				start_date: new Date(2025, month - 1, 16),
				end_date: new Date(2025, month - 1, lastDay),
				status: 'OPEN',
			},
		})
		payPeriods.push(periodB)
		console.log(
			`   ✓ Created pay period: 2025-${monthStr}-B (${month}/16 - ${month}/${lastDay})`,
		)
	}

	console.log(`✅ Created ${payPeriods.length} pay periods for 2025`)

	// Use the first pay period for sample payslips (January 1-15, 2025)
	const payPeriod = payPeriods[0]

	// Create sample employees with email addresses
	const employeesData = [
		{
			employee_no: 'EMP001',
			first_name: 'Juan',
			last_name: 'Dela Cruz',
			middle_name: 'Santos',
			email: 'juan.delacruz@example.com',
			classification: 'GUARD',
		},
		{
			employee_no: 'EMP002',
			first_name: 'Maria',
			last_name: 'Santos',
			middle_name: 'Reyes',
			email: 'maria.santos@example.com',
			classification: 'GUARD',
		},
		{
			employee_no: 'EMP003',
			first_name: 'Pedro',
			last_name: 'Garcia',
			middle_name: null,
			email: 'pedro.garcia@example.com',
			classification: 'GUARD',
		},
		{
			employee_no: 'EMP004',
			first_name: 'Ana',
			last_name: 'Reyes',
			middle_name: 'Cruz',
			email: 'ana.reyes@example.com',
			classification: 'ADMIN',
		},
		{
			employee_no: 'EMP005',
			first_name: 'Jose',
			last_name: 'Mendoza',
			middle_name: 'Luis',
			email: 'jose.mendoza@example.com',
			classification: 'GUARD',
		},
		{
			employee_no: 'EMP006',
			first_name: 'Carmen',
			last_name: 'Lopez',
			middle_name: null,
			email: 'carmen.lopez@example.com',
			classification: 'ADMIN',
		},
		{
			employee_no: 'EMP007',
			first_name: 'Roberto',
			last_name: 'Fernandez',
			middle_name: 'Carlos',
			email: 'roberto.fernandez@example.com',
			classification: 'GUARD',
		},
		{
			employee_no: 'EMP008',
			first_name: 'Elena',
			last_name: 'Torres',
			middle_name: 'Marie',
			email: 'elena.torres@example.com',
			classification: 'GUARD',
		},
		{
			employee_no: 'EMP009',
			first_name: 'Miguel',
			last_name: 'Ramos',
			middle_name: null,
			email: 'miguel.ramos@example.com',
			classification: 'GUARD',
		},
		{
			employee_no: 'EMP010',
			first_name: 'Isabel',
			last_name: 'Domingo',
			middle_name: 'Grace',
			email: 'isabel.domingo@example.com',
			classification: 'ADMIN',
		},
	]

	const employees = await Promise.all(
		employeesData.map(async (data) => {
			return prisma.employee.upsert({
				where: {
					company_id_employee_no: {
						company_id: company.id,
						employee_no: data.employee_no,
					},
				},
				update: {
					email: data.email,
				},
				create: {
					company_id: company.id,
					employee_no: data.employee_no,
					employee_type: 'REGULAR',
					classification: data.classification,
					first_name: data.first_name,
					last_name: data.last_name,
					middle_name: data.middle_name,
					email: data.email,
					hire_date: new Date('2023-01-01'),
					employment_status: 'ACTIVE',
					compensation_type: 'TIME_BASED',
					pay_frequency: 'SEMI_MONTHLY',
					requires_timesheet: true,
					base_salary: 15000.0,
					hourly_rate: 93.75, // Approx for 160 hours/month
					daily_rate: 750.0,
				},
			})
		}),
	)

	// Create payroll run
	const payrollRun = await prisma.payrollRun.upsert({
		where: {
			company_id_pay_period_id_payroll_type: {
				company_id: company.id,
				pay_period_id: payPeriod.id,
				payroll_type: 'REGULAR',
			},
		},
		update: {},
		create: {
			company_id: company.id,
			pay_period_id: payPeriod.id,
			payroll_type: 'REGULAR',
			status: 'DRAFT',
			created_by: 'system',
		},
	})

	// Create sample payslips with varying amounts
	const payslipPromises = employees.map(async (employee, index) => {
		// Vary amounts slightly for each employee
		const baseSalary = 15000 + index * 500
		const overtime = index % 3 === 0 ? 2000 + index * 100 : 0
		const nightDiff = index % 2 === 0 ? 500 + index * 50 : 0
		const holiday = index === 2 || index === 5 ? 1500 : 0

		const grossPay = baseSalary + overtime + nightDiff + holiday + 1000 // allowances

		// Calculate deductions
		const sss = 495.0
		const philhealth = 400.0
		const hdmf = 100.0
		const tax =
			grossPay > 20000 ? (grossPay - 20000) * 0.2 + 1250 : grossPay * 0.05
		const loan = index % 4 === 0 ? 1000 : 0

		const totalDeductions = sss + philhealth + hdmf + tax + loan
		const netPay = grossPay - totalDeductions

		return prisma.employeePayslip.upsert({
			where: {
				company_id_payroll_run_id_employee_id: {
					company_id: company.id,
					payroll_run_id: payrollRun.id,
					employee_id: employee.id,
				},
			},
			update: {},
			create: {
				company_id: company.id,
				payroll_run_id: payrollRun.id,
				employee_id: employee.id,
				basic_pay: baseSalary,
				overtime_pay: overtime,
				night_diff_pay: nightDiff,
				holiday_pay: holiday,
				allowances_total: 1000.0,
				allowances_detail: JSON.stringify([
					{ name: 'Transportation', amount: 500 },
					{ name: 'Meal', amount: 500 },
				]),
				absences_amount: 0.0,
				tardiness_amount: 0.0,
				loans_total: loan,
				other_deductions: 0.0,
				sss_ee: sss,
				sss_er: 1210.0,
				philhealth_ee: philhealth,
				philhealth_er: philhealth,
				hdmf_ee: hdmf,
				hdmf_er: hdmf,
				taxable_income: grossPay - sss - philhealth - hdmf,
				withholding_tax: tax,
				gross_pay: grossPay,
				total_deductions: totalDeductions,
				net_pay: netPay,
				status: 'DRAFT',
			},
		})
	})

	await Promise.all(payslipPromises)

	console.log('✅ Payslip data seeded successfully!')
	console.log(`   - Company: ${company.legal_name}`)
	console.log(`   - Pay Period: ${payPeriod.code}`)
	console.log(`   - Employees: ${employees.length}`)
	console.log(`   - Payslips created for all employees`)
}

// Run the seed function
seedPayslipData()
	.catch((error) => {
		console.error('Error seeding payslip data:', error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
