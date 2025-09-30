import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Populating BIR Tax Tables with 2023-2025 rates (TRAIN Law)...')

	// Clear existing GovTableBIR entries for 2023 onwards
	await prisma.govTableBIR.deleteMany({
		where: {
			effective_from: {
				gte: new Date('2023-01-01'),
			},
		},
	})

	// BIR Tax Table effective January 1, 2023 onwards (TRAIN Law)
	// These are the graduated tax rates for different pay periods

	// MONTHLY Tax Table
	const monthlyTaxTable = [
		{ bracket: 1, min: 0, max: 20833, fixedTax: 0, rateOnExcess: 0 }, // Tax exempt (₱250k annual)
		{ bracket: 2, min: 20833.01, max: 33332, fixedTax: 0, rateOnExcess: 0.15 }, // 15% on excess
		{ bracket: 3, min: 33333, max: 66666, fixedTax: 1875, rateOnExcess: 0.2 }, // ₱22.5k annual + 20%
		{
			bracket: 4,
			min: 66667,
			max: 166666,
			fixedTax: 8541.8,
			rateOnExcess: 0.25,
		}, // ₱102.5k annual + 25%
		{
			bracket: 5,
			min: 166667,
			max: 666666,
			fixedTax: 33541.8,
			rateOnExcess: 0.3,
		}, // ₱402.5k annual + 30%
		{
			bracket: 6,
			min: 666667,
			max: 999999999,
			fixedTax: 183541.8,
			rateOnExcess: 0.35,
		}, // ₱2.2M annual + 35%
	]

	// SEMI-MONTHLY Tax Table (divide monthly by 2)
	const semiMonthlyTaxTable = [
		{ bracket: 1, min: 0, max: 10416.5, fixedTax: 0, rateOnExcess: 0 },
		{ bracket: 2, min: 10416.51, max: 16666, fixedTax: 0, rateOnExcess: 0.15 },
		{
			bracket: 3,
			min: 16666.01,
			max: 33333,
			fixedTax: 937.5,
			rateOnExcess: 0.2,
		},
		{
			bracket: 4,
			min: 33333.01,
			max: 83333,
			fixedTax: 4270.7,
			rateOnExcess: 0.25,
		},
		{
			bracket: 5,
			min: 83333.01,
			max: 333333,
			fixedTax: 16770.7,
			rateOnExcess: 0.3,
		},
		{
			bracket: 6,
			min: 333333.01,
			max: 999999999,
			fixedTax: 91770.7,
			rateOnExcess: 0.35,
		},
	]

	// WEEKLY Tax Table (monthly / 4.33)
	const weeklyTaxTable = [
		{ bracket: 1, min: 0, max: 4807.69, fixedTax: 0, rateOnExcess: 0 },
		{ bracket: 2, min: 4807.7, max: 7691.92, fixedTax: 0, rateOnExcess: 0.15 },
		{
			bracket: 3,
			min: 7691.93,
			max: 15384.61,
			fixedTax: 432.69,
			rateOnExcess: 0.2,
		},
		{
			bracket: 4,
			min: 15384.62,
			max: 38461.53,
			fixedTax: 1971.15,
			rateOnExcess: 0.25,
		},
		{
			bracket: 5,
			min: 38461.54,
			max: 153846.15,
			fixedTax: 7740.38,
			rateOnExcess: 0.3,
		},
		{
			bracket: 6,
			min: 153846.16,
			max: 999999999,
			fixedTax: 42355.77,
			rateOnExcess: 0.35,
		},
	]

	// DAILY Tax Table (monthly / 21.67 average working days)
	const dailyTaxTable = [
		{ bracket: 1, min: 0, max: 961.54, fixedTax: 0, rateOnExcess: 0 },
		{ bracket: 2, min: 961.55, max: 1538.46, fixedTax: 0, rateOnExcess: 0.15 },
		{
			bracket: 3,
			min: 1538.47,
			max: 3076.92,
			fixedTax: 86.54,
			rateOnExcess: 0.2,
		},
		{
			bracket: 4,
			min: 3076.93,
			max: 7692.31,
			fixedTax: 394.23,
			rateOnExcess: 0.25,
		},
		{
			bracket: 5,
			min: 7692.32,
			max: 30769.23,
			fixedTax: 1548.08,
			rateOnExcess: 0.3,
		},
		{
			bracket: 6,
			min: 30769.24,
			max: 999999999,
			fixedTax: 8471.15,
			rateOnExcess: 0.35,
		},
	]

	// Insert all tax tables
	const tables = [
		{ type: 'MONTHLY', data: monthlyTaxTable },
		{ type: 'SEMI_MONTHLY', data: semiMonthlyTaxTable },
		{ type: 'WEEKLY', data: weeklyTaxTable },
		{ type: 'DAILY', data: dailyTaxTable },
	]

	for (const table of tables) {
		for (const entry of table.data) {
			await prisma.govTableBIR.create({
				data: {
					bracket: entry.bracket,
					period_type: table.type,
					min: entry.min,
					max: entry.max,
					fixedTax: entry.fixedTax,
					rateOnExcess: entry.rateOnExcess,
					effective_from: new Date('2023-01-01'),
					effective_to: null,
					created_at: new Date(),
					updated_at: new Date(),
				},
			})
		}
		console.log(
			`✓ Inserted ${table.data.length} brackets for ${table.type} period`,
		)
	}

	console.log('\n=== BIR Tax Table Successfully Populated ===')
	console.log('Effective: January 1, 2023 onwards (TRAIN Law)')
	console.log('Tax Exemption: ₱250,000 annual (₱20,833 monthly)')
	console.log('Period Types: MONTHLY, SEMI_MONTHLY, WEEKLY, DAILY')

	// Now let's calculate sample withholding tax for our guards
	console.log('\n📊 SAMPLE TAX CALCULATIONS FOR GUARDS (Pay Period 2025-09.B)')
	console.log('━'.repeat(70))

	const guards = [
		{ employee_no: 'G001', name: 'Santos, Juan', monthlyGross: 25000 },
		{ employee_no: 'G002', name: 'Garcia, Maria', monthlyGross: 18500 },
		{ employee_no: 'G003', name: 'Reyes, Pedro', monthlyGross: 30000 },
		{ employee_no: 'G004', name: 'Lopez, Ana', monthlyGross: 22500 },
	]

	// Get pay period B
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (!payPeriodB) {
		console.log('Pay period 2025-09.B not found')
		return
	}

	for (const guard of guards) {
		// Get guard record
		const guardRecord = await prisma.guard.findFirst({
			where: { employee_no: guard.employee_no },
		})

		if (!guardRecord) continue

		// Calculate taxable income (after deducting SSS, PhilHealth, HDMF)
		// For simplicity, we'll use estimates based on our previous calculations
		let deductions = 0

		// Get SSS contribution
		const guardSSS = await prisma.guardSSS.findFirst({
			where: { guard_id: guardRecord.id },
		})
		if (guardSSS) {
			const sssSchedule = await prisma.guardSSSSchedule.findFirst({
				where: {
					guard_sss_id: guardSSS.id,
					pay_period_id: payPeriodB.id,
				},
			})
			if (sssSchedule) {
				deductions += Number(sssSchedule.ee_amount)
			}
		}

		// Get PhilHealth contribution
		const guardPH = await prisma.guardPhilHealth.findFirst({
			where: { guard_id: guardRecord.id },
		})
		if (guardPH) {
			const phSchedule = await prisma.guardPhilHealthSchedule.findFirst({
				where: {
					guard_philhealth_id: guardPH.id,
					pay_period_id: payPeriodB.id,
				},
			})
			if (phSchedule) {
				deductions += Number(phSchedule.ee_amount)
			}
		}

		// Get HDMF contribution
		const hdmfSchedule = await prisma.guardHDMFSchedule.findFirst({
			where: {
				guard_id: guardRecord.id,
				pay_period_id: payPeriodB.id,
			},
		})
		if (hdmfSchedule) {
			deductions += Number(hdmfSchedule.ee_amount)
		}

		// Calculate taxable income (semi-monthly since it's period B)
		const semiMonthlyGross = guard.monthlyGross / 2
		const taxableIncome = semiMonthlyGross - deductions / 2 // Deductions are monthly, so divide by 2

		// Find appropriate tax bracket (SEMI_MONTHLY)
		const taxBracket = await prisma.govTableBIR.findFirst({
			where: {
				period_type: 'SEMI_MONTHLY',
				min: { lte: taxableIncome },
				max: { gte: taxableIncome },
				effective_from: { lte: new Date() },
				OR: [{ effective_to: null }, { effective_to: { gte: new Date() } }],
			},
		})

		if (taxBracket) {
			const excess = taxableIncome - taxBracket.min
			const tax = taxBracket.fixedTax + excess * taxBracket.rateOnExcess

			console.log(`\n${guard.employee_no} - ${guard.name}`)
			console.log(`  Semi-Monthly Gross:     ₱${semiMonthlyGross.toFixed(2)}`)
			console.log(`  Less: Deductions (50%): ₱${(deductions / 2).toFixed(2)}`)
			console.log(`  Taxable Income:         ₱${taxableIncome.toFixed(2)}`)
			console.log(
				`  Tax Bracket:            ${taxBracket.bracket} (${(taxBracket.rateOnExcess * 100).toFixed(0)}% on excess)`,
			)
			console.log(
				`  Fixed Tax:              ₱${taxBracket.fixedTax.toFixed(2)}`,
			)
			console.log(
				`  Tax on Excess:          ₱${(excess * taxBracket.rateOnExcess).toFixed(2)}`,
			)
			console.log(`  💰 WITHHOLDING TAX:     ₱${tax.toFixed(2)}`)
			console.log(
				`  Net After Tax:          ₱${(semiMonthlyGross - deductions / 2 - tax).toFixed(2)}`,
			)
		}
	}

	console.log('\n' + '━'.repeat(70))
	console.log('📌 NOTES:')
	console.log(
		'• Tax is calculated on TAXABLE INCOME (gross less statutory deductions)',
	)
	console.log('• Minimum wage earners are exempt from income tax')
	console.log('• Tax rates follow TRAIN Law (effective Jan 1, 2023)')
	console.log('• Semi-monthly tax shown (for pay period B)')
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
