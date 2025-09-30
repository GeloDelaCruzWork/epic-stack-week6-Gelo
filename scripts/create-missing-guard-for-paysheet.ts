import { prisma } from '#app/utils/db.server.ts'

async function createMissingGuardForPaysheet() {
	console.log(
		'🔧 Creating missing Guard/Employee records for orphaned Paysheet...\n',
	)

	try {
		const orphanedGuardId = 'd313c2de-18a6-4aa2-bd4b-c1bc8e5c2a0b'
		const paysheet = await prisma.paysheet.findFirst({
			where: { guard_id: orphanedGuardId },
		})

		if (!paysheet) {
			console.log('No paysheet found with the orphaned guard ID')
			return
		}

		console.log(`Found Paysheet with orphaned guard_id: ${orphanedGuardId}`)
		console.log(`  Pay Period: ${paysheet.pay_period_id}`)
		console.log(`  Gross Pay: ${paysheet.gross_pay}`)
		console.log(`  Net Pay: ${paysheet.net_pay}`)

		// Step 1: Create Guard record
		console.log('\n📋 Creating Guard record...')
		const guard = await prisma.guard.create({
			data: {
				id: orphanedGuardId,
				company_id: paysheet.company_id,
				employee_no: 'G999', // Placeholder employee number
				last_name: 'Unknown',
				first_name: 'Guard',
				middle_name: null,
				hire_date: new Date('2023-01-01'),
				status: 'ACTIVE',
			},
		})
		console.log(
			`✅ Created Guard: ${guard.employee_no} - ${guard.first_name} ${guard.last_name}`,
		)

		// Step 2: Create corresponding Employee record
		console.log('\n📋 Creating Employee record...')
		const employee = await prisma.employee.create({
			data: {
				id: guard.id, // Use same ID as guard
				company_id: guard.company_id,
				employee_no: guard.employee_no,
				employee_type: 'REGULAR',
				classification: 'GUARD',
				last_name: guard.last_name,
				first_name: guard.first_name,
				middle_name: guard.middle_name,
				hire_date: guard.hire_date,
				employment_status: 'ACTIVE',
				compensation_type: 'TIME_BASED',
				pay_frequency: 'SEMI_MONTHLY',
				requires_timesheet: true,
			},
		})
		console.log(
			`✅ Created Employee: ${employee.employee_no} - ${employee.first_name} ${employee.last_name}`,
		)

		// Step 3: Now create EmployeePaysheet from the Paysheet
		console.log('\n📋 Creating EmployeePaysheet from Paysheet...')
		const employeePaysheet = await prisma.employeePaysheet.create({
			data: {
				company_id: paysheet.company_id,
				pay_period_id: paysheet.pay_period_id,
				employee_id: paysheet.guard_id,
				employee_type: employee.employee_type,

				// Copy all fields from Paysheet
				timesheet_ids: paysheet.timesheet_ids,
				amount_8h: paysheet.amount_8h,
				amount_ot: paysheet.amount_ot,
				amount_night: paysheet.amount_night,

				// Map amounts to earnings
				basic_pay: paysheet.amount_8h,
				overtime_pay: paysheet.amount_ot,
				night_diff_pay: paysheet.amount_night,
				holiday_pay: 0,

				// Copy financial fields
				allowances_amount: paysheet.allowances_amount,
				loans_amount: paysheet.loans_amount,
				deductions_amount: paysheet.deductions_amount,

				// Government contributions
				sss_ee: paysheet.sss_ee,
				sss_er: paysheet.sss_er,
				philhealth_ee: paysheet.philhealth_ee,
				philhealth_er: paysheet.philhealth_er,
				hdmf_ee: paysheet.hdmf_ee,
				hdmf_er: paysheet.hdmf_er,

				// Tax (not in Paysheet, set to 0)
				tax_withheld: 0,

				// Totals
				gross_pay: paysheet.gross_pay,
				net_pay: paysheet.net_pay,

				status: paysheet.status,
				created_at: paysheet.created_at,
			},
		})

		console.log(`✅ Created EmployeePaysheet successfully!`)
		console.log(`   Employee: ${employee.employee_no}`)
		console.log(`   Pay Period: ${employeePaysheet.pay_period_id}`)
		console.log(`   Amount 8h: ${employeePaysheet.amount_8h}`)
		console.log(`   Amount OT: ${employeePaysheet.amount_ot}`)
		console.log(`   Amount Night: ${employeePaysheet.amount_night}`)
		console.log(`   Gross Pay: ${employeePaysheet.gross_pay}`)
		console.log(`   Net Pay: ${employeePaysheet.net_pay}`)
		console.log(`   Status: ${employeePaysheet.status}`)

		// Verify
		console.log('\n🔍 Verification:')
		const totalEmployeePaysheets = await prisma.employeePaysheet.count()
		console.log(`Total EmployeePaysheet records: ${totalEmployeePaysheets}`)
	} catch (error) {
		console.error('❌ Error:', error)
		throw error
	}
}

// Run the script
createMissingGuardForPaysheet()
	.then(() => {
		console.log(
			'\n✅ Successfully created missing records and migrated Paysheet data!',
		)
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Failed:', error)
		process.exit(1)
	})
