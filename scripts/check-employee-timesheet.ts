import { prisma } from '#app/utils/db.server.ts'

async function checkEmployeeTimesheets() {
	const count = await prisma.employeeTimesheet.count()
	const samples = await prisma.employeeTimesheet.findMany({
		take: 5,
		include: {
			// We can't include relations directly since Employee is not defined in the schema relation
			// But we can show the IDs
		},
	})

	console.log('Total EmployeeTimesheet records:', count)
	console.log('\nSample records:')

	for (const record of samples) {
		console.log(`- Employee ID: ${record.employee_id}`)
		console.log(`  Pay Period: ${record.pay_period_id}`)
		console.log(`  Tracking Method: ${record.tracking_method}`)
		console.log(`  Status: ${record.status}`)
		if (record.tracking_method === 'TIME_LOG') {
			console.log(`  Regular Hours: ${record.total_hours_regular}`)
			console.log(`  OT Hours: ${record.total_hours_ot}`)
			console.log(`  Night Hours: ${record.total_hours_night}`)
		} else {
			console.log(`  Days Worked: ${record.days_worked}`)
			console.log(`  Days Absent: ${record.days_absent}`)
		}
		console.log('---')
	}

	// Also check guards to verify mapping
	const guards = await prisma.guard.findMany({ take: 3 })
	console.log('\nGuards for reference:')
	for (const guard of guards) {
		console.log(
			`- ${guard.employee_no}: ${guard.first_name} ${guard.last_name} (ID: ${guard.id})`,
		)
	}
}

checkEmployeeTimesheets()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
