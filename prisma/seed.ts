import { faker } from '@faker-js/faker'
import { prisma } from '#app/utils/db.server.ts'
import { MOCK_CODE_GITHUB } from '#app/utils/providers/constants'
import {
	createPassword,
	createUser,
	getNoteImages,
	getUserImages,
} from '#tests/db-utils.ts'
import { insertGitHubUser } from '#tests/mocks/github.ts'

async function cleanDatabase() {
	console.time('🧹 Cleaned database...')

	// Delete in order of dependencies (most dependent first)
	// Admin schema
	await prisma.noteImage.deleteMany()
	await prisma.note.deleteMany()
	await prisma.userImage.deleteMany()
	await prisma.connection.deleteMany()
	await prisma.verification.deleteMany()
	await prisma.session.deleteMany()
	await prisma.password.deleteMany()
	await prisma.passkey.deleteMany()
	await prisma.user.deleteMany()
	await prisma.role.deleteMany()
	await prisma.permission.deleteMany()
	await prisma.project.deleteMany()

	// Timekeeper schema
	await prisma.ClockEvent_.deleteMany()
	await prisma.Timelog_.deleteMany()
	await prisma.DTR_.deleteMany()
	await prisma.Timesheet_.deleteMany()
	await prisma.timesheet.deleteMany()

	// NEW: Clean Employee-related tables
	// Benefits schema - Employee tables
	await prisma.employeeDeductionSchedule.deleteMany()
	await prisma.employeeAllowanceSchedule.deleteMany()
	await prisma.employeeLoanSchedule.deleteMany()
	await prisma.employeeDeduction.deleteMany()
	await prisma.employeeAllowance.deleteMany()
	await prisma.employeeLoan.deleteMany()
	await prisma.employeeGovContribution.deleteMany()

	// Payroll schema - Employee tables
	await prisma.employeePayslip.deleteMany()
	await prisma.payrollRun.deleteMany()
	await prisma.compensationPlan.deleteMany()

	// Timekeeper schema - Employee tables
	await prisma.employeeAttendance.deleteMany()
	await prisma.employeeSchedule.deleteMany()
	await prisma.employeeTimesheet.deleteMany()

	// HR schema - Employee tables
	await prisma.employeeLeaveBalance.deleteMany()
	await prisma.employeeLeave.deleteMany()
	await prisma.employmentContract.deleteMany()
	await prisma.guardProfile.deleteMany()
	await prisma.regularEmployeeProfile.deleteMany()

	// Catalog schema - Holiday
	await prisma.holiday.deleteMany()

	// Ops schema
	await prisma.workSchedule.deleteMany()
	await prisma.workCalendarMonth.deleteMany()
	await prisma.payPeriod.deleteMany()

	// HR schema - Guard tables (old) - must delete before employee
	await prisma.guard.deleteMany()

	// Delete employees after guards (due to foreign key)
	await prisma.employee.deleteMany()
	await prisma.department.deleteMany()
	await prisma.costCenter.deleteMany()

	// Catalog schema - Government tables
	await prisma.govTableBIR.deleteMany()
	await prisma.govTableSSS.deleteMany()
	await prisma.govTablePhilHealth.deleteMany()
	await prisma.govTableHDMF.deleteMany()

	// Catalog schema - Other tables
	await prisma.allowanceType.deleteMany()
	await prisma.deductionType.deleteMany()
	await prisma.loanType.deleteMany()
	await prisma.position.deleteMany()
	await prisma.shift.deleteMany()

	// Org schema
	await prisma.location.deleteMany()
	await prisma.subarea.deleteMany()
	await prisma.area.deleteMany()
	await prisma.company.deleteMany()

	console.timeEnd('🧹 Cleaned database...')
}

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	// Clean everything first for a fresh start
	await cleanDatabase()

	console.time('🏢 Created company...')
	const sampleCompany = await prisma.company.create({
		data: {
			id: 'default-company',
			legal_name: 'Sample Company',
			code: 'SAMPLE',
			tin: '123-456-789-000',
			address: '123 Main Street, City, State 12345',
			status: 'active',
		},
	})
	console.timeEnd('🏢 Created company...')

	console.time('🌍 Created areas and sub-areas...')
	// Create Areas
	const upArea = await prisma.area.create({
		data: {
			company_id: sampleCompany.id,
			name: 'UP',
			code: 'UP',
		},
	})

	const dpwhArea = await prisma.area.create({
		data: {
			company_id: sampleCompany.id,
			name: 'DPWH',
			code: 'DPWH',
		},
	})

	// Create SubAreas (only for UP area)
	const upDilimanSubarea = await prisma.subarea.create({
		data: {
			company_id: sampleCompany.id,
			area_id: upArea.id,
			name: 'Diliman',
			code: 'UPD',
		},
	})

	const upClarkSubarea = await prisma.subarea.create({
		data: {
			company_id: sampleCompany.id,
			area_id: upArea.id,
			name: 'Clark',
			code: 'UPC',
		},
	})
	console.timeEnd('🌍 Created areas and sub-areas...')

	console.time('📍 Created locations...')
	// Create Locations
	await prisma.location.create({
		data: {
			company_id: sampleCompany.id,
			area_id: upArea.id,
			subarea_id: upDilimanSubarea.id,
			name: 'UP Diliman',
			code: 'UPD',
			address: 'UP Diliman',
		},
	})

	await prisma.location.create({
		data: {
			company_id: sampleCompany.id,
			area_id: upArea.id,
			subarea_id: upClarkSubarea.id,
			name: 'UP Clark',
			code: 'UPC',
			address: 'UP Clark',
		},
	})

	await prisma.location.create({
		data: {
			company_id: sampleCompany.id,
			area_id: dpwhArea.id,
			subarea_id: null,
			name: 'DPWH',
			code: 'DPWH',
			address: 'DPWH Intramuros',
		},
	})
	console.timeEnd('📍 Created locations...')

	console.time('⏰ Created shifts...')
	// Create Shifts
	await prisma.shift.create({
		data: {
			company_id: sampleCompany.id,
			code: 'DAY',
			name: 'DAY',
			start_time: '0600',
			end_time: '1800',
		},
	})

	await prisma.shift.create({
		data: {
			company_id: sampleCompany.id,
			code: 'NIGHT',
			name: 'NIGHT',
			start_time: '1800',
			end_time: '0600',
		},
	})
	console.timeEnd('⏰ Created shifts...')

	console.time('👮 Created positions...')
	// Create Positions
	await prisma.position.create({
		data: {
			company_id: sampleCompany.id,
			code: 'Guard',
			name: 'Guard',
		},
	})

	await prisma.position.create({
		data: {
			company_id: sampleCompany.id,
			code: 'Supervisor',
			name: 'Supervisor',
		},
	})
	console.timeEnd('👮 Created positions...')

	console.time('📅 Created pay periods...')
	// Create Pay Periods
	await prisma.payPeriod.create({
		data: {
			company_id: sampleCompany.id,
			code: 'September 1-15',
			year: 2025,
			month: 9,
			from: 1,
			to: 15,
			start_date: new Date('2025-09-01'),
			end_date: new Date('2025-09-15T23:59:59'),
			status: 'ACTIVE',
		},
	})

	await prisma.payPeriod.create({
		data: {
			company_id: sampleCompany.id,
			code: 'September 16-30',
			year: 2025,
			month: 9,
			from: 16,
			to: 30,
			start_date: new Date('2025-09-16'),
			end_date: new Date('2025-09-30T23:59:59'),
			status: 'ACTIVE',
		},
	})
	console.timeEnd('📅 Created pay periods...')

	// Add AllowanceType records
	console.time('💰 Created allowance types...')
	await prisma.allowanceType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'MEAL',
			name: 'Meal Allowance',
		},
	})
	await prisma.allowanceType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'TRANSPO',
			name: 'Transportation Allowance',
		},
	})
	await prisma.allowanceType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'COMM',
			name: 'Communication Allowance',
		},
	})
	console.timeEnd('💰 Created allowance types...')

	// Add DeductionType records
	console.time('💸 Created deduction types...')
	await prisma.deductionType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'LATE',
			name: 'Late Deduction',
		},
	})
	await prisma.deductionType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'ABSENT',
			name: 'Absence Deduction',
		},
	})
	await prisma.deductionType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'UNIFORM',
			name: 'Uniform Deduction',
		},
	})
	console.timeEnd('💸 Created deduction types...')

	// Add LoanType records
	console.time('💳 Created loan types...')
	await prisma.loanType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'SALARY',
			name: 'Salary Loan',
		},
	})
	await prisma.loanType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'EMERGENCY',
			name: 'Emergency Loan',
		},
	})
	await prisma.loanType.create({
		data: {
			company_id: sampleCompany.id,
			code: 'CASH_ADV',
			name: 'Cash Advance',
		},
	})
	console.timeEnd('💳 Created loan types...')

	// Add Guard records (sample guards for HR schema)
	console.time('👮 Created guards...')
	const guard1 = await prisma.guard.create({
		data: {
			company_id: sampleCompany.id,
			employee_no: 'G001',
			last_name: 'Santos',
			first_name: 'Juan',
			middle_name: 'Dela Cruz',
			hire_date: new Date('2023-01-15'),
			status: 'ACTIVE',
		},
	})
	const guard2 = await prisma.guard.create({
		data: {
			company_id: sampleCompany.id,
			employee_no: 'G002',
			last_name: 'Reyes',
			first_name: 'Maria',
			middle_name: 'Garcia',
			hire_date: new Date('2023-03-20'),
			status: 'ACTIVE',
		},
	})
	const guard3 = await prisma.guard.create({
		data: {
			company_id: sampleCompany.id,
			employee_no: 'G003',
			last_name: 'Cruz',
			first_name: 'Pedro',
			middle_name: null,
			hire_date: new Date('2023-06-01'),
			status: 'ACTIVE',
		},
	})
	console.timeEnd('👮 Created guards...')

	// NEW: Create corresponding Employee records for guards
	console.time('👥 Created employees from guards...')
	// Create employees from guards
	await prisma.employee.create({
		data: {
			id: guard1.id, // Use same ID for easier mapping
			company_id: guard1.company_id,
			employee_no: guard1.employee_no,
			employee_type: 'REGULAR',
			classification: 'GUARD',
			last_name: guard1.last_name,
			first_name: guard1.first_name,
			middle_name: guard1.middle_name,
			hire_date: guard1.hire_date || new Date('2023-01-15'),
			employment_status: 'ACTIVE',
			compensation_type: 'TIME_BASED',
			hourly_rate: 62.5, // Assuming minimum wage
			created_at: guard1.created_at,
			updated_at: guard1.updated_at,
		},
	})
	await prisma.employee.create({
		data: {
			id: guard2.id,
			company_id: guard2.company_id,
			employee_no: guard2.employee_no,
			employee_type: 'REGULAR',
			classification: 'GUARD',
			last_name: guard2.last_name,
			first_name: guard2.first_name,
			middle_name: guard2.middle_name,
			hire_date: guard2.hire_date || new Date('2023-03-20'),
			employment_status: 'ACTIVE',
			compensation_type: 'TIME_BASED',
			hourly_rate: 62.5,
			created_at: guard2.created_at,
			updated_at: guard2.updated_at,
		},
	})
	await prisma.employee.create({
		data: {
			id: guard3.id,
			company_id: guard3.company_id,
			employee_no: guard3.employee_no,
			employee_type: 'REGULAR',
			classification: 'GUARD',
			last_name: guard3.last_name,
			first_name: guard3.first_name,
			middle_name: guard3.middle_name,
			hire_date: guard3.hire_date || new Date('2023-06-01'),
			employment_status: 'ACTIVE',
			compensation_type: 'TIME_BASED',
			hourly_rate: 62.5,
			created_at: guard3.created_at,
			updated_at: guard3.updated_at,
		},
	})

	// NEW: Create non-guard employees
	await prisma.employee.create({
		data: {
			company_id: sampleCompany.id,
			employee_no: 'E001',
			employee_type: 'REGULAR',
			classification: 'ADMIN',
			last_name: 'Gonzales',
			first_name: 'Ana',
			middle_name: 'Luna',
			hire_date: new Date('2022-05-01'),
			employment_status: 'ACTIVE',
			compensation_type: 'FIXED_SALARY',
			base_salary: 35000.0,
		},
	})
	await prisma.employee.create({
		data: {
			company_id: sampleCompany.id,
			employee_no: 'E002',
			employee_type: 'CONTRACTUAL',
			classification: 'CONSULTANT',
			last_name: 'Mendoza',
			first_name: 'Roberto',
			middle_name: null,
			hire_date: new Date('2024-01-15'),
			employment_status: 'ACTIVE',
			compensation_type: 'PROJECT_BASED',
			daily_rate: 2500.0,
		},
	})
	await prisma.employee.create({
		data: {
			company_id: sampleCompany.id,
			employee_no: 'E003',
			employee_type: 'PART_TIME',
			classification: 'OFFICE_STAFF',
			last_name: 'Tan',
			first_name: 'Lisa',
			middle_name: 'Chen',
			hire_date: new Date('2024-06-01'),
			employment_status: 'ACTIVE',
			compensation_type: 'TIME_BASED',
			hourly_rate: 150.0,
		},
	})
	console.timeEnd('👥 Created employees from guards...')

	// NEW: Create Departments and Cost Centers
	console.time('🏢 Created departments and cost centers...')
	const hrDept = await prisma.department.create({
		data: {
			company_id: sampleCompany.id,
			code: 'HR',
			name: 'Human Resources',
		},
	})
	const opsDept = await prisma.department.create({
		data: {
			company_id: sampleCompany.id,
			code: 'OPS',
			name: 'Operations',
		},
	})
	const adminDept = await prisma.department.create({
		data: {
			company_id: sampleCompany.id,
			code: 'ADMIN',
			name: 'Administration',
		},
	})

	await prisma.costCenter.create({
		data: {
			company_id: sampleCompany.id,
			code: 'CC-OPS',
			name: 'Operations Cost Center',
			type: 'OPERATIONS',
		},
	})
	await prisma.costCenter.create({
		data: {
			company_id: sampleCompany.id,
			code: 'CC-ADMIN',
			name: 'Admin Cost Center',
			type: 'ADMIN',
		},
	})
	console.timeEnd('🏢 Created departments and cost centers...')

	// NEW: Create sample Employee benefits
	console.time('💼 Created employee benefits...')
	const employees = await prisma.employee.findMany({
		where: { company_id: sampleCompany.id },
	})
	const payPeriod = await prisma.payPeriod.findFirst({
		where: { company_id: sampleCompany.id },
	})

	if (employees.length > 0 && payPeriod) {
		// Add government contributions for all employees
		for (const emp of employees) {
			// SSS
			await prisma.employeeGovContribution.create({
				data: {
					company_id: sampleCompany.id,
					employee_id: emp.id,
					contribution_type: 'SSS',
					account_number: `SSS-${emp.employee_no}`,
					status: 'ACTIVE',
				},
			})
			// PhilHealth
			await prisma.employeeGovContribution.create({
				data: {
					company_id: sampleCompany.id,
					employee_id: emp.id,
					contribution_type: 'PHILHEALTH',
					account_number: `PH-${emp.employee_no}`,
					status: 'ACTIVE',
				},
			})
			// Pag-IBIG
			await prisma.employeeGovContribution.create({
				data: {
					company_id: sampleCompany.id,
					employee_id: emp.id,
					contribution_type: 'PAGIBIG',
					account_number: `HDMF-${emp.employee_no}`,
					status: 'ACTIVE',
				},
			})
			// TIN
			await prisma.employeeGovContribution.create({
				data: {
					company_id: sampleCompany.id,
					employee_id: emp.id,
					contribution_type: 'TIN',
					account_number: `000-000-00${emp.employee_no.slice(-1)}`,
					status: 'ACTIVE',
				},
			})
		}

		// Add sample allowances for some employees
		const allowanceType = await prisma.allowanceType.findFirst({
			where: { code: 'MEAL' },
		})
		if (allowanceType && employees[0]) {
			await prisma.employeeAllowance.create({
				data: {
					company_id: sampleCompany.id,
					employee_id: employees[0].id,
					allowance_type_id: allowanceType.id,
					amount: 100.0,
					frequency: 'PER_CUTOFF',
					taxable: false,
					start_pay_period_id: payPeriod.id,
					status: 'ACTIVE',
				},
			})
		}

		// Add sample loan for one employee
		const loanType = await prisma.loanType.findFirst({
			where: { code: 'SALARY' },
		})
		if (loanType && employees[1]) {
			await prisma.employeeLoan.create({
				data: {
					company_id: sampleCompany.id,
					employee_id: employees[1].id,
					loan_type_id: loanType.id,
					principal_amount: 10000.0,
					installment_count: 6,
					installment_amount: 1666.67,
					start_pay_period_id: payPeriod.id,
					status: 'ACTIVE',
				},
			})
		}
	}
	console.timeEnd('💼 Created employee benefits...')

	// Add WorkCalendarMonth records
	console.time('📆 Created work calendar months...')
	await prisma.workCalendarMonth.create({
		data: {
			company_id: sampleCompany.id,
			year: 2025,
			month: 1,
			working_days: 22,
			hours_per_day: 8,
			notes: 'January 2025',
		},
	})
	await prisma.workCalendarMonth.create({
		data: {
			company_id: sampleCompany.id,
			year: 2025,
			month: 2,
			working_days: 20,
			hours_per_day: 8,
			notes: 'February 2025',
		},
	})
	await prisma.workCalendarMonth.create({
		data: {
			company_id: sampleCompany.id,
			year: 2025,
			month: 3,
			working_days: 21,
			hours_per_day: 8,
			notes: 'March 2025',
		},
	})
	console.timeEnd('📆 Created work calendar months...')

	// Add WorkSchedule records (sample schedules)
	console.time('📋 Created work schedules...')
	const guards = await prisma.guard.findMany({
		where: { company_id: sampleCompany.id },
		select: { id: true },
	})
	const locations = await prisma.location.findMany({
		where: { company_id: sampleCompany.id },
		select: { id: true },
	})
	const positions = await prisma.position.findMany({
		where: { company_id: sampleCompany.id },
		select: { id: true },
	})
	const shifts = await prisma.shift.findMany({
		where: { company_id: sampleCompany.id },
		select: { id: true },
	})
	const payPeriods = await prisma.payPeriod.findMany({
		where: { company_id: sampleCompany.id },
		select: { id: true },
	})

	// Create sample work schedules for the first pay period
	if (
		guards.length > 0 &&
		locations.length > 0 &&
		positions.length > 0 &&
		shifts.length > 0 &&
		payPeriods.length > 0
	) {
		await prisma.workSchedule.create({
			data: {
				company_id: sampleCompany.id,
				pay_period_id: payPeriods[0].id,
				date: new Date('2025-09-01'),
				location_id: locations[0].id,
				position_id: positions[0].id,
				shift_id: shifts[0].id,
				guard_id: guards[0].id,
				status: 'SCHEDULED',
			},
		})
		await prisma.workSchedule.create({
			data: {
				company_id: sampleCompany.id,
				pay_period_id: payPeriods[0].id,
				date: new Date('2025-09-02'),
				location_id: locations[1].id,
				position_id: positions[0].id,
				shift_id: shifts[1].id,
				guard_id: guards[1].id,
				status: 'SCHEDULED',
			},
		})
	}
	console.timeEnd('📋 Created work schedules...')

	// Add Government Tables seed data
	console.time('🏛️ Created government tables...')

	// SSS Table (2025 rates)
	await prisma.govTableSSS.create({
		data: {
			ord: 1,
			range1: 0,
			range2: 4249.99,
			msc: 4000,
			rate: 0.145,
			employerContrib: 380,
			employeeContrib: 200,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableSSS.create({
		data: {
			ord: 2,
			range1: 4250,
			range2: 4749.99,
			msc: 4500,
			rate: 0.145,
			employerContrib: 427.5,
			employeeContrib: 225,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableSSS.create({
		data: {
			ord: 3,
			range1: 4750,
			range2: 5249.99,
			msc: 5000,
			rate: 0.145,
			employerContrib: 475,
			employeeContrib: 250,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})

	// PhilHealth Table (2025 rates)
	await prisma.govTablePhilHealth.create({
		data: {
			ord: 1,
			min: 0,
			max: 10000,
			rate: 0.05,
			employerContrib: 250,
			employeeContrib: 250,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTablePhilHealth.create({
		data: {
			ord: 2,
			min: 10000.01,
			max: 99999.99,
			rate: 0.05,
			employerContrib: 2500,
			employeeContrib: 2500,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})

	// HDMF/Pag-IBIG Table (2025 rates)
	await prisma.govTableHDMF.create({
		data: {
			ord: 1,
			min: 0,
			max: 1500,
			reference: 1500,
			employerRate: 0.02,
			employeeRate: 0.01,
			employerContrib: 30,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableHDMF.create({
		data: {
			ord: 2,
			min: 1500.01,
			max: 5000,
			reference: 5000,
			employerRate: 0.02,
			employeeRate: 0.02,
			employerContrib: 100,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})

	// BIR Tax Table (2025 rates - Monthly)
	await prisma.govTableBIR.create({
		data: {
			bracket: 1,
			min: 0,
			max: 20833,
			fixedTax: 0,
			rateOnExcess: 0,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableBIR.create({
		data: {
			bracket: 2,
			min: 20833.01,
			max: 33332,
			fixedTax: 0,
			rateOnExcess: 0.15,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableBIR.create({
		data: {
			bracket: 3,
			min: 33332.01,
			max: 66666,
			fixedTax: 1875,
			rateOnExcess: 0.2,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableBIR.create({
		data: {
			bracket: 4,
			min: 66666.01,
			max: 166666,
			fixedTax: 8541.8,
			rateOnExcess: 0.25,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableBIR.create({
		data: {
			bracket: 5,
			min: 166666.01,
			max: 666666,
			fixedTax: 33541.8,
			rateOnExcess: 0.3,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})
	await prisma.govTableBIR.create({
		data: {
			bracket: 6,
			min: 666666.01,
			max: 999999999,
			fixedTax: 183541.8,
			rateOnExcess: 0.35,
			effective_from: new Date('2025-01-01'),
			effective_to: null,
		},
	})

	console.timeEnd('🏛️ Created government tables...')

	console.time('🔐 Created permissions...')
	const entities = ['user', 'note']
	const actions = ['create', 'read', 'update', 'delete']
	const accesses = ['own', 'any'] as const

	for (const entity of entities) {
		for (const action of actions) {
			for (const access of accesses) {
				await prisma.permission.create({
					data: { entity, action, access },
				})
			}
		}
	}
	console.timeEnd('🔐 Created permissions...')

	console.time('👑 Created roles...')
	await prisma.role.create({
		data: {
			code: 'admin',
			name: 'Administrator',
			description: 'Full system access',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: 'any' },
				}),
			},
		},
	})

	await prisma.role.create({
		data: {
			code: 'user',
			name: 'Regular User',
			description: 'Standard user access',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: 'own' },
				}),
			},
		},
	})
	console.timeEnd('👑 Created roles...')

	const totalUsers = 5
	console.time(`👤 Created ${totalUsers} users...`)
	const noteImages = await getNoteImages()
	const userImages = await getUserImages()

	for (let index = 0; index < totalUsers; index++) {
		const userData = createUser()
		const passwordHash = await createPassword(userData.username)
		const user = await prisma.user.create({
			select: { id: true },
			data: {
				...userData,
				company_id: 'default-company',
				display_name: userData.name || userData.username,
				password_hash: passwordHash.hash,
				is_active: true,
				password: { create: passwordHash },
				roles: { connect: { code: 'user' } },
			},
		})

		// Upload user profile image
		const userImage = userImages[index % userImages.length]
		if (userImage) {
			await prisma.userImage.create({
				data: {
					userId: user.id,
					objectKey: userImage.objectKey,
				},
			})
		}

		// Create notes with images
		const notesCount = faker.number.int({ min: 1, max: 3 })
		for (let noteIndex = 0; noteIndex < notesCount; noteIndex++) {
			const note = await prisma.note.create({
				select: { id: true },
				data: {
					title: faker.lorem.sentence(),
					content: faker.lorem.paragraphs(),
					ownerId: user.id,
				},
			})

			// Add images to note
			const noteImageCount = faker.number.int({ min: 1, max: 3 })
			for (let imageIndex = 0; imageIndex < noteImageCount; imageIndex++) {
				const imgNumber = faker.number.int({ min: 0, max: 9 })
				const noteImage = noteImages[imgNumber]
				if (noteImage) {
					await prisma.noteImage.create({
						data: {
							noteId: note.id,
							altText: noteImage.altText,
							objectKey: noteImage.objectKey,
						},
					})
				}
			}
		}
	}
	console.timeEnd(`👤 Created ${totalUsers} users...`)

	console.time(`🐨 Created admin user "kody"`)

	const kodyImages = {
		kodyUser: { objectKey: 'user/kody.png' },
		cuteKoala: {
			altText: 'an adorable koala cartoon illustration',
			objectKey: 'kody-notes/cute-koala.png',
		},
		koalaEating: {
			altText: 'a cartoon illustration of a koala in a tree eating',
			objectKey: 'kody-notes/koala-eating.png',
		},
		koalaCuddle: {
			altText: 'a cartoon illustration of koalas cuddling',
			objectKey: 'kody-notes/koala-cuddle.png',
		},
		mountain: {
			altText: 'a beautiful mountain covered in snow',
			objectKey: 'kody-notes/mountain.png',
		},
		koalaCoder: {
			altText: 'a koala coding at the computer',
			objectKey: 'kody-notes/koala-coder.png',
		},
		koalaMentor: {
			altText:
				'a koala in a friendly and helpful posture. The Koala is standing next to and teaching a woman who is coding on a computer and shows positive signs of learning and understanding what is being explained.',
			objectKey: 'kody-notes/koala-mentor.png',
		},
		koalaSoccer: {
			altText: 'a cute cartoon koala kicking a soccer ball on a soccer field ',
			objectKey: 'kody-notes/koala-soccer.png',
		},
	}

	const githubUser = await insertGitHubUser(MOCK_CODE_GITHUB)

	const kodyPassword = await createPassword('kodylovesyou')
	const kody = await prisma.user.create({
		select: { id: true },
		data: {
			email: 'kody@kcd.dev',
			username: 'kody',
			name: 'Kody',
			company_id: 'default-company',
			display_name: 'Kody the Koala',
			password_hash: kodyPassword.hash,
			is_active: true,
			password: { create: kodyPassword },
			connections: {
				create: {
					providerName: 'github',
					providerId: String(githubUser.profile.id),
				},
			},
			roles: { connect: [{ code: 'admin' }, { code: 'user' }] },
		},
	})

	// Delete existing user images for Kody and create new one
	await prisma.userImage.deleteMany({
		where: { userId: kody.id },
	})

	await prisma.userImage.create({
		data: {
			userId: kody.id,
			objectKey: kodyImages.kodyUser.objectKey,
		},
	})

	// Create Kody's notes
	const kodyNotes = [
		{
			id: 'd27a197e',
			title: 'Basic Koala Facts',
			content:
				'Koalas are found in the eucalyptus forests of eastern Australia. They have grey fur with a cream-coloured chest, and strong, clawed feet, perfect for living in the branches of trees!',
			images: [kodyImages.cuteKoala, kodyImages.koalaEating],
		},
		{
			id: '414f0c09',
			title: 'Koalas like to cuddle',
			content:
				'Cuddly critters, koalas measure about 60cm to 85cm long, and weigh about 14kg.',
			images: [kodyImages.koalaCuddle],
		},
		{
			id: '260366b1',
			title: 'Not bears',
			content:
				"Although you may have heard people call them koala 'bears', these awesome animals aren't bears at all – they are in fact marsupials. A group of mammals, most marsupials have pouches where their newborns develop.",
			images: [],
		},
		{
			id: 'bb79cf45',
			title: 'Snowboarding Adventure',
			content:
				"Today was an epic day on the slopes! Shredded fresh powder with my friends, caught some sick air, and even attempted a backflip. Can't wait for the next snowy adventure!",
			images: [kodyImages.mountain],
		},
		{
			id: '9f4308be',
			title: 'Onewheel Tricks',
			content:
				"Mastered a new trick on my Onewheel today called '180 Spin'. It's exhilarating to carve through the streets while pulling off these rad moves. Time to level up and learn more!",
			images: [],
		},
		{
			id: '306021fb',
			title: 'Coding Dilemma',
			content:
				"Stuck on a bug in my latest coding project. Need to figure out why my function isn't returning the expected output. Time to dig deep, debug, and conquer this challenge!",
			images: [kodyImages.koalaCoder],
		},
		{
			id: '16d4912a',
			title: 'Coding Mentorship',
			content:
				"Had a fantastic coding mentoring session today with Sarah. Helped her understand the concept of recursion, and she made great progress. It's incredibly fulfilling to help others improve their coding skills.",
			images: [kodyImages.koalaMentor],
		},
		{
			id: '3199199e',
			title: 'Koala Fun Facts',
			content:
				"Did you know that koalas sleep for up to 20 hours a day? It's because their diet of eucalyptus leaves doesn't provide much energy. But when I'm awake, I enjoy munching on leaves, chilling in trees, and being the cuddliest koala around!",
			images: [],
		},
		{
			id: '2030ffd3',
			title: 'Skiing Adventure',
			content:
				'Spent the day hitting the slopes on my skis. The fresh powder made for some incredible runs and breathtaking views. Skiing down the mountain at top speed is an adrenaline rush like no other!',
			images: [kodyImages.mountain],
		},
		{
			id: 'f375a804',
			title: 'Code Jam Success',
			content:
				'Participated in a coding competition today and secured the first place! The adrenaline, the challenging problems, and the satisfaction of finding optimal solutions—it was an amazing experience. Feeling proud and motivated to keep pushing my coding skills further!',
			images: [kodyImages.koalaCoder],
		},
		{
			id: '562c541b',
			title: 'Koala Conservation Efforts',
			content:
				"Joined a local conservation group to protect koalas and their habitats. Together, we're planting more eucalyptus trees, raising awareness about their endangered status, and working towards a sustainable future for these adorable creatures. Every small step counts!",
			images: [],
		},
		{
			id: 'f67ca40b',
			title: 'Game day',
			content:
				"Just got back from the most amazing game. I've been playing soccer for a long time, but I've not once scored a goal. Well, today all that changed! I finally scored my first ever goal.\n\nI'm in an indoor league, and my team's not the best, but we're pretty good and I have fun, that's all that really matters. Anyway, I found myself at the other end of the field with the ball. It was just me and the goalie. I normally just kick the ball and hope it goes in, but the ball was already rolling toward the goal. The goalie was about to get the ball, so I had to charge. I managed to get possession of the ball just before the goalie got it. I brought it around the goalie and had a perfect shot. I screamed so loud in excitement. After all these years playing, I finally scored a goal!\n\nI know it's not a lot for most folks, but it meant a lot to me. We did end up winning the game by one. It makes me feel great that I had a part to play in that.\n\nIn this team, I'm the captain. I'm constantly cheering my team on. Even after getting injured, I continued to come and watch from the side-lines. I enjoy yelling (encouragingly) at my team mates and helping them be the best they can. I'm definitely not the best player by a long stretch. But I really enjoy the game. It's a great way to get exercise and have good social interactions once a week.\n\nThat said, it can be hard to keep people coming and paying dues and stuff. If people don't show up it can be really hard to find subs. I have a list of people I can text, but sometimes I can't find anyone.\n\nBut yeah, today was awesome. I felt like more than just a player that gets in the way of the opposition, but an actual asset to the team. Really great feeling.\n\nAnyway, I'm rambling at this point and really this is just so we can have a note that's pretty long to test things out. I think it's long enough now... Cheers!",
			images: [kodyImages.koalaSoccer],
		},
	]

	for (const noteData of kodyNotes) {
		// Delete existing note images first if note exists
		await prisma.noteImage.deleteMany({
			where: { noteId: noteData.id },
		})

		const note = await prisma.note.create({
			select: { id: true },
			data: {
				id: noteData.id,
				title: noteData.title,
				content: noteData.content,
				ownerId: kody.id,
			},
		})

		for (const image of noteData.images) {
			await prisma.noteImage.create({
				data: {
					noteId: note.id,
					altText: image.altText,
					objectKey: image.objectKey,
				},
			})
		}
	}

	console.timeEnd(`🐨 Created admin user "kody"`)

	console.time(`🦘 Created admin user "joey"`)

	const joeyPassword = await createPassword('joeylovesyou')
	const joey = await prisma.user.create({
		select: { id: true },
		data: {
			email: 'joey@example.com',
			username: 'joey',
			name: 'Joey',
			company_id: 'default-company',
			display_name: 'Joey the Admin',
			password_hash: joeyPassword.hash,
			is_active: true,
			password: { create: joeyPassword },
			roles: { connect: [{ code: 'admin' }, { code: 'user' }] },
		},
	})

	console.timeEnd(`🦘 Created admin user "joey"`)

	console.time(`📁 Created projects`)

	// Create some projects in the admin schema
	const projects = [
		{
			name: 'Website Redesign',
			description:
				'Complete overhaul of the company website with modern UI/UX design',
		},
		{
			name: 'Mobile App Development',
			description: 'Native mobile application for iOS and Android platforms',
		},
		{
			name: 'Data Migration Project',
			description: 'Migrate legacy database to new cloud-based infrastructure',
		},
		{
			name: 'Security Audit',
			description:
				'Comprehensive security assessment and vulnerability testing',
		},
		{
			name: 'API Integration',
			description:
				'Integrate third-party APIs for payment processing and analytics',
		},
	]

	for (const projectData of projects) {
		await prisma.project.create({
			data: projectData,
		})
	}

	console.timeEnd(`📁 Created projects`)

	console.time(`📊 Created timesheet records and DTRs`)

	// Helper function to generate DTR dates for a pay period
	function getPayPeriodDates(payPeriod: string): Date[] {
		const dates: Date[] = []
		const year = new Date().getFullYear()

		if (payPeriod === 'January 1 to 15') {
			for (let day = 1; day <= 15; day++) {
				// Skip weekends (simplified - just skip day 6, 7, 13, 14)
				if (![6, 7, 13, 14].includes(day)) {
					dates.push(new Date(year, 0, day))
				}
			}
		} else if (payPeriod === 'January 16 to 31') {
			for (let day = 16; day <= 31; day++) {
				// Skip weekends (simplified - just skip day 20, 21, 27, 28)
				if (![20, 21, 27, 28].includes(day)) {
					dates.push(new Date(year, 0, day))
				}
			}
		}

		return dates
	}

	const timesheetData = [
		{
			employeeName: 'Dela Cruz, Juan',
			payPeriod: 'January 1 to 15',
			detachment: 'Diliman',
			shift: 'Day Shift',
			hasOvertime: true,
			nightDiff: false,
		},
		{
			employeeName: 'Santos, Maria',
			payPeriod: 'January 1 to 15',
			detachment: 'Makati',
			shift: 'Night Shift',
			hasOvertime: true,
			nightDiff: true,
		},
		{
			employeeName: 'Reyes, Pedro',
			payPeriod: 'January 1 to 15',
			detachment: 'Diliman',
			shift: 'Day Shift',
			hasOvertime: false,
			nightDiff: false,
		},
		{
			employeeName: 'Garcia, Ana',
			payPeriod: 'January 1 to 15',
			detachment: 'Quezon City',
			shift: 'Mid Shift',
			hasOvertime: true,
			nightDiff: true,
		},
		{
			employeeName: 'Bautista, Carlos',
			payPeriod: 'January 16 to 31',
			detachment: 'Diliman',
			shift: 'Day Shift',
			hasOvertime: true,
			nightDiff: false,
		},
		{
			employeeName: 'Lopez, Elena',
			payPeriod: 'January 16 to 31',
			detachment: 'Pasig',
			shift: 'Night Shift',
			hasOvertime: true,
			nightDiff: true,
		},
	]

	for (const data of timesheetData) {
		const dates = getPayPeriodDates(data.payPeriod)
		const dtrs = []
		let totalRegular = 0
		let totalOvertime = 0
		let totalNightDiff = 0

		// Create DTR records for each working day
		for (const date of dates) {
			const regularHours = 8
			// Add overtime for some days if employee has overtime
			const overtimeHours = data.hasOvertime && Math.random() > 0.7 ? 4 : 0
			// Add night differential if night shift
			const nightDifferential = data.nightDiff ? regularHours * 0.1 : 0

			totalRegular += regularHours
			totalOvertime += overtimeHours
			totalNightDiff += nightDifferential

			// Generate time-in and time-out based on shift
			let timeInHour = 6 // Default for day shift
			let timeOutHour = 18 // 6 PM for day shift (with regular 8 hours + overtime)

			if (data.shift === 'Night Shift') {
				timeInHour = 22 // 10 PM
				timeOutHour = 6 // 6 AM next day
			} else if (data.shift === 'Mid Shift') {
				timeInHour = 14 // 2 PM
				timeOutHour = 22 // 10 PM
			}

			// Add random seconds for variation
			const timeInMinutes = Math.floor(Math.random() * 5) - 2 // -2 to +2 minutes
			const timeInSeconds = Math.floor(Math.random() * 60)
			const timeOutMinutes = Math.floor(Math.random() * 5) - 2 // -2 to +2 minutes
			const timeOutSeconds = Math.floor(Math.random() * 60)

			// Create time-in timestamp
			const timeIn = new Date(date)
			timeIn.setHours(timeInHour, timeInMinutes, timeInSeconds)

			// Create time-out timestamp
			const timeOut = new Date(date)
			if (data.shift === 'Night Shift' && timeOutHour < timeInHour) {
				// Night shift ends next day
				timeOut.setDate(timeOut.getDate() + 1)
			}
			timeOut.setHours(
				timeOutHour + (overtimeHours > 0 ? 4 : 0),
				timeOutMinutes,
				timeOutSeconds,
			)

			// Create timelogs with clock events for this DTR
			const timelogs = [
				{
					mode: 'in',
					timestamp: timeIn,
					clockEvents: {
						create: [
							{
								clockTime: timeIn, // Clock event has same time as timelog
							},
						],
					},
				},
				{
					mode: 'out',
					timestamp: timeOut,
					clockEvents: {
						create: [
							{
								clockTime: timeOut, // Clock event has same time as timelog
							},
						],
					},
				},
			]

			dtrs.push({
				date,
				regularHours,
				overtimeHours,
				nightDifferential,
				timelogs: {
					create: timelogs,
				},
			})
		}

		// Create timesheet with calculated totals and related DTRs
		await prisma.timesheet_.create({
			data: {
				employeeName: data.employeeName,
				payPeriod: data.payPeriod,
				detachment: data.detachment,
				shift: data.shift,
				regularHours: totalRegular,
				overtimeHours: totalOvertime,
				nightDifferential: totalNightDiff,
				dtrs: {
					create: dtrs,
				},
			},
		})
	}
	console.timeEnd(`📊 Created timesheet records and DTRs`)

	// Populate EmployeeTimesheet from Guard Timesheet data
	console.time('👥 Created EmployeeTimesheet records from Guard data...')

	// Get all active pay periods
	const activePeriods = await prisma.payPeriod.findMany({
		where: { status: 'ACTIVE' },
	})

	// Create EmployeeTimesheet for each guard in each pay period
	const activeGuards = await prisma.guard.findMany({
		where: { status: 'ACTIVE' },
	})

	for (const guard of activeGuards) {
		for (const period of activePeriods) {
			// Check if guard has a Timesheet for this period
			const guardTimesheet = await prisma.timesheet.findUnique({
				where: {
					company_id_pay_period_id_guard_id: {
						company_id: guard.company_id,
						pay_period_id: period.id,
						guard_id: guard.id,
					},
				},
			})

			// Create EmployeeTimesheet record
			await prisma.employeeTimesheet.upsert({
				where: {
					company_id_pay_period_id_employee_id: {
						company_id: guard.company_id,
						pay_period_id: period.id,
						employee_id: guard.id, // Using guard.id as employee_id
					},
				},
				update: {
					// Update if exists
					tracking_method: 'TIME_LOG',
					dtr_ids: guardTimesheet?.dtr_ids || [],
					total_hours_regular: guardTimesheet?.total_hours_8h || 0,
					total_hours_ot: guardTimesheet?.total_hours_ot || 0,
					total_hours_night: guardTimesheet?.total_hours_night || 0,
					status: guardTimesheet?.status || 'DRAFT',
				},
				create: {
					company_id: guard.company_id,
					pay_period_id: period.id,
					employee_id: guard.id,
					tracking_method: 'TIME_LOG',
					dtr_ids: guardTimesheet?.dtr_ids || [],
					total_hours_regular: guardTimesheet?.total_hours_8h || 0,
					total_hours_ot: guardTimesheet?.total_hours_ot || 0,
					total_hours_night: guardTimesheet?.total_hours_night || 0,
					status: guardTimesheet?.status || 'DRAFT',
				},
			})
		}
	}

	// Create EmployeeTimesheet for non-guard employees
	const nonGuardEmployees = await prisma.employee.findMany({
		where: {
			classification: { not: 'GUARD' },
			employment_status: 'ACTIVE',
		},
	})

	for (const employee of nonGuardEmployees) {
		for (const period of activePeriods) {
			const trackingMethod =
				employee.compensation_type === 'TIME_BASED' ? 'TIME_LOG' : 'FIXED_HOURS'

			await prisma.employeeTimesheet.upsert({
				where: {
					company_id_pay_period_id_employee_id: {
						company_id: employee.company_id,
						pay_period_id: period.id,
						employee_id: employee.id,
					},
				},
				update: {},
				create: {
					company_id: employee.company_id,
					pay_period_id: period.id,
					employee_id: employee.id,
					tracking_method: trackingMethod,
					dtr_ids: [],
					// For fixed salary employees, track days instead of hours
					days_worked: trackingMethod === 'FIXED_HOURS' ? 10 : null,
					days_absent: 0,
					days_leave: 0,
					// Time-based fields for TIME_LOG employees
					total_hours_regular: trackingMethod === 'TIME_LOG' ? 0 : null,
					total_hours_ot: trackingMethod === 'TIME_LOG' ? 0 : null,
					status: 'DRAFT',
				},
			})
		}
	}

	const employeeTimesheetCount = await prisma.employeeTimesheet.count()
	console.log(`Created ${employeeTimesheetCount} EmployeeTimesheet records`)
	console.timeEnd('👥 Created EmployeeTimesheet records from Guard data...')

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

// we're ok to import from the test directory in this file
/*
eslint
	no-restricted-imports: "off",
*/
