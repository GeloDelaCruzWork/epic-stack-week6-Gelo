import { prisma } from '#app/utils/db.server.ts'

async function createEmployeeProfiles() {
	console.log('🚀 Starting Employee Profile creation...\n')

	try {
		// Step 1: Fetch all Employee records
		console.log('📋 Fetching all employees...')
		const employees = await prisma.employee.findMany({
			orderBy: { employee_no: 'asc' },
		})

		console.log(`Found ${employees.length} employees total\n`)

		let guardProfilesCreated = 0
		let regularProfilesCreated = 0
		let profilesSkipped = 0

		// Step 2: Process each employee
		for (const employee of employees) {
			console.log(
				`Processing ${employee.employee_no}: ${employee.first_name} ${employee.last_name} (${employee.classification})`,
			)

			if (employee.classification === 'GUARD') {
				// Check if GuardProfile already exists
				const existingGuardProfile = await prisma.guardProfile.findUnique({
					where: { employee_id: employee.id },
				})

				if (existingGuardProfile) {
					console.log(
						`  ⏭️ GuardProfile already exists for ${employee.employee_no}`,
					)
					profilesSkipped++
					continue
				}

				// Create GuardProfile for guards
				const guardProfile = await prisma.guardProfile.create({
					data: {
						employee_id: employee.id,
						license_no: `SEC-${employee.employee_no}`, // Generate a sample license number
						license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
						security_clearance: 'LEVEL_1', // Default clearance level
					},
				})

				console.log(`  ✅ Created GuardProfile for ${employee.employee_no}`)
				guardProfilesCreated++
			} else {
				// Check if RegularEmployeeProfile already exists
				const existingRegularProfile =
					await prisma.regularEmployeeProfile.findUnique({
						where: { employee_id: employee.id },
					})

				if (existingRegularProfile) {
					console.log(
						`  ⏭️ RegularEmployeeProfile already exists for ${employee.employee_no}`,
					)
					profilesSkipped++
					continue
				}

				// Create RegularEmployeeProfile for non-guard employees
				// Determine department and job level based on classification
				let department = 'GENERAL'
				let jobLevel = 'STAFF'

				if (employee.classification === 'ADMIN') {
					department = 'ADMINISTRATION'
					jobLevel = 'SENIOR'
				} else if (employee.classification === 'CONSULTANT') {
					department = 'CONSULTING'
					jobLevel = 'CONSULTANT'
				} else if (employee.classification === 'OFFICE_STAFF') {
					department = 'OPERATIONS'
					jobLevel = 'JUNIOR'
				}

				const regularProfile = await prisma.regularEmployeeProfile.create({
					data: {
						employee_id: employee.id,
						department: department,
						job_level: jobLevel,
						direct_report: null, // Can be updated later with actual supervisor
					},
				})

				console.log(
					`  ✅ Created RegularEmployeeProfile for ${employee.employee_no} (${department}/${jobLevel})`,
				)
				regularProfilesCreated++
			}
		}

		// Step 3: Verify and report results
		console.log('\n📊 Profile Creation Summary:')
		console.log('================================')
		console.log(`Total Employees Processed: ${employees.length}`)
		console.log(`GuardProfiles Created: ${guardProfilesCreated}`)
		console.log(`RegularEmployeeProfiles Created: ${regularProfilesCreated}`)
		console.log(`Profiles Skipped (already exist): ${profilesSkipped}`)

		// Verify counts in database
		const totalGuardProfiles = await prisma.guardProfile.count()
		const totalRegularProfiles = await prisma.regularEmployeeProfile.count()

		console.log('\n🔍 Database Verification:')
		console.log(`Total GuardProfiles in DB: ${totalGuardProfiles}`)
		console.log(`Total RegularEmployeeProfiles in DB: ${totalRegularProfiles}`)

		// List all profiles with their employees
		console.log('\n📋 Created Profiles Detail:')
		console.log('\nGuard Profiles:')
		const guardProfiles = await prisma.guardProfile.findMany({
			include: {
				employee: {
					select: {
						employee_no: true,
						first_name: true,
						last_name: true,
					},
				},
			},
		})

		for (const profile of guardProfiles) {
			console.log(
				`  - ${profile.employee.employee_no}: ${profile.employee.first_name} ${profile.employee.last_name}`,
			)
			console.log(
				`    License: ${profile.license_no}, Clearance: ${profile.security_clearance}`,
			)
		}

		console.log('\nRegular Employee Profiles:')
		const regularProfiles = await prisma.regularEmployeeProfile.findMany({
			include: {
				employee: {
					select: {
						employee_no: true,
						first_name: true,
						last_name: true,
						classification: true,
					},
				},
			},
		})

		for (const profile of regularProfiles) {
			console.log(
				`  - ${profile.employee.employee_no}: ${profile.employee.first_name} ${profile.employee.last_name} (${profile.employee.classification})`,
			)
			console.log(
				`    Dept: ${profile.department}, Level: ${profile.job_level}`,
			)
		}
	} catch (error) {
		console.error('❌ Error creating employee profiles:', error)
		throw error
	}
}

// Run the script
createEmployeeProfiles()
	.then(() => {
		console.log('\n✅ Employee profile creation completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Employee profile creation failed:', error)
		process.exit(1)
	})
