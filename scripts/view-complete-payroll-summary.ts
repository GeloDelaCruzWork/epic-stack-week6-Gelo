import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function calculateWithholdingTax(
	taxableIncome: number,
	periodType: string,
): Promise<number> {
	const taxBracket = await prisma.govTableBIR.findFirst({
		where: {
			period_type: periodType,
			min: { lte: taxableIncome },
			max: { gte: taxableIncome },
			effective_from: { lte: new Date() },
			OR: [{ effective_to: null }, { effective_to: { gte: new Date() } }],
		},
	})

	if (!taxBracket) return 0

	const excess = Math.max(0, taxableIncome - taxBracket.min)
	return taxBracket.fixedTax + excess * taxBracket.rateOnExcess
}

async function main() {
	console.log('╔' + '═'.repeat(88) + '╗')
	console.log(
		'║' +
			' '.repeat(25) +
			'COMPLETE PAYROLL SUMMARY REPORT' +
			' '.repeat(32) +
			'║',
	)
	console.log(
		'║' + ' '.repeat(30) + 'Pay Period: 2025-09.B' + ' '.repeat(37) + '║',
	)
	console.log(
		'║' +
			' '.repeat(25) +
			'September 16-30, 2025 (Semi-Monthly)' +
			' '.repeat(27) +
			'║',
	)
	console.log('╚' + '═'.repeat(88) + '╝')

	// Get pay period B
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (!payPeriodB) {
		console.error('Pay period 2025-09.B not found!')
		return
	}

	const guards = [
		{
			employee_no: 'G001',
			name: 'Santos, Juan',
			monthlyGross: 25000,
			position: 'Security Guard',
		},
		{
			employee_no: 'G002',
			name: 'Garcia, Maria',
			monthlyGross: 18500,
			position: 'Security Guard',
		},
		{
			employee_no: 'G003',
			name: 'Reyes, Pedro',
			monthlyGross: 30000,
			position: 'Senior Guard',
		},
		{
			employee_no: 'G004',
			name: 'Lopez, Ana',
			monthlyGross: 22500,
			position: 'Security Guard',
		},
	]

	let companyTotalGross = 0
	let companyTotalDeductionsEE = 0
	let companyTotalDeductionsER = 0
	let companyTotalTax = 0
	let companyTotalNet = 0

	for (const guard of guards) {
		const guardRecord = await prisma.guard.findFirst({
			where: { employee_no: guard.employee_no },
		})

		if (!guardRecord) continue

		console.log('\n' + '┌' + '─'.repeat(88) + '┐')
		console.log(
			`│ EMPLOYEE: ${guard.employee_no} - ${guard.name.padEnd(25)} │ POSITION: ${guard.position.padEnd(20)} │`,
		)
		console.log('├' + '─'.repeat(88) + '┤')

		const semiMonthlyGross = guard.monthlyGross / 2
		companyTotalGross += semiMonthlyGross

		console.log('│ EARNINGS' + ' '.repeat(79) + '│')
		console.log(
			`│   Basic Salary (Semi-Monthly):${' '.repeat(40)}₱ ${semiMonthlyGross.toFixed(2).padStart(12)} │`,
		)
		console.log(
			`│   GROSS PAY:${' '.repeat(58)}₱ ${semiMonthlyGross.toFixed(2).padStart(12)} │`,
		)
		console.log('│' + ' '.repeat(88) + '│')

		let totalDeductionsEE = 0
		let totalDeductionsER = 0

		// SSS Deduction
		let sssEE = 0,
			sssER = 0
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
				sssEE = Number(sssSchedule.ee_amount)
				sssER = Number(sssSchedule.er_amount)
				totalDeductionsEE += sssEE
				totalDeductionsER += sssER
			}
		}

		// PhilHealth Deduction
		let phEE = 0,
			phER = 0
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
				phEE = Number(phSchedule.ee_amount)
				phER = Number(phSchedule.er_amount)
				totalDeductionsEE += phEE
				totalDeductionsER += phER
			}
		}

		// HDMF Deduction
		let hdmfEE = 0,
			hdmfER = 0
		const hdmfSchedule = await prisma.guardHDMFSchedule.findFirst({
			where: {
				guard_id: guardRecord.id,
				pay_period_id: payPeriodB.id,
			},
		})
		if (hdmfSchedule) {
			hdmfEE = Number(hdmfSchedule.ee_amount)
			hdmfER = Number(hdmfSchedule.er_amount)
			totalDeductionsEE += hdmfEE
			totalDeductionsER += hdmfER
		}

		console.log('│ DEDUCTIONS' + ' '.repeat(77) + '│')
		console.log(
			'│' +
				' '.repeat(30) +
				'Employee Share    Employer Share         Total' +
				' '.repeat(11) +
				'│',
		)
		console.log(
			'│   SSS (15% of MSC):' +
				' '.repeat(10) +
				`₱ ${sssEE.toFixed(2).padStart(10)}      ` +
				`₱ ${sssER.toFixed(2).padStart(10)}      ` +
				`₱ ${(sssEE + sssER).toFixed(2).padStart(10)}` +
				' '.repeat(8) +
				'│',
		)
		console.log(
			'│   PhilHealth (5% of Gross):' +
				' '.repeat(2) +
				`₱ ${phEE.toFixed(2).padStart(10)}      ` +
				`₱ ${phER.toFixed(2).padStart(10)}      ` +
				`₱ ${(phEE + phER).toFixed(2).padStart(10)}` +
				' '.repeat(8) +
				'│',
		)
		console.log(
			'│   HDMF/Pag-IBIG (2% each):' +
				' '.repeat(2) +
				`₱ ${hdmfEE.toFixed(2).padStart(10)}      ` +
				`₱ ${hdmfER.toFixed(2).padStart(10)}      ` +
				`₱ ${(hdmfEE + hdmfER).toFixed(2).padStart(10)}` +
				' '.repeat(8) +
				'│',
		)
		console.log('│   ' + '─'.repeat(85) + '│')
		console.log(
			'│   Subtotal Contributions:' +
				' '.repeat(3) +
				`₱ ${totalDeductionsEE.toFixed(2).padStart(10)}      ` +
				`₱ ${totalDeductionsER.toFixed(2).padStart(10)}      ` +
				`₱ ${(totalDeductionsEE + totalDeductionsER).toFixed(2).padStart(10)}` +
				' '.repeat(8) +
				'│',
		)

		// Calculate taxable income and withholding tax
		const taxableIncome = semiMonthlyGross - totalDeductionsEE
		const withholdingTax = await calculateWithholdingTax(
			taxableIncome,
			'SEMI_MONTHLY',
		)
		totalDeductionsEE += withholdingTax

		console.log('│' + ' '.repeat(88) + '│')
		console.log(
			'│   Taxable Income:' +
				' '.repeat(52) +
				`₱ ${taxableIncome.toFixed(2).padStart(12)} │`,
		)
		console.log(
			'│   Withholding Tax:' +
				' '.repeat(51) +
				`₱ ${withholdingTax.toFixed(2).padStart(12)} │`,
		)
		console.log('│' + ' '.repeat(88) + '│')
		console.log(
			'│   TOTAL DEDUCTIONS (Employee):' +
				' '.repeat(40) +
				`₱ ${totalDeductionsEE.toFixed(2).padStart(12)} │`,
		)
		console.log('│' + ' '.repeat(88) + '│')

		const netPay = semiMonthlyGross - totalDeductionsEE

		console.log('│ NET PAY CALCULATION' + ' '.repeat(68) + '│')
		console.log(
			`│   Gross Pay:${' '.repeat(58)} ₱ ${semiMonthlyGross.toFixed(2).padStart(12)} │`,
		)
		console.log(
			`│   Less: Total Deductions:${' '.repeat(45)} ₱ ${totalDeductionsEE.toFixed(2).padStart(12)} │`,
		)
		console.log('│   ' + '═'.repeat(85) + '│')
		console.log(
			`│   NET PAY (TAKE HOME):${' '.repeat(48)} ₱ ${netPay.toFixed(2).padStart(12)} │`,
		)
		console.log('│' + ' '.repeat(88) + '│')

		// Employer costs
		const employerCost = semiMonthlyGross + totalDeductionsER
		console.log('│ EMPLOYER COST BREAKDOWN' + ' '.repeat(63) + '│')
		console.log(
			`│   Basic Salary:${' '.repeat(55)} ₱ ${semiMonthlyGross.toFixed(2).padStart(12)} │`,
		)
		console.log(
			`│   Employer Contributions:${' '.repeat(45)} ₱ ${totalDeductionsER.toFixed(2).padStart(12)} │`,
		)
		console.log(
			`│   TOTAL COST TO COMPANY:${' '.repeat(46)} ₱ ${employerCost.toFixed(2).padStart(12)} │`,
		)
		console.log('└' + '─'.repeat(88) + '┘')

		companyTotalDeductionsEE += totalDeductionsEE
		companyTotalDeductionsER += totalDeductionsER
		companyTotalTax += withholdingTax
		companyTotalNet += netPay
	}

	// Company Summary
	console.log('\n╔' + '═'.repeat(88) + '╗')
	console.log(
		'║' + ' '.repeat(32) + 'COMPANY PAYROLL SUMMARY' + ' '.repeat(33) + '║',
	)
	console.log('╠' + '═'.repeat(88) + '╣')
	console.log('║ TOTALS FOR ALL EMPLOYEES (4 Guards)' + ' '.repeat(51) + '║')
	console.log('║' + ' '.repeat(88) + '║')
	console.log(
		`║   Total Gross Salaries:${' '.repeat(48)} ₱ ${companyTotalGross.toFixed(2).padStart(12)} ║`,
	)
	console.log(
		`║   Total Employee Deductions:${' '.repeat(43)} ₱ ${companyTotalDeductionsEE.toFixed(2).padStart(12)} ║`,
	)
	console.log(
		`║     - Statutory Contributions:${' '.repeat(40)} ₱ ${(companyTotalDeductionsEE - companyTotalTax).toFixed(2).padStart(12)} ║`,
	)
	console.log(
		`║     - Withholding Tax:${' '.repeat(49)} ₱ ${companyTotalTax.toFixed(2).padStart(12)} ║`,
	)
	console.log(
		`║   Total Net Pay (Take Home):${' '.repeat(43)} ₱ ${companyTotalNet.toFixed(2).padStart(12)} ║`,
	)
	console.log('║' + ' '.repeat(88) + '║')
	console.log(
		`║   Total Employer Contributions:${' '.repeat(40)} ₱ ${companyTotalDeductionsER.toFixed(2).padStart(12)} ║`,
	)
	console.log(
		`║   TOTAL PAYROLL COST:${' '.repeat(50)} ₱ ${(companyTotalGross + companyTotalDeductionsER).toFixed(2).padStart(12)} ║`,
	)
	console.log('╚' + '═'.repeat(88) + '╝')

	// Compliance reminders
	console.log('\n📋 COMPLIANCE REMINDERS:')
	console.log('─'.repeat(50))
	console.log('• SSS: Remit by the last day of the following month')
	console.log('• PhilHealth: Remit by the last day of the following month')
	console.log('• HDMF/Pag-IBIG: Remit by the 10th of the following month')
	console.log('• BIR (Form 1601-C): Remit by the 10th of the following month')
	console.log('• All contributions are for the B period (16-30/31)')

	console.log('\n📊 CONTRIBUTION RATES SUMMARY:')
	console.log('─'.repeat(50))
	console.log('• SSS: 15% total (5% EE, 10% ER + ₱30 EC)')
	console.log('• PhilHealth: 5% total (2.5% EE, 2.5% ER)')
	console.log('• HDMF: 4% total max (2% EE, 2% ER)')
	console.log('• Tax: Based on TRAIN Law (effective 2023)')

	console.log('\n' + '═'.repeat(90))
	console.log('Report Generated:', new Date().toLocaleString())
	console.log('System: Philippine Payroll Compliance System 2025')
	console.log('═'.repeat(90))
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
