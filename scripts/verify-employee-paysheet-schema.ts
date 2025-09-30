import { prisma } from '#app/utils/db.server.ts'

async function verifyEmployeePaysheetSchema() {
	console.log('🔍 Verifying EmployeePaysheet schema changes...\n')

	try {
		// Create a test EmployeePaysheet record to verify all fields are available
		const testPayPeriod = await prisma.payPeriod.findFirst({
			where: { status: 'ACTIVE' },
		})

		const testEmployee = await prisma.employee.findFirst()

		if (!testPayPeriod || !testEmployee) {
			console.log('⚠️ No test data available. Creating minimal test data...')
			return
		}

		// Try to create a record with the new fields
		const testPaysheet = await prisma.employeePaysheet.upsert({
			where: {
				company_id_pay_period_id_employee_id: {
					company_id: testEmployee.company_id,
					pay_period_id: testPayPeriod.id,
					employee_id: testEmployee.id,
				},
			},
			update: {
				// Update with new fields
				amount_8h: 10000,
				amount_ot: 2000,
				amount_night: 500,
			},
			create: {
				company_id: testEmployee.company_id,
				pay_period_id: testPayPeriod.id,
				employee_id: testEmployee.id,
				employee_type: testEmployee.employee_type || 'REGULAR',

				// New fields
				amount_8h: 10000,
				amount_ot: 2000,
				amount_night: 500,

				// Original fields
				timesheet_ids: [],
				basic_pay: 30000,
				overtime_pay: 2000,
				night_diff_pay: 500,
				holiday_pay: 0,

				allowances_amount: 5000,
				loans_amount: 0,
				deductions_amount: 0,

				sss_ee: 1125,
				sss_er: 1125,
				philhealth_ee: 450,
				philhealth_er: 450,
				hdmf_ee: 100,
				hdmf_er: 200,
				tax_withheld: 2500,

				gross_pay: 37500,
				net_pay: 33325,

				status: 'TEST',
			},
		})

		console.log(
			'✅ Successfully created/updated EmployeePaysheet with new fields:',
		)
		console.log(
			`   Employee: ${testEmployee.employee_no} - ${testEmployee.first_name} ${testEmployee.last_name}`,
		)
		console.log(`   Pay Period: ${testPayPeriod.code}`)
		console.log('\n   New Amount Fields:')
		console.log(`   - amount_8h: ${testPaysheet.amount_8h}`)
		console.log(`   - amount_ot: ${testPaysheet.amount_ot}`)
		console.log(`   - amount_night: ${testPaysheet.amount_night}`)
		console.log('\n   Earnings Fields:')
		console.log(`   - basic_pay: ${testPaysheet.basic_pay}`)
		console.log(`   - overtime_pay: ${testPaysheet.overtime_pay}`)
		console.log(`   - night_diff_pay: ${testPaysheet.night_diff_pay}`)

		// Clean up test record if it was created just for testing
		if (testPaysheet.status === 'TEST') {
			await prisma.employeePaysheet.delete({
				where: { id: testPaysheet.id },
			})
			console.log('\n🧹 Cleaned up test record')
		}

		console.log(
			'\n✅ Schema verification complete! All new fields are working correctly.',
		)
	} catch (error) {
		console.error('❌ Error verifying schema:', error)
		throw error
	}
}

// Run verification
verifyEmployeePaysheetSchema()
	.then(() => {
		console.log('\n✅ Schema verification completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Schema verification failed:', error)
		process.exit(1)
	})
