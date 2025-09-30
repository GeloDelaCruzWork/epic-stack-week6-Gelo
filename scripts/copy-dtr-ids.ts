import { prisma } from '#app/utils/db.server.ts'

async function copyDtrIds() {
	const timesheetId = '71c4b65d-a3f1-4f3b-bcd5-7f51ae47812f'
	const employeeTimesheetId = 'c2864885-3e4b-4a31-bc5b-dd662ee0fea3'

	try {
		// Step 1: Fetch the source Timesheet record
		console.log(`Fetching Timesheet with ID: ${timesheetId}`)
		const sourceTimesheet = await prisma.timesheet.findUnique({
			where: { id: timesheetId },
		})

		if (!sourceTimesheet) {
			console.error(`Timesheet with ID ${timesheetId} not found`)
			return
		}

		console.log(`Found Timesheet for guard ${sourceTimesheet.guard_id}`)
		console.log(`DTR IDs to copy: ${sourceTimesheet.dtr_ids.length} records`)
		console.log(`DTR IDs: ${JSON.stringify(sourceTimesheet.dtr_ids, null, 2)}`)

		// Step 2: Update the EmployeeTimesheet record
		console.log(`\nUpdating EmployeeTimesheet with ID: ${employeeTimesheetId}`)

		const updatedEmployeeTimesheet = await prisma.employeeTimesheet.update({
			where: { id: employeeTimesheetId },
			data: {
				dtr_ids: sourceTimesheet.dtr_ids,
				// Also copy the hours data if available
				total_hours_regular: sourceTimesheet.total_hours_8h,
				total_hours_ot: sourceTimesheet.total_hours_ot,
				total_hours_night: sourceTimesheet.total_hours_night,
				// Update status to match if needed
				status: sourceTimesheet.status,
			},
		})

		console.log(`✅ Successfully updated EmployeeTimesheet`)
		console.log(`  Employee ID: ${updatedEmployeeTimesheet.employee_id}`)
		console.log(`  DTR IDs copied: ${updatedEmployeeTimesheet.dtr_ids.length}`)
		console.log(
			`  Regular hours: ${updatedEmployeeTimesheet.total_hours_regular}`,
		)
		console.log(`  OT hours: ${updatedEmployeeTimesheet.total_hours_ot}`)
		console.log(`  Night hours: ${updatedEmployeeTimesheet.total_hours_night}`)
		console.log(`  Status: ${updatedEmployeeTimesheet.status}`)
	} catch (error) {
		console.error('❌ Error copying DTR IDs:', error)
		throw error
	}
}

copyDtrIds()
	.then(() => {
		console.log('\n✅ DTR IDs copy completed successfully')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Failed to copy DTR IDs:', error)
		process.exit(1)
	})
