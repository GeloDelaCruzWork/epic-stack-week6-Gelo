import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function calculateWithholdingTax(
	taxableIncome: number,
	periodType: string,
): Promise<{
	bracket: number
	fixedTax: number
	taxOnExcess: number
	totalTax: number
}> {
	const taxBracket = await prisma.govTableBIR.findFirst({
		where: {
			period_type: periodType,
			min: { lte: taxableIncome },
			max: { gte: taxableIncome },
			effective_from: { lte: new Date() },
			OR: [{ effective_to: null }, { effective_to: { gte: new Date() } }],
		},
	})

	if (!taxBracket) {
		return {
			bracket: 1,
			fixedTax: 0,
			taxOnExcess: 0,
			totalTax: 0,
		}
	}

	const excess = Math.max(0, taxableIncome - taxBracket.min)
	const taxOnExcess = excess * taxBracket.rateOnExcess
	const totalTax = taxBracket.fixedTax + taxOnExcess

	return {
		bracket: taxBracket.bracket,
		fixedTax: taxBracket.fixedTax,
		taxOnExcess: taxOnExcess,
		totalTax: totalTax,
	}
}

async function main() {
	console.log('Populating GuardTaxSchedule table...')

	// Get pay period 2025-09.B
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (!payPeriodB) {
		console.error('Pay period 2025-09.B not found!')
		return
	}

	const guards = [
		{ employee_no: 'G001', monthlyGross: 25000 },
		{ employee_no: 'G002', monthlyGross: 18500 },
		{ employee_no: 'G003', monthlyGross: 30000 },
		{ employee_no: 'G004', monthlyGross: 22500 },
	]

	console.log(`\nProcessing tax schedules for pay period ${payPeriodB.code}...`)
	console.log('━'.repeat(70))

	for (const guardData of guards) {
		const guard = await prisma.guard.findFirst({
			where: { employee_no: guardData.employee_no },
		})

		if (!guard) {
			console.log(`Guard ${guardData.employee_no} not found`)
			continue
		}

		// Calculate semi-monthly gross (for period B)
		const semiMonthlyGross = guardData.monthlyGross / 2

		// Get statutory deductions to calculate taxable income
		let totalDeductions = 0

		// Get SSS contribution
		const guardSSS = await prisma.guardSSS.findFirst({
			where: { guard_id: guard.id },
		})
		if (guardSSS) {
			const sssSchedule = await prisma.guardSSSSchedule.findFirst({
				where: {
					guard_sss_id: guardSSS.id,
					pay_period_id: payPeriodB.id,
				},
			})
			if (sssSchedule) {
				totalDeductions += Number(sssSchedule.ee_amount)
			}
		}

		// Get PhilHealth contribution
		const guardPH = await prisma.guardPhilHealth.findFirst({
			where: { guard_id: guard.id },
		})
		if (guardPH) {
			const phSchedule = await prisma.guardPhilHealthSchedule.findFirst({
				where: {
					guard_philhealth_id: guardPH.id,
					pay_period_id: payPeriodB.id,
				},
			})
			if (phSchedule) {
				totalDeductions += Number(phSchedule.ee_amount)
			}
		}

		// Get HDMF contribution
		const hdmfSchedule = await prisma.guardHDMFSchedule.findFirst({
			where: {
				guard_id: guard.id,
				pay_period_id: payPeriodB.id,
			},
		})
		if (hdmfSchedule) {
			totalDeductions += Number(hdmfSchedule.ee_amount)
		}

		// Calculate taxable income
		const taxableIncome = semiMonthlyGross - totalDeductions

		// Calculate withholding tax
		const taxDetails = await calculateWithholdingTax(
			taxableIncome,
			'SEMI_MONTHLY',
		)

		// Check if tax schedule already exists
		const existingSchedule = await prisma.guardTaxSchedule.findUnique({
			where: {
				company_id_guard_id_pay_period_id: {
					company_id: guard.company_id,
					guard_id: guard.id,
					pay_period_id: payPeriodB.id,
				},
			},
		})

		if (existingSchedule) {
			console.log(`Tax schedule already exists for ${guardData.employee_no}`)
			continue
		}

		// Create GuardTaxSchedule entry
		const taxSchedule = await prisma.guardTaxSchedule.create({
			data: {
				company_id: guard.company_id,
				guard_id: guard.id,
				pay_period_id: payPeriodB.id,
				period_type: 'SEMI_MONTHLY',
				gross_income: semiMonthlyGross,
				taxable_income: taxableIncome,
				tax_bracket: taxDetails.bracket,
				fixed_tax: taxDetails.fixedTax,
				tax_on_excess: taxDetails.taxOnExcess,
				total_withholding: taxDetails.totalTax,
				status: 'PENDING',
				created_at: new Date(),
				updated_at: new Date(),
			},
		})

		console.log(`\n✓ Created tax schedule for ${guardData.employee_no}:`)
		console.log(`  Gross Income:       ₱${semiMonthlyGross.toFixed(2)}`)
		console.log(`  Less: Deductions:   ₱${totalDeductions.toFixed(2)}`)
		console.log(`  Taxable Income:     ₱${taxableIncome.toFixed(2)}`)
		console.log(`  Tax Bracket:        ${taxDetails.bracket}`)
		console.log(`  Fixed Tax:          ₱${taxDetails.fixedTax.toFixed(2)}`)
		console.log(`  Tax on Excess:      ₱${taxDetails.taxOnExcess.toFixed(2)}`)
		console.log(`  Total Withholding:  ₱${taxDetails.totalTax.toFixed(2)}`)
	}

	// Display summary
	const allTaxSchedules = await prisma.guardTaxSchedule.findMany({
		where: {
			pay_period_id: payPeriodB.id,
		},
	})

	console.log('\n' + '━'.repeat(70))
	console.log('SUMMARY OF TAX SCHEDULES FOR PAY PERIOD 2025-09.B')
	console.log('━'.repeat(70))
	console.log(`Total tax schedules created: ${allTaxSchedules.length}`)

	const totalWithholding = allTaxSchedules.reduce(
		(sum, s) => sum + Number(s.total_withholding),
		0,
	)
	const totalGross = allTaxSchedules.reduce(
		(sum, s) => sum + Number(s.gross_income),
		0,
	)
	const totalTaxable = allTaxSchedules.reduce(
		(sum, s) => sum + Number(s.taxable_income),
		0,
	)

	console.log(`\nAggregate Amounts:`)
	console.log(`  Total Gross Income:      ₱${totalGross.toFixed(2)}`)
	console.log(`  Total Taxable Income:    ₱${totalTaxable.toFixed(2)}`)
	console.log(`  Total Tax Withholding:   ₱${totalWithholding.toFixed(2)}`)
	console.log(
		`  Average Tax Rate:        ${((totalWithholding / totalTaxable) * 100).toFixed(2)}%`,
	)

	// Show tax bracket distribution
	const brackets = await prisma.$queryRaw<{ bracket: number; count: bigint }[]>`
    SELECT tax_bracket as bracket, COUNT(*) as count 
    FROM benefits."GuardTaxSchedule" 
    WHERE pay_period_id = ${payPeriodB.id}
    GROUP BY tax_bracket 
    ORDER BY tax_bracket
  `

	console.log(`\nTax Bracket Distribution:`)
	for (const b of brackets) {
		const rate =
			b.bracket === 1
				? '0%'
				: b.bracket === 2
					? '15%'
					: b.bracket === 3
						? '20%'
						: b.bracket === 4
							? '25%'
							: b.bracket === 5
								? '30%'
								: '35%'
		console.log(`  Bracket ${b.bracket} (${rate}): ${b.count} guards`)
	}

	console.log('\n📌 NOTES:')
	console.log(
		'• Tax is calculated on TAXABLE INCOME (gross less statutory deductions)',
	)
	console.log('• Period Type: SEMI_MONTHLY (for pay period B)')
	console.log('• Tax rates follow TRAIN Law (effective Jan 1, 2023)')
	console.log('• Status: PENDING (will be marked PROCESSED after payroll run)')
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
