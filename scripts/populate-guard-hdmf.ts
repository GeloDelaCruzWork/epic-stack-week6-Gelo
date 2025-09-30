import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Starting to populate GuardHDMFSchedule...')

	// First, let's find the guard with employee_no G001
	const guard = await prisma.guard.findFirst({
		where: {
			employee_no: 'G001',
		},
	})

	if (!guard) {
		console.error('Guard with employee_no G001 not found!')
		console.log('Creating guard G001...')

		// Create a sample guard
		const newGuard = await prisma.guard.create({
			data: {
				company_id: 'default-company',
				employee_no: 'G001',
				first_name: 'Juan',
				last_name: 'Dela Cruz',
				middle_name: 'Santos',
				status: 'ACTIVE',
				hire_date: new Date('2024-01-01'),
			},
		})
		console.log('Created guard:', newGuard)
	}

	// Find or create the pay period 2025-09.A
	const payPeriod = await prisma.payPeriod.findFirst({
		where: {
			code: '2025-09.A',
		},
	})

	if (!payPeriod) {
		console.error('Pay period 2025-09.A not found!')
		console.log('Creating pay period 2025-09.A...')

		const newPayPeriod = await prisma.payPeriod.create({
			data: {
				company_id: guard?.company_id || 'default-company',
				code: '2025-09.A',
				year: 2025,
				month: 9,
				from: 1,
				to: 15,
				start_date: new Date('2025-09-01'),
				end_date: new Date('2025-09-15'),
				status: 'ACTIVE',
			},
		})
		console.log('Created pay period:', newPayPeriod)
	}

	// Get the final guard and pay period IDs
	const finalGuard =
		guard ||
		(await prisma.guard.findFirst({
			where: { employee_no: 'G001' },
		}))

	const finalPayPeriod =
		payPeriod ||
		(await prisma.payPeriod.findFirst({
			where: { code: '2025-09.A' },
		}))

	if (!finalGuard || !finalPayPeriod) {
		console.error('Could not find or create required entities')
		return
	}

	// Check if GuardHDMFSchedule already exists
	const existingSchedule = await prisma.guardHDMFSchedule.findUnique({
		where: {
			company_id_guard_id_pay_period_id: {
				company_id: finalGuard.company_id,
				guard_id: finalGuard.id,
				pay_period_id: finalPayPeriod.id,
			},
		},
	})

	if (existingSchedule) {
		console.log('GuardHDMFSchedule already exists:', existingSchedule)
		return
	}

	// Create the GuardHDMFSchedule entry
	const hdmfSchedule = await prisma.guardHDMFSchedule.create({
		data: {
			company_id: finalGuard.company_id,
			guard_id: finalGuard.id,
			pay_period_id: finalPayPeriod.id,
			base_amount: 5000.0, // Example base amount
			ee_amount: 100.0, // Employee contribution (2% of 5000)
			er_amount: 100.0, // Employer contribution (2% of 5000)
			status: 'PENDING',
			created_at: new Date(),
			updated_at: new Date(),
		},
	})

	console.log('Successfully created GuardHDMFSchedule:', hdmfSchedule)

	// Let's also display all the data
	console.log('\nSummary:')
	console.log('Guard:', {
		id: finalGuard.id,
		employee_no: finalGuard.employee_no,
		name: `${finalGuard.last_name}, ${finalGuard.first_name}`,
	})
	console.log('Pay Period:', {
		id: finalPayPeriod.id,
		code: finalPayPeriod.code,
		period: `${finalPayPeriod.year}-${String(finalPayPeriod.month).padStart(2, '0')} (${finalPayPeriod.from}-${finalPayPeriod.to})`,
	})
	console.log('HDMF Schedule:', {
		base_amount: hdmfSchedule.base_amount,
		ee_amount: hdmfSchedule.ee_amount,
		er_amount: hdmfSchedule.er_amount,
		status: hdmfSchedule.status,
	})
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
