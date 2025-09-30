import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('╔' + '═'.repeat(90) + '╗')
	console.log(
		'║' +
			' '.repeat(28) +
			'COMPLETE TAX INFORMATION REPORT' +
			' '.repeat(31) +
			'║',
	)
	console.log(
		'║' + ' '.repeat(31) + 'Pay Period: 2025-09.B' + ' '.repeat(38) + '║',
	)
	console.log('╚' + '═'.repeat(90) + '╝')

	// Get pay period B
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (!payPeriodB) {
		console.error('Pay period 2025-09.B not found!')
		return
	}

	// Get all guards with their tax information
	const guards = await prisma.guard.findMany({
		where: { status: 'ACTIVE' },
		orderBy: { employee_no: 'asc' },
	})

	console.log('\n📋 TAX REGISTRATION DETAILS')
	console.log('━'.repeat(92))
	console.log(
		'Employee | Name                 | TIN              | RDO  | Tax Code | Dependents | Status',
	)
	console.log('━'.repeat(92))

	for (const guard of guards) {
		const guardTax = await prisma.guardTax.findFirst({
			where: { guard_id: guard.id },
		})

		if (guardTax) {
			const name = `${guard.last_name}, ${guard.first_name}`
			console.log(
				`${guard.employee_no.padEnd(8)} | ` +
					`${name.padEnd(20)} | ` +
					`${guardTax.tin.padEnd(16)} | ` +
					`${(guardTax.rdo_code || '-').padEnd(4)} | ` +
					`${(guardTax.tax_code || '-').padEnd(8)} | ` +
					`${(guardTax.exemption_status || '0').padEnd(10)} | ` +
					`${guardTax.status}`,
			)
		} else {
			const name = `${guard.last_name}, ${guard.first_name}`
			console.log(
				`${guard.employee_no.padEnd(8)} | ` +
					`${name.padEnd(20)} | ` +
					`${'NOT REGISTERED'.padEnd(16)} | ` +
					`${'-'.padEnd(4)} | ` +
					`${'-'.padEnd(8)} | ` +
					`${'-'.padEnd(10)} | ` +
					`N/A`,
			)
		}
	}

	console.log('\n💰 TAX WITHHOLDING DETAILS FOR PERIOD 2025-09.B')
	console.log('━'.repeat(92))
	console.log(
		'Employee | TIN              | Gross     | Taxable   | Bracket | Fixed   | Excess  | Total Tax',
	)
	console.log('━'.repeat(92))

	let totalGross = 0
	let totalTaxable = 0
	let totalWithholding = 0

	for (const guard of guards) {
		const guardTax = await prisma.guardTax.findFirst({
			where: { guard_id: guard.id },
		})

		if (guardTax) {
			const taxSchedule = await prisma.guardTaxSchedule.findFirst({
				where: {
					guard_tax_id: guardTax.id,
					pay_period_id: payPeriodB.id,
				},
			})

			if (taxSchedule) {
				totalGross += Number(taxSchedule.gross_income)
				totalTaxable += Number(taxSchedule.taxable_income)
				totalWithholding += Number(taxSchedule.total_withholding)

				console.log(
					`${guard.employee_no.padEnd(8)} | ` +
						`${guardTax.tin.padEnd(16)} | ` +
						`₱${Number(taxSchedule.gross_income).toFixed(2).padStart(8)} | ` +
						`₱${Number(taxSchedule.taxable_income).toFixed(2).padStart(8)} | ` +
						`${taxSchedule.tax_bracket.toString().padEnd(7)} | ` +
						`₱${Number(taxSchedule.fixed_tax).toFixed(2).padStart(6)} | ` +
						`₱${Number(taxSchedule.tax_on_excess).toFixed(2).padStart(6)} | ` +
						`₱${Number(taxSchedule.total_withholding).toFixed(2).padStart(8)}`,
				)
			} else {
				console.log(
					`${guard.employee_no.padEnd(8)} | ` +
						`${guardTax.tin.padEnd(16)} | ` +
						`${'No tax schedule found for this period'.padEnd(60)}`,
				)
			}
		}
	}

	console.log('━'.repeat(92))
	console.log(
		`${'TOTALS'.padEnd(8)} | ` +
			`${''.padEnd(16)} | ` +
			`₱${totalGross.toFixed(2).padStart(8)} | ` +
			`₱${totalTaxable.toFixed(2).padStart(8)} | ` +
			`${''.padEnd(7)} | ` +
			`${''.padEnd(7)} | ` +
			`${''.padEnd(7)} | ` +
			`₱${totalWithholding.toFixed(2).padStart(8)}`,
	)

	// Tax code analysis
	console.log('\n📊 TAX CODE ANALYSIS')
	console.log('━'.repeat(92))

	const taxCodes = await prisma.guardTax.groupBy({
		by: ['tax_code'],
		_count: true,
	})

	for (const tc of taxCodes) {
		const code = tc.tax_code || 'Not Set'
		const description = getTaxCodeDescription(code)
		console.log(
			`${code.padEnd(10)} (${description.padEnd(30)}): ${tc._count} guard(s)`,
		)
	}

	// RDO distribution
	console.log('\n🏢 REVENUE DISTRICT OFFICE DISTRIBUTION')
	console.log('━'.repeat(92))

	const rdoCodes = await prisma.guardTax.groupBy({
		by: ['rdo_code'],
		_count: true,
	})

	for (const rdo of rdoCodes) {
		const code = rdo.rdo_code || 'Not Set'
		const location = getRDOLocation(code)
		console.log(
			`RDO ${code.padEnd(5)} (${location.padEnd(20)}): ${rdo._count} guard(s)`,
		)
	}

	// Compliance check
	console.log('\n✅ COMPLIANCE CHECKLIST')
	console.log('━'.repeat(92))

	const totalGuards = guards.length
	const guardsWithTIN = await prisma.guardTax.count()
	const guardsWithTaxSchedule = await prisma.guardTaxSchedule.count({
		where: { pay_period_id: payPeriodB.id },
	})

	console.log(
		`☑ TIN Registration:        ${guardsWithTIN}/${totalGuards} guards ${guardsWithTIN === totalGuards ? '✅' : '⚠️'}`,
	)
	console.log(
		`☑ Tax Schedules Created:   ${guardsWithTaxSchedule}/${totalGuards} guards ${guardsWithTaxSchedule === totalGuards ? '✅' : '⚠️'}`,
	)
	console.log(
		`☑ BIR Form 1601-C Ready:   ${guardsWithTaxSchedule === totalGuards ? 'Yes ✅' : 'No ⚠️ - Missing schedules'}`,
	)
	console.log(`☑ Total Tax to Remit:      ₱${totalWithholding.toFixed(2)}`)
	console.log(`☑ Remittance Deadline:     10th of October 2025`)

	// Tax calculation summary
	console.log('\n📈 TAX CALCULATION SUMMARY')
	console.log('━'.repeat(92))

	if (totalTaxable > 0) {
		const effectiveRate = (totalWithholding / totalTaxable) * 100
		console.log(`Total Gross Income:        ₱${totalGross.toFixed(2)}`)
		console.log(`Total Taxable Income:      ₱${totalTaxable.toFixed(2)}`)
		console.log(`Total Tax Withholding:     ₱${totalWithholding.toFixed(2)}`)
		console.log(`Effective Tax Rate:        ${effectiveRate.toFixed(2)}%`)
	}

	// Bracket distribution
	const brackets = await prisma.guardTaxSchedule.groupBy({
		by: ['tax_bracket'],
		where: { pay_period_id: payPeriodB.id },
		_count: true,
	})

	console.log('\nTax Bracket Distribution:')
	for (const b of brackets) {
		const rate = getBracketRate(b.tax_bracket)
		console.log(`  Bracket ${b.tax_bracket} (${rate}): ${b._count} guard(s)`)
	}

	console.log('\n📌 IMPORTANT NOTES:')
	console.log(
		'• TIN format: XXX-XXX-XXX-000 (last 3 digits are branch code, 000 for individuals)',
	)
	console.log(
		'• Tax Code determines exemption: S=Single, ME=Married, ME1-4=Married with 1-4 dependents',
	)
	console.log(
		'• RDO Code indicates the revenue district where the employee is registered',
	)
	console.log(
		'• Withholding tax is computed on TAXABLE income (gross less statutory deductions)',
	)
	console.log('• Remit via BIR Form 1601-C by the 10th of the following month')

	console.log('\n' + '═'.repeat(92))
	console.log('Report Generated:', new Date().toLocaleString())
	console.log('System: Philippine Tax Compliance System 2025')
	console.log('═'.repeat(92))
}

function getTaxCodeDescription(code: string): string {
	const descriptions: Record<string, string> = {
		S: 'Single/No Dependent',
		ME: 'Married',
		ME1: 'Married with 1 Dependent',
		ME2: 'Married with 2 Dependents',
		ME3: 'Married with 3 Dependents',
		ME4: 'Married with 4 Dependents',
	}
	return descriptions[code] || 'Unknown'
}

function getRDOLocation(code: string): string {
	const locations: Record<string, string> = {
		'039': 'Makati City',
		'044': 'Pasig City',
		'049': 'Quezon City',
		'050': 'Caloocan City',
		'051': 'Manila',
	}
	return locations[code] || 'Other'
}

function getBracketRate(bracket: number): string {
	const rates = ['0%', '15%', '20%', '25%', '30%', '35%']
	return rates[bracket - 1] || 'Unknown'
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
