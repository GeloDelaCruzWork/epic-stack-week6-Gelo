import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Creating additional HDMF-related data...')

	// Get the existing guard and pay period
	const guard = await prisma.guard.findFirst({
		where: { employee_no: 'G001' },
	})

	const payPeriod = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.A' },
	})

	if (!guard || !payPeriod) {
		console.error('Required entities not found')
		return
	}

	// Create GuardHDMF record (the main HDMF registration)
	const existingHDMF = await prisma.guardHDMF.findFirst({
		where: {
			guard_id: guard.id,
			company_id: guard.company_id,
		},
	})

	let guardHDMF = existingHDMF
	if (!existingHDMF) {
		guardHDMF = await prisma.guardHDMF.create({
			data: {
				company_id: guard.company_id,
				guard_id: guard.id,
				hdmf_no: '1234-5678-9012', // Sample HDMF number
				status: 'ACTIVE',
			},
		})
		console.log('Created GuardHDMF record:', guardHDMF)
	} else {
		console.log('GuardHDMF already exists:', existingHDMF)
	}

	// Create pay period 2025-09.B (second half of September)
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (!payPeriodB) {
		const newPayPeriodB = await prisma.payPeriod.create({
			data: {
				company_id: guard.company_id,
				code: '2025-09.B',
				year: 2025,
				month: 9,
				from: 16,
				to: 30,
				start_date: new Date('2025-09-16'),
				end_date: new Date('2025-09-30'),
				status: 'ACTIVE',
			},
		})
		console.log('Created pay period 2025-09.B:', newPayPeriodB)

		// Create HDMF schedule for period B
		const scheduleB = await prisma.guardHDMFSchedule.create({
			data: {
				company_id: guard.company_id,
				guard_id: guard.id,
				pay_period_id: newPayPeriodB.id,
				base_amount: 5500.0, // Slightly higher base
				ee_amount: 110.0, // 2% of 5500
				er_amount: 110.0, // 2% of 5500
				status: 'PENDING',
			},
		})
		console.log('Created HDMF Schedule for 2025-09.B:', scheduleB)
	}

	// Create additional guards and their HDMF schedules
	const guards = [
		{
			employee_no: 'G002',
			first_name: 'Maria',
			last_name: 'Garcia',
			base_amount: 4500,
		},
		{
			employee_no: 'G003',
			first_name: 'Pedro',
			last_name: 'Reyes',
			base_amount: 6000,
		},
		{
			employee_no: 'G004',
			first_name: 'Ana',
			last_name: 'Lopez',
			base_amount: 5200,
		},
	]

	for (const guardData of guards) {
		let existingGuard = await prisma.guard.findFirst({
			where: { employee_no: guardData.employee_no },
		})

		if (!existingGuard) {
			existingGuard = await prisma.guard.create({
				data: {
					company_id: guard.company_id,
					employee_no: guardData.employee_no,
					first_name: guardData.first_name,
					last_name: guardData.last_name,
					status: 'ACTIVE',
					hire_date: new Date('2024-01-01'),
				},
			})
			console.log(`Created guard ${guardData.employee_no}`)
		}

		// Check if schedule already exists
		const existingSchedule = await prisma.guardHDMFSchedule.findUnique({
			where: {
				company_id_guard_id_pay_period_id: {
					company_id: guard.company_id,
					guard_id: existingGuard.id,
					pay_period_id: payPeriod.id,
				},
			},
		})

		if (!existingSchedule) {
			// Create HDMF schedule for this guard
			const schedule = await prisma.guardHDMFSchedule.create({
				data: {
					company_id: guard.company_id,
					guard_id: existingGuard.id,
					pay_period_id: payPeriod.id,
					base_amount: guardData.base_amount,
					ee_amount: guardData.base_amount * 0.02, // 2% employee contribution
					er_amount: guardData.base_amount * 0.02, // 2% employer contribution
					status: 'PENDING',
				},
			})
			console.log(
				`Created HDMF Schedule for ${guardData.employee_no}:`,
				schedule,
			)
		}
	}

	// Display summary
	const allSchedules = await prisma.guardHDMFSchedule.findMany({
		where: {
			pay_period_id: payPeriod.id,
		},
	})

	console.log('\n=== Summary of HDMF Schedules for Pay Period 2025-09.A ===')
	console.log(`Total schedules created: ${allSchedules.length}`)

	const totalEE = allSchedules.reduce((sum, s) => sum + Number(s.ee_amount), 0)
	const totalER = allSchedules.reduce((sum, s) => sum + Number(s.er_amount), 0)

	console.log(`Total Employee Contributions: ₱${totalEE.toFixed(2)}`)
	console.log(`Total Employer Contributions: ₱${totalER.toFixed(2)}`)
	console.log(
		`Grand Total HDMF Contributions: ₱${(totalEE + totalER).toFixed(2)}`,
	)
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
