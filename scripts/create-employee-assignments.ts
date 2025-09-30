import { prisma } from '#app/utils/db.server.ts'

async function createEmployeeAssignments() {
	console.log(
		'📍 Starting Employee Assignment creation for non-guard employees...\n',
	)

	try {
		// Step 1: Fetch all non-guard employees
		console.log('📋 Fetching non-guard employees...')
		const nonGuardEmployees = await prisma.employee.findMany({
			where: {
				classification: {
					not: 'GUARD',
				},
			},
			orderBy: { employee_no: 'asc' },
		})

		console.log(`Found ${nonGuardEmployees.length} non-guard employees\n`)

		// Step 2: Get or create departments
		console.log('🏢 Setting up departments...')
		const companyId = nonGuardEmployees[0]?.company_id || 'default-company'

		const departments = [
			{ code: 'ADMIN', name: 'Administration' },
			{ code: 'HR', name: 'Human Resources' },
			{ code: 'FIN', name: 'Finance' },
			{ code: 'OPS', name: 'Operations' },
			{ code: 'IT', name: 'Information Technology' },
			{ code: 'SALES', name: 'Sales' },
			{ code: 'MKTG', name: 'Marketing' },
			{ code: 'CONS', name: 'Consulting Services' },
		]

		const departmentIds: Record<string, string> = {}

		for (const dept of departments) {
			let department = await prisma.department.findUnique({
				where: {
					company_id_code: {
						company_id: companyId,
						code: dept.code,
					},
				},
			})

			if (!department) {
				department = await prisma.department.create({
					data: {
						company_id: companyId,
						code: dept.code,
						name: dept.name,
					},
				})
				console.log(`  ✅ Created department: ${dept.name}`)
			} else {
				console.log(`  ⏭️ Department exists: ${dept.name}`)
			}

			departmentIds[dept.code] = department.id
		}

		// Step 3: Get some sample locations (for office assignments)
		const locations = await prisma.location.findMany({
			where: { company_id: companyId },
			take: 3,
		})

		const mainOfficeLocation = locations[0]?.id // Use first location as main office

		// Step 4: Get positions for office staff
		let adminPosition = await prisma.position.findFirst({
			where: {
				company_id: companyId,
				code: 'Admin',
			},
		})

		if (!adminPosition) {
			adminPosition = await prisma.position.create({
				data: {
					company_id: companyId,
					code: 'Admin',
					name: 'Administrative Staff',
				},
			})
			console.log('\n  ✅ Created Admin position')
		}

		let consultantPosition = await prisma.position.findFirst({
			where: {
				company_id: companyId,
				code: 'Consultant',
			},
		})

		if (!consultantPosition) {
			consultantPosition = await prisma.position.create({
				data: {
					company_id: companyId,
					code: 'Consultant',
					name: 'Consultant',
				},
			})
			console.log('  ✅ Created Consultant position')
		}

		// Step 5: Create assignments for each non-guard employee
		console.log('\n📋 Creating Employee Assignments...\n')

		let assignmentsCreated = 0
		let assignmentsSkipped = 0

		for (const employee of nonGuardEmployees) {
			console.log(
				`Processing ${employee.employee_no}: ${employee.first_name} ${employee.last_name} (${employee.classification})`,
			)

			// Check if assignment already exists
			const existingAssignment = await prisma.employeeAssignment.findFirst({
				where: {
					company_id: employee.company_id,
					employee_id: employee.id,
					effective_to: null, // Current active assignment
				},
			})

			if (existingAssignment) {
				console.log(
					`  ⏭️ Active assignment already exists for ${employee.employee_no}`,
				)
				assignmentsSkipped++
				continue
			}

			// Determine assignment details based on classification
			let assignmentType = 'DEPARTMENT'
			let departmentId = null
			let projectId = null
			let clientId = null
			let locationId = mainOfficeLocation
			let positionId = adminPosition?.id
			let shiftId = null // Office workers typically don't have shifts

			if (employee.classification === 'ADMIN') {
				assignmentType = 'DEPARTMENT'
				departmentId = departmentIds['ADMIN']
				positionId = adminPosition?.id
			} else if (employee.classification === 'CONSULTANT') {
				assignmentType = 'PROJECT' // Consultants are typically project-based
				departmentId = departmentIds['CONS']
				positionId = consultantPosition?.id
				// In real scenario, would assign to actual project
				projectId = null // Will be null for now, can be updated later
			} else if (employee.classification === 'OFFICE_STAFF') {
				assignmentType = 'DEPARTMENT'
				departmentId = departmentIds['OPS'] // Assign to Operations by default
				positionId = adminPosition?.id
			} else {
				// Default assignment
				assignmentType = 'DEPARTMENT'
				departmentId = departmentIds['OPS']
				positionId = adminPosition?.id
			}

			// Create the assignment
			const assignment = await prisma.employeeAssignment.create({
				data: {
					company_id: employee.company_id,
					employee_id: employee.id,
					assignment_type: assignmentType,

					// Assignment references (flexible based on type)
					location_id: locationId,
					department_id: departmentId,
					project_id: projectId,
					client_id: clientId,

					position_id: positionId,
					shift_id: shiftId,

					effective_from: employee.hire_date,
					effective_to: null, // Currently active
				},
			})

			console.log(
				`  ✅ Created ${assignmentType} assignment for ${employee.employee_no}`,
			)

			// Get department name for display
			const deptCode = Object.keys(departmentIds).find(
				(key) => departmentIds[key] === departmentId,
			)
			const deptInfo = departments.find((d) => d.code === deptCode)

			console.log(`     Department: ${deptInfo?.name || 'N/A'}`)
			console.log(
				`     Position: ${positionId === adminPosition?.id ? 'Administrative Staff' : 'Consultant'}`,
			)
			console.log(`     Effective from: ${employee.hire_date.toDateString()}`)

			assignmentsCreated++
		}

		// Step 6: Summary and verification
		console.log('\n📊 Assignment Creation Summary:')
		console.log('=====================================')
		console.log(`Total Non-Guard Employees: ${nonGuardEmployees.length}`)
		console.log(`Assignments Created: ${assignmentsCreated}`)
		console.log(`Assignments Skipped (already exist): ${assignmentsSkipped}`)

		// Verify in database
		const totalAssignments = await prisma.employeeAssignment.count({
			where: {
				assignment_type: {
					in: ['DEPARTMENT', 'PROJECT', 'CLIENT'],
				},
			},
		})

		console.log('\n🔍 Database Verification:')
		console.log(`Total Non-Guard Employee Assignments: ${totalAssignments}`)

		// List all created assignments with details
		console.log('\n📋 Created Assignments Detail:')

		const assignments = await prisma.employeeAssignment.findMany({
			where: {
				employee_id: {
					in: nonGuardEmployees.map((e) => e.id),
				},
			},
		})

		for (const assignment of assignments) {
			const employee = nonGuardEmployees.find(
				(e) => e.id === assignment.employee_id,
			)
			if (employee) {
				console.log(
					`\n  ${employee.employee_no}: ${employee.first_name} ${employee.last_name}`,
				)
				console.log(`    Assignment Type: ${assignment.assignment_type}`)

				if (assignment.department_id) {
					const dept = await prisma.department.findUnique({
						where: { id: assignment.department_id },
					})
					console.log(`    Department: ${dept?.name || 'N/A'}`)
				}

				if (assignment.location_id) {
					const location = await prisma.location.findUnique({
						where: { id: assignment.location_id },
					})
					console.log(`    Location: ${location?.name || 'N/A'}`)
				}

				if (assignment.position_id) {
					const position = await prisma.position.findUnique({
						where: { id: assignment.position_id },
					})
					console.log(`    Position: ${position?.name || 'N/A'}`)
				}

				console.log(
					`    Effective From: ${assignment.effective_from.toDateString()}`,
				)
				console.log(
					`    Status: ${assignment.effective_to ? 'Ended' : 'Active'}`,
				)
			}
		}

		console.log(
			'\n💡 Note: These are initial assignments. You can adjust them later as needed.',
		)
		console.log(
			'   - Update department_id for different department assignments',
		)
		console.log('   - Add project_id for project-based assignments')
		console.log('   - Add client_id for client-specific assignments')
		console.log('   - Update location_id for different office locations')
	} catch (error) {
		console.error('❌ Error creating employee assignments:', error)
		throw error
	}
}

// Run the script
createEmployeeAssignments()
	.then(() => {
		console.log('\n✅ Employee assignment creation completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Employee assignment creation failed:', error)
		process.exit(1)
	})
