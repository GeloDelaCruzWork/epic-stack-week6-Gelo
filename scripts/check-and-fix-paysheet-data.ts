import { prisma } from '#app/utils/db.server.ts'

async function checkAndFixPaysheetData() {
	console.log('🔍 Checking Paysheet and Guard/Employee data alignment...\n')

	try {
		// Step 1: Check existing Paysheet records
		const paysheets = await prisma.paysheet.findMany()
		console.log(`Found ${paysheets.length} Paysheet records\n`)

		for (const paysheet of paysheets) {
			console.log(`Paysheet ID: ${paysheet.id}`)
			console.log(`  Guard ID: ${paysheet.guard_id}`)
			console.log(`  Pay Period: ${paysheet.pay_period_id}`)
			console.log(`  Status: ${paysheet.status}`)
			console.log(`  Gross Pay: ${paysheet.gross_pay}`)
			console.log(`  Net Pay: ${paysheet.net_pay}`)

			// Check if Guard exists
			const guard = await prisma.guard.findUnique({
				where: { id: paysheet.guard_id },
			})

			if (guard) {
				console.log(
					`  ✅ Guard found: ${guard.employee_no} - ${guard.first_name} ${guard.last_name}`,
				)

				// Check if Employee exists
				const employee = await prisma.employee.findUnique({
					where: { id: guard.id },
				})

				if (!employee) {
					console.log(`  ⚠️ No Employee record for this guard. Creating...`)

					// Create Employee record from Guard
					const newEmployee = await prisma.employee.create({
						data: {
							id: guard.id, // Use same ID
							company_id: guard.company_id,
							employee_no: guard.employee_no,
							employee_type: 'REGULAR',
							classification: 'GUARD',
							last_name: guard.last_name,
							first_name: guard.first_name,
							middle_name: guard.middle_name,
							hire_date: guard.hire_date || new Date('2023-01-01'),
							employment_status:
								guard.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
							compensation_type: 'TIME_BASED',
							requires_timesheet: true,
							created_at: guard.created_at,
							updated_at: guard.updated_at,
						},
					})
					console.log(`  ✅ Created Employee: ${newEmployee.employee_no}`)
				} else {
					console.log(`  ✅ Employee exists: ${employee.employee_no}`)
				}
			} else {
				console.log(`  ❌ Guard not found for ID: ${paysheet.guard_id}`)

				// Try to find if this ID exists as an Employee directly
				const employee = await prisma.employee.findUnique({
					where: { id: paysheet.guard_id },
				})

				if (employee) {
					console.log(
						`  ✅ Found as Employee: ${employee.employee_no} - ${employee.first_name} ${employee.last_name}`,
					)
				} else {
					console.log(
						`  ❌ No Guard or Employee record found. This might be orphaned data.`,
					)
				}
			}
			console.log('')
		}

		// Step 2: Now try to migrate Paysheets to EmployeePaysheets
		console.log('\n📋 Now migrating Paysheets to EmployeePaysheets...\n')

		let created = 0
		let updated = 0
		let errors = 0

		for (const paysheet of paysheets) {
			try {
				// Try to find Employee (could be created above or already existing)
				const employee = await prisma.employee.findUnique({
					where: { id: paysheet.guard_id },
				})

				if (!employee) {
					console.log(
						`⚠️ Still no Employee for guard_id: ${paysheet.guard_id}, skipping...`,
					)
					continue
				}

				console.log(
					`Processing Paysheet for ${employee.employee_no}: ${employee.first_name} ${employee.last_name}`,
				)

				// Create or update EmployeePaysheet
				const employeePaysheet = await prisma.employeePaysheet.upsert({
					where: {
						company_id_pay_period_id_employee_id: {
							company_id: paysheet.company_id,
							pay_period_id: paysheet.pay_period_id,
							employee_id: paysheet.guard_id,
						},
					},
					update: {
						// Update existing
						timesheet_ids: paysheet.timesheet_ids,
						amount_8h: paysheet.amount_8h,
						amount_ot: paysheet.amount_ot,
						amount_night: paysheet.amount_night,
						basic_pay: paysheet.amount_8h,
						overtime_pay: paysheet.amount_ot,
						night_diff_pay: paysheet.amount_night,
						allowances_amount: paysheet.allowances_amount,
						loans_amount: paysheet.loans_amount,
						deductions_amount: paysheet.deductions_amount,
						sss_ee: paysheet.sss_ee,
						sss_er: paysheet.sss_er,
						philhealth_ee: paysheet.philhealth_ee,
						philhealth_er: paysheet.philhealth_er,
						hdmf_ee: paysheet.hdmf_ee,
						hdmf_er: paysheet.hdmf_er,
						gross_pay: paysheet.gross_pay,
						net_pay: paysheet.net_pay,
						status: paysheet.status,
					},
					create: {
						// Create new
						company_id: paysheet.company_id,
						pay_period_id: paysheet.pay_period_id,
						employee_id: paysheet.guard_id,
						employee_type: employee.employee_type || 'REGULAR',
						timesheet_ids: paysheet.timesheet_ids,
						amount_8h: paysheet.amount_8h,
						amount_ot: paysheet.amount_ot,
						amount_night: paysheet.amount_night,
						basic_pay: paysheet.amount_8h,
						overtime_pay: paysheet.amount_ot,
						night_diff_pay: paysheet.amount_night,
						holiday_pay: 0,
						allowances_amount: paysheet.allowances_amount,
						loans_amount: paysheet.loans_amount,
						deductions_amount: paysheet.deductions_amount,
						sss_ee: paysheet.sss_ee,
						sss_er: paysheet.sss_er,
						philhealth_ee: paysheet.philhealth_ee,
						philhealth_er: paysheet.philhealth_er,
						hdmf_ee: paysheet.hdmf_ee,
						hdmf_er: paysheet.hdmf_er,
						tax_withheld: 0,
						gross_pay: paysheet.gross_pay,
						net_pay: paysheet.net_pay,
						status: paysheet.status,
						created_at: paysheet.created_at,
					},
				})

				if (employeePaysheet) {
					console.log(`  ✅ Successfully created/updated EmployeePaysheet`)
					console.log(`     Amount 8h: ${employeePaysheet.amount_8h}`)
					console.log(`     Amount OT: ${employeePaysheet.amount_ot}`)
					console.log(`     Gross Pay: ${employeePaysheet.gross_pay}`)
					console.log(`     Net Pay: ${employeePaysheet.net_pay}`)
					created++
				}
			} catch (error) {
				console.error(`  ❌ Error processing paysheet: ${error}`)
				errors++
			}
		}

		// Final summary
		console.log('\n📊 Final Summary:')
		console.log('=====================================')
		console.log(`Total Paysheets: ${paysheets.length}`)
		console.log(`EmployeePaysheets Created/Updated: ${created}`)
		console.log(`Errors: ${errors}`)

		const totalEmployeePaysheets = await prisma.employeePaysheet.count()
		console.log(
			`\nTotal EmployeePaysheet records in database: ${totalEmployeePaysheets}`,
		)
	} catch (error) {
		console.error('❌ Error:', error)
		throw error
	}
}

// Run the check and fix
checkAndFixPaysheetData()
	.then(() => {
		console.log('\n✅ Check and fix completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Failed:', error)
		process.exit(1)
	})
