import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Populating SSS Tables with 2025 rates...')

	// Clear existing GovTableSSS entries for 2025
	await prisma.govTableSSS.deleteMany({
		where: {
			effective_from: {
				gte: new Date('2025-01-01'),
			},
		},
	})

	// SSS Contribution Table 2025
	// Based on 15% total contribution (5% EE, 10% ER)
	// EC (Employees' Compensation) is ₱30 added to ER
	const sssTable2025 = [
		{ ord: 1, range1: 0, range2: 4999.99, msc: 5000 },
		{ ord: 2, range1: 5000, range2: 5499.99, msc: 5500 },
		{ ord: 3, range1: 5500, range2: 5999.99, msc: 6000 },
		{ ord: 4, range1: 6000, range2: 6499.99, msc: 6500 },
		{ ord: 5, range1: 6500, range2: 6999.99, msc: 7000 },
		{ ord: 6, range1: 7000, range2: 7499.99, msc: 7500 },
		{ ord: 7, range1: 7500, range2: 7999.99, msc: 8000 },
		{ ord: 8, range1: 8000, range2: 8499.99, msc: 8500 },
		{ ord: 9, range1: 8500, range2: 8999.99, msc: 9000 },
		{ ord: 10, range1: 9000, range2: 9499.99, msc: 9500 },
		{ ord: 11, range1: 9500, range2: 9999.99, msc: 10000 },
		{ ord: 12, range1: 10000, range2: 10499.99, msc: 10500 },
		{ ord: 13, range1: 10500, range2: 10999.99, msc: 11000 },
		{ ord: 14, range1: 11000, range2: 11499.99, msc: 11500 },
		{ ord: 15, range1: 11500, range2: 11999.99, msc: 12000 },
		{ ord: 16, range1: 12000, range2: 12499.99, msc: 12500 },
		{ ord: 17, range1: 12500, range2: 12999.99, msc: 13000 },
		{ ord: 18, range1: 13000, range2: 13499.99, msc: 13500 },
		{ ord: 19, range1: 13500, range2: 13999.99, msc: 14000 },
		{ ord: 20, range1: 14000, range2: 14499.99, msc: 14500 },
		{ ord: 21, range1: 14500, range2: 14999.99, msc: 15000 },
		{ ord: 22, range1: 15000, range2: 15999.99, msc: 16000 },
		{ ord: 23, range1: 16000, range2: 16999.99, msc: 17000 },
		{ ord: 24, range1: 17000, range2: 17999.99, msc: 18000 },
		{ ord: 25, range1: 18000, range2: 18999.99, msc: 19000 },
		{ ord: 26, range1: 19000, range2: 19999.99, msc: 20000 },
		{ ord: 27, range1: 20000, range2: 20999.99, msc: 21000 },
		{ ord: 28, range1: 21000, range2: 21999.99, msc: 22000 },
		{ ord: 29, range1: 22000, range2: 22999.99, msc: 23000 },
		{ ord: 30, range1: 23000, range2: 23999.99, msc: 24000 },
		{ ord: 31, range1: 24000, range2: 24999.99, msc: 25000 },
		{ ord: 32, range1: 25000, range2: 25999.99, msc: 26000 },
		{ ord: 33, range1: 26000, range2: 26999.99, msc: 27000 },
		{ ord: 34, range1: 27000, range2: 27999.99, msc: 28000 },
		{ ord: 35, range1: 28000, range2: 28999.99, msc: 29000 },
		{ ord: 36, range1: 29000, range2: 29999.99, msc: 30000 },
		{ ord: 37, range1: 30000, range2: 30999.99, msc: 31000 },
		{ ord: 38, range1: 31000, range2: 31999.99, msc: 32000 },
		{ ord: 39, range1: 32000, range2: 32999.99, msc: 33000 },
		{ ord: 40, range1: 33000, range2: 33999.99, msc: 34000 },
		{ ord: 41, range1: 34000, range2: 999999.99, msc: 35000 }, // Maximum MSC
	]

	// Insert SSS table entries
	for (const entry of sssTable2025) {
		const eeContrib = entry.msc * 0.05 // 5% employee contribution
		const erContrib = entry.msc * 0.1 + 30 // 10% employer contribution + ₱30 EC
		const totalContrib = eeContrib + erContrib

		await prisma.govTableSSS.create({
			data: {
				ord: entry.ord,
				range1: entry.range1,
				range2: entry.range2,
				msc: entry.msc,
				rate: 15, // 15% total rate
				employeeContrib: eeContrib,
				employerContrib: erContrib,
				effective_from: new Date('2025-01-01'),
				effective_to: null,
				created_at: new Date(),
				updated_at: new Date(),
			},
		})
	}

	console.log(
		`✓ Inserted ${sssTable2025.length} SSS contribution brackets for 2025`,
	)

	// Get all guards
	const guards = await prisma.guard.findMany({
		where: {
			status: 'ACTIVE',
		},
	})

	console.log(`\nFound ${guards.length} active guards`)

	// Create GuardSSS records for each guard
	for (const guard of guards) {
		const existingSSS = await prisma.guardSSS.findFirst({
			where: {
				guard_id: guard.id,
				company_id: guard.company_id,
			},
		})

		if (!existingSSS) {
			// Generate a sample SSS number (format: XX-XXXXXXX-X)
			const sssNo = `34-${Math.floor(Math.random() * 10000000)
				.toString()
				.padStart(7, '0')}-${Math.floor(Math.random() * 10)}`

			await prisma.guardSSS.create({
				data: {
					company_id: guard.company_id,
					guard_id: guard.id,
					sss_no: sssNo,
					status: 'ACTIVE',
				},
			})
			console.log(
				`Created SSS record for ${guard.employee_no} with SSS No: ${sssNo}`,
			)
		}
	}

	// Get pay period 2025-09.B (SSS is deducted on 16-30/31 period)
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: {
			code: '2025-09.B',
		},
	})

	if (!payPeriodB) {
		console.error(
			'Pay period 2025-09.B not found! Please run the HDMF script first.',
		)
		return
	}

	console.log(`\nCreating SSS schedules for pay period ${payPeriodB.code}...`)

	// Define base salaries for our guards (monthly gross pay)
	const guardSalaries = [
		{ employee_no: 'G001', monthlyGross: 25000 }, // MSC: 26000
		{ employee_no: 'G002', monthlyGross: 18500 }, // MSC: 19000
		{ employee_no: 'G003', monthlyGross: 30000 }, // MSC: 31000
		{ employee_no: 'G004', monthlyGross: 22500 }, // MSC: 23000
	]

	for (const guardData of guardSalaries) {
		const guard = await prisma.guard.findFirst({
			where: { employee_no: guardData.employee_no },
		})

		if (!guard) continue

		// Get the GuardSSS record
		const guardSSS = await prisma.guardSSS.findFirst({
			where: {
				guard_id: guard.id,
				company_id: guard.company_id,
			},
		})

		if (!guardSSS) {
			console.log(`No SSS record found for ${guardData.employee_no}`)
			continue
		}

		// Find the appropriate SSS bracket based on monthly gross
		const sssBracket = await prisma.govTableSSS.findFirst({
			where: {
				range1: { lte: guardData.monthlyGross },
				range2: { gte: guardData.monthlyGross },
				effective_from: { lte: new Date('2025-09-30') },
				OR: [
					{ effective_to: null },
					{ effective_to: { gte: new Date('2025-09-01') } },
				],
			},
		})

		if (!sssBracket) {
			console.log(`No SSS bracket found for salary ${guardData.monthlyGross}`)
			continue
		}

		// Check if schedule already exists
		const existingSchedule = await prisma.guardSSSSchedule.findUnique({
			where: {
				company_id_guard_sss_id_pay_period_id: {
					company_id: guard.company_id,
					guard_sss_id: guardSSS.id,
					pay_period_id: payPeriodB.id,
				},
			},
		})

		if (!existingSchedule) {
			const schedule = await prisma.guardSSSSchedule.create({
				data: {
					company_id: guard.company_id,
					guard_sss_id: guardSSS.id,
					pay_period_id: payPeriodB.id,
					ee_amount: sssBracket.employeeContrib,
					er_amount: sssBracket.employerContrib,
					status: 'PENDING',
				},
			})

			console.log(`Created SSS schedule for ${guardData.employee_no}:`)
			console.log(
				`  Monthly Gross: ₱${guardData.monthlyGross.toLocaleString()}`,
			)
			console.log(`  MSC: ₱${sssBracket.msc.toLocaleString()}`)
			console.log(`  EE Amount: ₱${sssBracket.employeeContrib.toFixed(2)}`)
			console.log(
				`  ER Amount: ₱${sssBracket.employerContrib.toFixed(2)} (includes ₱30 EC)`,
			)
			console.log(
				`  Total: ₱${(Number(sssBracket.employeeContrib) + Number(sssBracket.employerContrib)).toFixed(2)}`,
			)
		}
	}

	// Display summary
	const allSchedules = await prisma.guardSSSSchedule.findMany({
		where: {
			pay_period_id: payPeriodB.id,
		},
	})

	console.log(
		`\n=== Summary of SSS Schedules for Pay Period ${payPeriodB.code} ===`,
	)
	console.log(`Total schedules created: ${allSchedules.length}`)

	const totalEE = allSchedules.reduce((sum, s) => sum + Number(s.ee_amount), 0)
	const totalER = allSchedules.reduce((sum, s) => sum + Number(s.er_amount), 0)

	console.log(`Total Employee Contributions: ₱${totalEE.toFixed(2)}`)
	console.log(`Total Employer Contributions: ₱${totalER.toFixed(2)}`)
	console.log(
		`Grand Total SSS Contributions: ₱${(totalEE + totalER).toFixed(2)}`,
	)
	console.log(
		'\nNote: SSS is deducted only on the 16-30/31 pay period (B period) of each month',
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
