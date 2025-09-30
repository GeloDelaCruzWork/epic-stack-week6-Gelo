import { prisma } from '#app/utils/db.server.ts'

async function copyPaysheetToEmployeePaysheet() {
	console.log('📋 Starting migration from Paysheet to EmployeePaysheet...\n')

	try {
		// Step 1: Fetch all Paysheet records
		console.log('🔍 Fetching existing Paysheet records...')
		const paysheets = await prisma.paysheet.findMany({
			orderBy: [{ pay_period_id: 'asc' }, { guard_id: 'asc' }],
		})

		console.log(`Found ${paysheets.length} Paysheet records to migrate\n`)

		if (paysheets.length === 0) {
			console.log('⚠️ No Paysheet records found to migrate')
			return
		}

		let created = 0
		let updated = 0
		let skipped = 0
		let errors = 0

		// Step 2: Process each Paysheet record
		for (const paysheet of paysheets) {
			try {
				// Check if the guard has been migrated to Employee
				const employee = await prisma.employee.findUnique({
					where: { id: paysheet.guard_id },
				})

				if (!employee) {
					console.log(
						`⚠️ No Employee record found for guard_id: ${paysheet.guard_id}, skipping...`,
					)
					skipped++
					continue
				}

				console.log(
					`Processing Paysheet for ${employee.employee_no}: ${employee.first_name} ${employee.last_name}`,
				)

				// Check if EmployeePaysheet already exists
				const existingEmployeePaysheet =
					await prisma.employeePaysheet.findUnique({
						where: {
							company_id_pay_period_id_employee_id: {
								company_id: paysheet.company_id,
								pay_period_id: paysheet.pay_period_id,
								employee_id: paysheet.guard_id, // Using guard_id as employee_id
							},
						},
					})

				const employeePaysheetData = {
					company_id: paysheet.company_id,
					pay_period_id: paysheet.pay_period_id,
					employee_id: paysheet.guard_id, // Map guard_id to employee_id
					employee_type: employee.employee_type || 'REGULAR',

					// Map timesheet IDs
					timesheet_ids: paysheet.timesheet_ids,

					// Map amount fields from Paysheet
					amount_8h: paysheet.amount_8h,
					amount_ot: paysheet.amount_ot,
					amount_night: paysheet.amount_night,

					// Map earnings (use amount fields as base for earnings)
					basic_pay: paysheet.amount_8h, // Regular hours amount as basic pay
					overtime_pay: paysheet.amount_ot,
					night_diff_pay: paysheet.amount_night,
					holiday_pay: 0, // Paysheet doesn't have holiday pay

					// Map allowances and deductions
					allowances_amount: paysheet.allowances_amount,
					loans_amount: paysheet.loans_amount,
					deductions_amount: paysheet.deductions_amount,

					// Map government contributions
					sss_ee: paysheet.sss_ee,
					sss_er: paysheet.sss_er,
					philhealth_ee: paysheet.philhealth_ee,
					philhealth_er: paysheet.philhealth_er,
					hdmf_ee: paysheet.hdmf_ee,
					hdmf_er: paysheet.hdmf_er,

					// Tax (Paysheet doesn't have tax_withheld, calculate from deductions)
					tax_withheld: 0, // Will need to be calculated separately

					// Map totals
					gross_pay: paysheet.gross_pay,
					net_pay: paysheet.net_pay,

					// Map status
					status: paysheet.status,

					// Set created_at to match original
					created_at: paysheet.created_at,
				}

				if (existingEmployeePaysheet) {
					// Update existing record
					const updatedPaysheet = await prisma.employeePaysheet.update({
						where: { id: existingEmployeePaysheet.id },
						data: employeePaysheetData,
					})

					console.log(
						`  ✅ Updated EmployeePaysheet for ${employee.employee_no}`,
					)
					console.log(`     Gross Pay: ${updatedPaysheet.gross_pay}`)
					console.log(`     Net Pay: ${updatedPaysheet.net_pay}`)
					updated++
				} else {
					// Create new record
					const newPaysheet = await prisma.employeePaysheet.create({
						data: employeePaysheetData,
					})

					console.log(
						`  ✅ Created EmployeePaysheet for ${employee.employee_no}`,
					)
					console.log(`     Gross Pay: ${newPaysheet.gross_pay}`)
					console.log(`     Net Pay: ${newPaysheet.net_pay}`)
					created++
				}
			} catch (error) {
				console.error(
					`  ❌ Error processing paysheet ID ${paysheet.id}:`,
					error,
				)
				errors++
			}
		}

		// Step 3: Summary
		console.log('\n📊 Migration Summary:')
		console.log('=====================================')
		console.log(`Total Paysheets Processed: ${paysheets.length}`)
		console.log(`EmployeePaysheets Created: ${created}`)
		console.log(`EmployeePaysheets Updated: ${updated}`)
		console.log(`Records Skipped: ${skipped}`)
		console.log(`Errors: ${errors}`)

		// Step 4: Verify migration
		console.log('\n🔍 Verifying migration...')

		const totalPaysheets = await prisma.paysheet.count()
		const totalEmployeePaysheets = await prisma.employeePaysheet.count()

		console.log(`Total Paysheet records: ${totalPaysheets}`)
		console.log(`Total EmployeePaysheet records: ${totalEmployeePaysheets}`)

		// Show sample of migrated data
		console.log('\n📋 Sample of migrated EmployeePaysheets:')
		const samplePaysheets = await prisma.employeePaysheet.findMany({
			take: 5,
			orderBy: { created_at: 'desc' },
		})

		for (const ep of samplePaysheets) {
			const employee = await prisma.employee.findUnique({
				where: { id: ep.employee_id },
				select: { employee_no: true, first_name: true, last_name: true },
			})

			if (employee) {
				console.log(
					`\n  ${employee.employee_no}: ${employee.first_name} ${employee.last_name}`,
				)
				console.log(`    Pay Period: ${ep.pay_period_id}`)
				console.log(`    Amount 8h: ${ep.amount_8h}`)
				console.log(`    Amount OT: ${ep.amount_ot}`)
				console.log(`    Amount Night: ${ep.amount_night}`)
				console.log(`    Gross Pay: ${ep.gross_pay}`)
				console.log(
					`    Deductions: ${ep.sss_ee?.toNumber() + ep.philhealth_ee?.toNumber() + ep.hdmf_ee?.toNumber() + ep.loans_amount?.toNumber() + ep.deductions_amount?.toNumber()}`,
				)
				console.log(`    Net Pay: ${ep.net_pay}`)
				console.log(`    Status: ${ep.status}`)
			}
		}

		console.log(
			"\n💡 Note: Tax withholding field was set to 0 as Paysheet doesn't have this field.",
		)
		console.log(
			'   You may need to calculate and update tax withholding separately.',
		)
	} catch (error) {
		console.error('❌ Error during migration:', error)
		throw error
	}
}

// Run the migration
copyPaysheetToEmployeePaysheet()
	.then(() => {
		console.log(
			'\n✅ Migration from Paysheet to EmployeePaysheet completed successfully!',
		)
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Migration failed:', error)
		process.exit(1)
	})
