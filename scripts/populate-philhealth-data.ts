import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Populating PhilHealth Tables with 2025 rates...')

	// Clear existing GovTablePhilHealth entries for 2025
	await prisma.govTablePhilHealth.deleteMany({
		where: {
			effective_from: {
				gte: new Date('2025-01-01'),
			},
		},
	})

	// PhilHealth Contribution Table 2025
	// Based on 5% total contribution (2.5% EE, 2.5% ER)
	// Income floor: ₱10,000, Income ceiling: ₱100,000
	// Minimum contribution: ₱500 (₱250 each)
	// Maximum contribution: ₱5,000 (₱2,500 each)
	const philhealthTable2025 = [
		// Below floor - minimum contribution
		{ ord: 1, min: 0, max: 9999.99, rate: 5, fixedEE: 250, fixedER: 250 },
		// ₱10,000 to ₱100,000 - 5% rate
		{
			ord: 2,
			min: 10000,
			max: 10999.99,
			rate: 5,
			computedEE: 275,
			computedER: 275,
		}, // ₱550 total
		{
			ord: 3,
			min: 11000,
			max: 11999.99,
			rate: 5,
			computedEE: 300,
			computedER: 300,
		}, // ₱600 total
		{
			ord: 4,
			min: 12000,
			max: 12999.99,
			rate: 5,
			computedEE: 325,
			computedER: 325,
		}, // ₱650 total
		{
			ord: 5,
			min: 13000,
			max: 13999.99,
			rate: 5,
			computedEE: 350,
			computedER: 350,
		}, // ₱700 total
		{
			ord: 6,
			min: 14000,
			max: 14999.99,
			rate: 5,
			computedEE: 375,
			computedER: 375,
		}, // ₱750 total
		{
			ord: 7,
			min: 15000,
			max: 15999.99,
			rate: 5,
			computedEE: 400,
			computedER: 400,
		}, // ₱800 total
		{
			ord: 8,
			min: 16000,
			max: 16999.99,
			rate: 5,
			computedEE: 425,
			computedER: 425,
		}, // ₱850 total
		{
			ord: 9,
			min: 17000,
			max: 17999.99,
			rate: 5,
			computedEE: 450,
			computedER: 450,
		}, // ₱900 total
		{
			ord: 10,
			min: 18000,
			max: 18999.99,
			rate: 5,
			computedEE: 475,
			computedER: 475,
		}, // ₱950 total
		{
			ord: 11,
			min: 19000,
			max: 19999.99,
			rate: 5,
			computedEE: 500,
			computedER: 500,
		}, // ₱1,000 total
		{
			ord: 12,
			min: 20000,
			max: 20999.99,
			rate: 5,
			computedEE: 525,
			computedER: 525,
		}, // ₱1,050 total
		{
			ord: 13,
			min: 21000,
			max: 21999.99,
			rate: 5,
			computedEE: 550,
			computedER: 550,
		}, // ₱1,100 total
		{
			ord: 14,
			min: 22000,
			max: 22999.99,
			rate: 5,
			computedEE: 575,
			computedER: 575,
		}, // ₱1,150 total
		{
			ord: 15,
			min: 23000,
			max: 23999.99,
			rate: 5,
			computedEE: 600,
			computedER: 600,
		}, // ₱1,200 total
		{
			ord: 16,
			min: 24000,
			max: 24999.99,
			rate: 5,
			computedEE: 625,
			computedER: 625,
		}, // ₱1,250 total
		{
			ord: 17,
			min: 25000,
			max: 25999.99,
			rate: 5,
			computedEE: 650,
			computedER: 650,
		}, // ₱1,300 total
		{
			ord: 18,
			min: 26000,
			max: 26999.99,
			rate: 5,
			computedEE: 675,
			computedER: 675,
		}, // ₱1,350 total
		{
			ord: 19,
			min: 27000,
			max: 27999.99,
			rate: 5,
			computedEE: 700,
			computedER: 700,
		}, // ₱1,400 total
		{
			ord: 20,
			min: 28000,
			max: 28999.99,
			rate: 5,
			computedEE: 725,
			computedER: 725,
		}, // ₱1,450 total
		{
			ord: 21,
			min: 29000,
			max: 29999.99,
			rate: 5,
			computedEE: 750,
			computedER: 750,
		}, // ₱1,500 total
		{
			ord: 22,
			min: 30000,
			max: 34999.99,
			rate: 5,
			computedEE: 875,
			computedER: 875,
		}, // ₱1,750 total (avg of 30-35k)
		{
			ord: 23,
			min: 35000,
			max: 39999.99,
			rate: 5,
			computedEE: 1000,
			computedER: 1000,
		}, // ₱2,000 total (avg of 35-40k)
		{
			ord: 24,
			min: 40000,
			max: 44999.99,
			rate: 5,
			computedEE: 1125,
			computedER: 1125,
		}, // ₱2,250 total (avg of 40-45k)
		{
			ord: 25,
			min: 45000,
			max: 49999.99,
			rate: 5,
			computedEE: 1250,
			computedER: 1250,
		}, // ₱2,500 total (avg of 45-50k)
		{
			ord: 26,
			min: 50000,
			max: 59999.99,
			rate: 5,
			computedEE: 1500,
			computedER: 1500,
		}, // ₱3,000 total (avg of 50-60k)
		{
			ord: 27,
			min: 60000,
			max: 69999.99,
			rate: 5,
			computedEE: 1750,
			computedER: 1750,
		}, // ₱3,500 total (avg of 60-70k)
		{
			ord: 28,
			min: 70000,
			max: 79999.99,
			rate: 5,
			computedEE: 2000,
			computedER: 2000,
		}, // ₱4,000 total (avg of 70-80k)
		{
			ord: 29,
			min: 80000,
			max: 89999.99,
			rate: 5,
			computedEE: 2250,
			computedER: 2250,
		}, // ₱4,500 total (avg of 80-90k)
		{
			ord: 30,
			min: 90000,
			max: 99999.99,
			rate: 5,
			computedEE: 2375,
			computedER: 2375,
		}, // ₱4,750 total (avg of 90-100k)
		{
			ord: 31,
			min: 100000,
			max: 999999.99,
			rate: 5,
			computedEE: 2500,
			computedER: 2500,
		}, // ₱5,000 max (ceiling)
	]

	// Insert PhilHealth table entries
	for (const entry of philhealthTable2025) {
		await prisma.govTablePhilHealth.create({
			data: {
				ord: entry.ord,
				min: entry.min,
				max: entry.max,
				rate: entry.rate,
				employeeContrib: entry.computedEE || entry.fixedEE,
				employerContrib: entry.computedER || entry.fixedER,
				effective_from: new Date('2025-01-01'),
				effective_to: null,
				created_at: new Date(),
				updated_at: new Date(),
			},
		})
	}

	console.log(
		`✓ Inserted ${philhealthTable2025.length} PhilHealth contribution brackets for 2025`,
	)

	// Get all guards
	const guards = await prisma.guard.findMany({
		where: {
			status: 'ACTIVE',
		},
	})

	console.log(`\nFound ${guards.length} active guards`)

	// Create GuardPhilHealth records for each guard
	for (const guard of guards) {
		const existingPhilHealth = await prisma.guardPhilHealth.findFirst({
			where: {
				guard_id: guard.id,
				company_id: guard.company_id,
			},
		})

		if (!existingPhilHealth) {
			// Generate a sample PhilHealth number (format: XX-XXXXXXXXX-X)
			const philhealthNo = `01-${Math.floor(Math.random() * 100000000000)
				.toString()
				.padStart(11, '0')}-${Math.floor(Math.random() * 10)}`

			await prisma.guardPhilHealth.create({
				data: {
					company_id: guard.company_id,
					guard_id: guard.id,
					philhealth_no: philhealthNo,
					status: 'ACTIVE',
				},
			})
			console.log(
				`Created PhilHealth record for ${guard.employee_no} with PhilHealth No: ${philhealthNo}`,
			)
		}
	}

	// Get pay period 2025-09.B (PhilHealth is deducted on 16-30/31 period)
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

	console.log(
		`\nCreating PhilHealth schedules for pay period ${payPeriodB.code}...`,
	)

	// Define base salaries for our guards (monthly gross pay)
	const guardSalaries = [
		{ employee_no: 'G001', monthlyGross: 25000 },
		{ employee_no: 'G002', monthlyGross: 18500 },
		{ employee_no: 'G003', monthlyGross: 30000 },
		{ employee_no: 'G004', monthlyGross: 22500 },
	]

	for (const guardData of guardSalaries) {
		const guard = await prisma.guard.findFirst({
			where: { employee_no: guardData.employee_no },
		})

		if (!guard) continue

		// Get the GuardPhilHealth record
		const guardPhilHealth = await prisma.guardPhilHealth.findFirst({
			where: {
				guard_id: guard.id,
				company_id: guard.company_id,
			},
		})

		if (!guardPhilHealth) {
			console.log(`No PhilHealth record found for ${guardData.employee_no}`)
			continue
		}

		// Calculate PhilHealth contribution based on 5% rule
		let monthlyGross = guardData.monthlyGross
		let eeAmount = 0
		let erAmount = 0

		if (monthlyGross < 10000) {
			// Below floor - minimum contribution
			eeAmount = 250
			erAmount = 250
		} else if (monthlyGross > 100000) {
			// Above ceiling - maximum contribution
			eeAmount = 2500
			erAmount = 2500
		} else {
			// Within range - 5% of monthly gross, split equally
			const totalContribution = monthlyGross * 0.05
			eeAmount = totalContribution / 2
			erAmount = totalContribution / 2
		}

		// Check if schedule already exists
		const existingSchedule = await prisma.guardPhilHealthSchedule.findUnique({
			where: {
				company_id_guard_philhealth_id_pay_period_id: {
					company_id: guard.company_id,
					guard_philhealth_id: guardPhilHealth.id,
					pay_period_id: payPeriodB.id,
				},
			},
		})

		if (!existingSchedule) {
			const schedule = await prisma.guardPhilHealthSchedule.create({
				data: {
					company_id: guard.company_id,
					guard_philhealth_id: guardPhilHealth.id,
					pay_period_id: payPeriodB.id,
					ee_amount: eeAmount,
					er_amount: erAmount,
					status: 'PENDING',
				},
			})

			console.log(`Created PhilHealth schedule for ${guardData.employee_no}:`)
			console.log(
				`  Monthly Gross: ₱${guardData.monthlyGross.toLocaleString()}`,
			)
			console.log(`  EE Amount: ₱${eeAmount.toFixed(2)}`)
			console.log(`  ER Amount: ₱${erAmount.toFixed(2)}`)
			console.log(`  Total: ₱${(eeAmount + erAmount).toFixed(2)} (5% of gross)`)
		}
	}

	// Display summary
	const allSchedules = await prisma.guardPhilHealthSchedule.findMany({
		where: {
			pay_period_id: payPeriodB.id,
		},
	})

	console.log(
		`\n=== Summary of PhilHealth Schedules for Pay Period ${payPeriodB.code} ===`,
	)
	console.log(`Total schedules created: ${allSchedules.length}`)

	const totalEE = allSchedules.reduce((sum, s) => sum + Number(s.ee_amount), 0)
	const totalER = allSchedules.reduce((sum, s) => sum + Number(s.er_amount), 0)

	console.log(`Total Employee Contributions: ₱${totalEE.toFixed(2)}`)
	console.log(`Total Employer Contributions: ₱${totalER.toFixed(2)}`)
	console.log(
		`Grand Total PhilHealth Contributions: ₱${(totalEE + totalER).toFixed(2)}`,
	)
	console.log(
		'\nNote: PhilHealth is deducted only on the 16-30/31 pay period (B period) of each month',
	)
	console.log('Rate: 5% of monthly basic salary (2.5% EE, 2.5% ER)')
	console.log(
		'Floor: ₱10,000 (min ₱500 contribution) | Ceiling: ₱100,000 (max ₱5,000 contribution)',
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
