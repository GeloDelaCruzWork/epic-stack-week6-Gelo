import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('╔' + '═'.repeat(90) + '╗')
	console.log(
		'║' +
			' '.repeat(20) +
			'COMPLETE GOVERNMENT SCHEDULES SUMMARY REPORT' +
			' '.repeat(26) +
			'║',
	)
	console.log(
		'║' + ' '.repeat(31) + 'Pay Period: 2025-09.B' + ' '.repeat(38) + '║',
	)
	console.log(
		'║' + ' '.repeat(27) + 'September 16-30, 2025' + ' '.repeat(42) + '║',
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

	// Get all guards
	const guards = await prisma.guard.findMany({
		where: { status: 'ACTIVE' },
		orderBy: { employee_no: 'asc' },
	})

	console.log('\n📊 SCHEDULE STATUS OVERVIEW')
	console.log('━'.repeat(92))

	// Check schedule existence for each type
	const sssSchedules = await prisma.guardSSSSchedule.count({
		where: { pay_period_id: payPeriodB.id },
	})

	const philHealthSchedules = await prisma.guardPhilHealthSchedule.count({
		where: { pay_period_id: payPeriodB.id },
	})

	const hdmfSchedules = await prisma.guardHDMFSchedule.count({
		where: { pay_period_id: payPeriodB.id },
	})

	const taxSchedules = await prisma.guardTaxSchedule.count({
		where: { pay_period_id: payPeriodB.id },
	})

	console.log(`Total Active Guards: ${guards.length}`)
	console.log(
		`├─ SSS Schedules:        ${sssSchedules} / ${guards.length} ${sssSchedules === guards.length ? '✅' : '⚠️'}`,
	)
	console.log(
		`├─ PhilHealth Schedules: ${philHealthSchedules} / ${guards.length} ${philHealthSchedules === guards.length ? '✅' : '⚠️'}`,
	)
	console.log(
		`├─ HDMF Schedules:       ${hdmfSchedules} / ${guards.length} ${hdmfSchedules === guards.length ? '⚠️ (Partial)' : '⚠️'}`,
	)
	console.log(
		`└─ Tax Schedules:        ${taxSchedules} / ${guards.length} ${taxSchedules === guards.length ? '✅' : '⚠️'}`,
	)

	console.log('\n📋 DETAILED SCHEDULE BREAKDOWN BY GUARD')
	console.log('━'.repeat(92))

	for (const guard of guards) {
		console.log(
			`\n${guard.employee_no} - ${guard.last_name}, ${guard.first_name}`,
		)
		console.log('─'.repeat(50))

		// SSS Schedule
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
				console.log(
					`  SSS:        EE: ₱${Number(sssSchedule.ee_amount).toFixed(2).padStart(10)} | ER: ₱${Number(sssSchedule.er_amount).toFixed(2).padStart(10)} | Status: ${sssSchedule.status}`,
				)
			} else {
				console.log(`  SSS:        ❌ No schedule found`)
			}
		} else {
			console.log(`  SSS:        ❌ Not registered`)
		}

		// PhilHealth Schedule
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
				console.log(
					`  PhilHealth: EE: ₱${Number(phSchedule.ee_amount).toFixed(2).padStart(10)} | ER: ₱${Number(phSchedule.er_amount).toFixed(2).padStart(10)} | Status: ${phSchedule.status}`,
				)
			} else {
				console.log(`  PhilHealth: ❌ No schedule found`)
			}
		} else {
			console.log(`  PhilHealth: ❌ Not registered`)
		}

		// HDMF Schedule
		const hdmfSchedule = await prisma.guardHDMFSchedule.findFirst({
			where: {
				guard_id: guard.id,
				pay_period_id: payPeriodB.id,
			},
		})

		if (hdmfSchedule) {
			console.log(
				`  HDMF:       EE: ₱${Number(hdmfSchedule.ee_amount).toFixed(2).padStart(10)} | ER: ₱${Number(hdmfSchedule.er_amount).toFixed(2).padStart(10)} | Status: ${hdmfSchedule.status}`,
			)
		} else {
			console.log(`  HDMF:       ❌ No schedule found`)
		}

		// Tax Schedule
		const taxSchedule = await prisma.guardTaxSchedule.findFirst({
			where: {
				guard_id: guard.id,
				pay_period_id: payPeriodB.id,
			},
		})

		if (taxSchedule) {
			console.log(
				`  Tax:        Withholding: ₱${Number(taxSchedule.total_withholding).toFixed(2).padStart(10)} | Bracket: ${taxSchedule.tax_bracket} | Status: ${taxSchedule.status}`,
			)
			console.log(
				`              Taxable Income: ₱${Number(taxSchedule.taxable_income).toFixed(2)} (Gross: ₱${Number(taxSchedule.gross_income).toFixed(2)})`,
			)
		} else {
			console.log(`  Tax:        ❌ No schedule found`)
		}
	}

	console.log('\n💰 FINANCIAL SUMMARY')
	console.log('━'.repeat(92))

	// Calculate totals
	const sssTotal = await prisma.guardSSSSchedule.aggregate({
		where: { pay_period_id: payPeriodB.id },
		_sum: { ee_amount: true, er_amount: true },
	})

	const phTotal = await prisma.guardPhilHealthSchedule.aggregate({
		where: { pay_period_id: payPeriodB.id },
		_sum: { ee_amount: true, er_amount: true },
	})

	const hdmfTotal = await prisma.guardHDMFSchedule.aggregate({
		where: { pay_period_id: payPeriodB.id },
		_sum: { ee_amount: true, er_amount: true },
	})

	const taxTotal = await prisma.guardTaxSchedule.aggregate({
		where: { pay_period_id: payPeriodB.id },
		_sum: { total_withholding: true, gross_income: true, taxable_income: true },
	})

	const sssEE = Number(sssTotal._sum.ee_amount || 0)
	const sssER = Number(sssTotal._sum.er_amount || 0)
	const phEE = Number(phTotal._sum.ee_amount || 0)
	const phER = Number(phTotal._sum.er_amount || 0)
	const hdmfEE = Number(hdmfTotal._sum.ee_amount || 0)
	const hdmfER = Number(hdmfTotal._sum.er_amount || 0)
	const taxWithholding = Number(taxTotal._sum.total_withholding || 0)
	const totalGross = Number(taxTotal._sum.gross_income || 0)

	const totalEEDeductions = sssEE + phEE + hdmfEE
	const totalERContributions = sssER + phER + hdmfER
	const totalWithDeductions = totalEEDeductions + taxWithholding

	console.log('Employee Deductions:')
	console.log(`  SSS:              ₱${sssEE.toFixed(2).padStart(12)}`)
	console.log(`  PhilHealth:       ₱${phEE.toFixed(2).padStart(12)}`)
	console.log(`  HDMF/Pag-IBIG:    ₱${hdmfEE.toFixed(2).padStart(12)}`)
	console.log(`  ─────────────────────────────────`)
	console.log(
		`  Subtotal:         ₱${totalEEDeductions.toFixed(2).padStart(12)}`,
	)
	console.log(`  Withholding Tax:  ₱${taxWithholding.toFixed(2).padStart(12)}`)
	console.log(`  ═════════════════════════════════`)
	console.log(
		`  TOTAL DEDUCTIONS: ₱${totalWithDeductions.toFixed(2).padStart(12)}`,
	)

	console.log('\nEmployer Contributions:')
	console.log(`  SSS:              ₱${sssER.toFixed(2).padStart(12)}`)
	console.log(`  PhilHealth:       ₱${phER.toFixed(2).padStart(12)}`)
	console.log(`  HDMF/Pag-IBIG:    ₱${hdmfER.toFixed(2).padStart(12)}`)
	console.log(`  ═════════════════════════════════`)
	console.log(
		`  TOTAL:            ₱${totalERContributions.toFixed(2).padStart(12)}`,
	)

	console.log('\nPayroll Summary:')
	console.log(`  Gross Salaries:   ₱${totalGross.toFixed(2).padStart(12)}`)
	console.log(
		`  Employee Deduct:  ₱${totalWithDeductions.toFixed(2).padStart(12)}`,
	)
	console.log(
		`  Net Pay:          ₱${(totalGross - totalWithDeductions).toFixed(2).padStart(12)}`,
	)
	console.log(
		`  Employer Cost:    ₱${totalERContributions.toFixed(2).padStart(12)}`,
	)
	console.log(`  ═════════════════════════════════`)
	console.log(
		`  TOTAL COST:       ₱${(totalGross + totalERContributions).toFixed(2).padStart(12)}`,
	)

	// Check for missing schedules
	console.log('\n⚠️  ALERTS & REMINDERS')
	console.log('━'.repeat(92))

	const missingSchedules = []

	for (const guard of guards) {
		const missing = []

		// Check SSS
		const guardSSS = await prisma.guardSSS.findFirst({
			where: { guard_id: guard.id },
		})
		if (guardSSS) {
			const sssSchedule = await prisma.guardSSSSchedule.findFirst({
				where: { guard_sss_id: guardSSS.id, pay_period_id: payPeriodB.id },
			})
			if (!sssSchedule) missing.push('SSS')
		} else {
			missing.push('SSS Registration')
		}

		// Check PhilHealth
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
			if (!phSchedule) missing.push('PhilHealth')
		} else {
			missing.push('PhilHealth Registration')
		}

		// Check HDMF
		const hdmfSchedule = await prisma.guardHDMFSchedule.findFirst({
			where: { guard_id: guard.id, pay_period_id: payPeriodB.id },
		})
		if (!hdmfSchedule) missing.push('HDMF')

		// Check Tax
		const taxSchedule = await prisma.guardTaxSchedule.findFirst({
			where: { guard_id: guard.id, pay_period_id: payPeriodB.id },
		})
		if (!taxSchedule) missing.push('Tax')

		if (missing.length > 0) {
			missingSchedules.push({
				guard: `${guard.employee_no} - ${guard.last_name}`,
				missing,
			})
		}
	}

	if (missingSchedules.length > 0) {
		console.log('Missing Schedules:')
		for (const item of missingSchedules) {
			console.log(`  ${item.guard}: ${item.missing.join(', ')}`)
		}
	} else {
		console.log('✅ All required schedules are complete!')
	}

	console.log('\n📅 REMITTANCE DEADLINES:')
	console.log('• SSS & PhilHealth: Last day of the following month')
	console.log('• HDMF/Pag-IBIG: 10th of the following month')
	console.log('• BIR (1601-C): 10th of the following month')

	console.log('\n' + '═'.repeat(92))
	console.log('Report Generated:', new Date().toLocaleString())
	console.log('System: Philippine Payroll Compliance System 2025')
	console.log('═'.repeat(92))
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
