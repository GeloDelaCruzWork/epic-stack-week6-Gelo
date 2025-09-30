import { prisma } from '#app/utils/db.server.ts'

async function createEmployeeCompensation() {
	console.log(
		'💰 Starting Employee Compensation/Contract creation for non-guard employees...\n',
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

		let contractsCreated = 0
		let contractsSkipped = 0

		// Step 2: Create EmploymentContract for each non-guard employee
		for (const employee of nonGuardEmployees) {
			console.log(
				`Processing ${employee.employee_no}: ${employee.first_name} ${employee.last_name} (${employee.classification})`,
			)

			// Check if EmploymentContract already exists
			const existingContract = await prisma.employmentContract.findFirst({
				where: {
					company_id: employee.company_id,
					employee_id: employee.id,
					status: 'ACTIVE',
				},
			})

			if (existingContract) {
				console.log(
					`  ⏭️ Active Employment Contract already exists for ${employee.employee_no}`,
				)
				contractsSkipped++
				continue
			}

			// Determine compensation based on classification and type
			let baseSalary = 0
			let contractType = 'PERMANENT'
			let allowances = {}
			let benefits = {}
			let noticePeriod = 30 // days

			if (employee.classification === 'ADMIN') {
				baseSalary = 50000 // PHP 50,000 monthly for admin staff
				contractType = 'PERMANENT'
				allowances = {
					meal: 3000,
					transportation: 2000,
					communication: 1500,
				}
				benefits = {
					healthInsurance: true,
					lifeInsurance: true,
					sss: true,
					philhealth: true,
					pagibig: true,
					thirteenthMonth: true,
					vacation: 15,
					sick: 15,
				}
				noticePeriod = 60
			} else if (employee.classification === 'CONSULTANT') {
				baseSalary = 80000 // PHP 80,000 monthly for consultants
				contractType = 'FIXED_TERM'
				allowances = {
					professional: 5000,
					communication: 2000,
				}
				benefits = {
					healthInsurance: true,
					professionalDevelopment: 10000,
					thirteenthMonth: false, // Consultants might not get 13th month
					vacation: 10,
				}
				noticePeriod = 30
			} else if (employee.classification === 'OFFICE_STAFF') {
				baseSalary = 25000 // PHP 25,000 monthly for office staff
				contractType =
					employee.employee_type === 'PART_TIME' ? 'FIXED_TERM' : 'PERMANENT'
				allowances = {
					meal: 2000,
					transportation: 1500,
				}
				benefits = {
					healthInsurance: true,
					sss: true,
					philhealth: true,
					pagibig: true,
					thirteenthMonth: true,
					vacation: 10,
					sick: 10,
				}
				noticePeriod = 30
			} else {
				// Default for other classifications
				baseSalary = 30000
				contractType = 'PERMANENT'
				allowances = {
					meal: 2000,
				}
				benefits = {
					sss: true,
					philhealth: true,
					pagibig: true,
					thirteenthMonth: true,
					vacation: 10,
					sick: 10,
				}
			}

			// Calculate probation period (3 months for permanent, none for others)
			const probationEndDate =
				contractType === 'PERMANENT'
					? new Date(employee.hire_date.getTime() + 90 * 24 * 60 * 60 * 1000)
					: null

			// Calculate contract end date (1 year for fixed term, null for permanent)
			const contractEndDate =
				contractType === 'FIXED_TERM'
					? new Date(employee.hire_date.getTime() + 365 * 24 * 60 * 60 * 1000)
					: null

			// Create the employment contract
			const contract = await prisma.employmentContract.create({
				data: {
					company_id: employee.company_id,
					employee_id: employee.id,
					contract_type: contractType,
					start_date: employee.hire_date,
					end_date: contractEndDate,
					probation_end_date: probationEndDate,
					notice_period_days: noticePeriod,
					base_salary: baseSalary,
					allowances_json: allowances,
					benefits_json: benefits,
					status: 'ACTIVE',
				},
			})

			console.log(
				`  ✅ Created Employment Contract for ${employee.employee_no}`,
			)
			console.log(`     Contract Type: ${contractType}`)
			console.log(`     Base Salary: PHP ${baseSalary.toLocaleString()}`)
			console.log(
				`     Total Allowances: PHP ${Object.values(allowances)
					.reduce((a: number, b: any) => a + b, 0)
					.toLocaleString()}`,
			)

			// Also update the employee's compensation fields
			await prisma.employee.update({
				where: { id: employee.id },
				data: {
					base_salary: baseSalary,
					compensation_type:
						employee.classification === 'CONSULTANT'
							? 'PROJECT_BASED'
							: 'FIXED_SALARY',
					pay_frequency: 'MONTHLY',
					requires_timesheet: false, // Non-guards typically don't need timesheets unless they're hourly
				},
			})

			contractsCreated++
		}

		// Step 3: Create CompensationPlan records if they don't exist
		console.log('\n📋 Creating Compensation Plans...')

		const compensationPlans = [
			{
				code: 'ADMIN_REGULAR',
				name: 'Administrative Staff - Regular',
				employee_type: 'REGULAR',
				base_calculation: 'MONTHLY',
				overtime_eligible: true,
				night_diff_eligible: false,
				holiday_pay_eligible: true,
				sss_eligible: true,
				philhealth_eligible: true,
				hdmf_eligible: true,
				tax_eligible: true,
			},
			{
				code: 'CONSULTANT_CONTRACT',
				name: 'Consultant - Contractual',
				employee_type: 'CONTRACTUAL',
				base_calculation: 'PROJECT',
				overtime_eligible: false,
				night_diff_eligible: false,
				holiday_pay_eligible: false,
				sss_eligible: false,
				philhealth_eligible: false,
				hdmf_eligible: false,
				tax_eligible: true,
			},
			{
				code: 'PARTTIME_HOURLY',
				name: 'Part-time - Hourly',
				employee_type: 'PART_TIME',
				base_calculation: 'HOURLY',
				overtime_eligible: true,
				night_diff_eligible: true,
				holiday_pay_eligible: true,
				sss_eligible: true,
				philhealth_eligible: true,
				hdmf_eligible: true,
				tax_eligible: true,
			},
			{
				code: 'GUARD_TIMEBASED',
				name: 'Security Guard - Time-based',
				employee_type: 'REGULAR',
				base_calculation: 'HOURLY',
				overtime_eligible: true,
				night_diff_eligible: true,
				holiday_pay_eligible: true,
				sss_eligible: true,
				philhealth_eligible: true,
				hdmf_eligible: true,
				tax_eligible: true,
			},
		]

		const companyId = nonGuardEmployees[0]?.company_id || 'default-company'

		for (const planData of compensationPlans) {
			const existingPlan = await prisma.compensationPlan.findUnique({
				where: {
					company_id_code: {
						company_id: companyId,
						code: planData.code,
					},
				},
			})

			if (!existingPlan) {
				await prisma.compensationPlan.create({
					data: {
						company_id: companyId,
						...planData,
					},
				})
				console.log(`  ✅ Created Compensation Plan: ${planData.name}`)
			} else {
				console.log(`  ⏭️ Compensation Plan already exists: ${planData.name}`)
			}
		}

		// Step 4: Summary
		console.log('\n📊 Compensation Creation Summary:')
		console.log('=====================================')
		console.log(`Total Non-Guard Employees: ${nonGuardEmployees.length}`)
		console.log(`Employment Contracts Created: ${contractsCreated}`)
		console.log(`Contracts Skipped (already exist): ${contractsSkipped}`)

		// Verify in database
		const totalContracts = await prisma.employmentContract.count({
			where: { status: 'ACTIVE' },
		})
		const totalPlans = await prisma.compensationPlan.count()

		console.log('\n🔍 Database Verification:')
		console.log(`Total Active Employment Contracts: ${totalContracts}`)
		console.log(`Total Compensation Plans: ${totalPlans}`)

		// List all contracts with details
		console.log('\n💼 Created Employment Contracts:')
		const contracts = await prisma.employmentContract.findMany({
			where: {
				employee_id: {
					in: nonGuardEmployees.map((e) => e.id),
				},
			},
			include: {
				// Note: Employee relation might not be defined in schema, so we'll fetch separately
			},
		})

		for (const contract of contracts) {
			const employee = nonGuardEmployees.find(
				(e) => e.id === contract.employee_id,
			)
			if (employee) {
				console.log(
					`\n  ${employee.employee_no}: ${employee.first_name} ${employee.last_name}`,
				)
				console.log(`    Type: ${contract.contract_type}`)
				console.log(
					`    Base Salary: PHP ${contract.base_salary?.toLocaleString() || 'N/A'}`,
				)
				console.log(`    Start Date: ${contract.start_date.toDateString()}`)
				if (contract.end_date) {
					console.log(`    End Date: ${contract.end_date.toDateString()}`)
				}
				console.log(`    Status: ${contract.status}`)
			}
		}
	} catch (error) {
		console.error('❌ Error creating employee compensation:', error)
		throw error
	}
}

// Run the script
createEmployeeCompensation()
	.then(() => {
		console.log('\n✅ Employee compensation creation completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Employee compensation creation failed:', error)
		process.exit(1)
	})
