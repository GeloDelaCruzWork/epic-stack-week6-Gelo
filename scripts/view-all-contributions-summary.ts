import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('═'.repeat(80))
	console.log('         COMPREHENSIVE GOVERNMENT CONTRIBUTIONS SUMMARY - 2025')
	console.log('═'.repeat(80))

	// Get pay period 2025-09.B
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (!payPeriodB) {
		console.error('Pay period 2025-09.B not found!')
		return
	}

	console.log(`\n📅 PAY PERIOD: ${payPeriodB.code} (September 16-30, 2025)`)
	console.log(
		'Note: SSS, PhilHealth, and HDMF are all deducted on the B period (16-30/31)\n',
	)

	// Define guard salaries
	const guardSalaries = [
		{ employee_no: 'G001', name: 'Santos, Juan', monthlyGross: 25000 },
		{ employee_no: 'G002', name: 'Garcia, Maria', monthlyGross: 18500 },
		{ employee_no: 'G003', name: 'Reyes, Pedro', monthlyGross: 30000 },
		{ employee_no: 'G004', name: 'Lopez, Ana', monthlyGross: 22500 },
	]

	console.log('━'.repeat(80))
	console.log('EMPLOYEE GOVERNMENT CONTRIBUTIONS BREAKDOWN')
	console.log('━'.repeat(80))

	let grandTotalEE = 0
	let grandTotalER = 0

	for (const guardInfo of guardSalaries) {
		const guard = await prisma.guard.findFirst({
			where: { employee_no: guardInfo.employee_no },
		})

		if (!guard) continue

		console.log(`\n👤 ${guardInfo.employee_no} - ${guardInfo.name}`)
		console.log(
			`   Monthly Gross Salary: ₱${guardInfo.monthlyGross.toLocaleString()}\n`,
		)

		let totalEEForGuard = 0
		let totalERForGuard = 0

		// SSS Contribution
		const guardSSS = await prisma.guardSSS.findFirst({
			where: { guard_id: guard.id },
		})

		if (guardSSS) {
			const sssSchedule = await prisma.guardSSSSchedule.findUnique({
				where: {
					company_id_guard_sss_id_pay_period_id: {
						company_id: guard.company_id,
						guard_sss_id: guardSSS.id,
						pay_period_id: payPeriodB.id,
					},
				},
			})

			if (sssSchedule) {
				const eeSSS = Number(sssSchedule.ee_amount)
				const erSSS = Number(sssSchedule.er_amount)
				totalEEForGuard += eeSSS
				totalERForGuard += erSSS

				console.log(`   📊 SSS (15% of MSC):`)
				console.log(
					`      • Employee Share (5%):     ₱${eeSSS.toFixed(2).padStart(10)}`,
				)
				console.log(
					`      • Employer Share (10%+EC): ₱${erSSS.toFixed(2).padStart(10)}`,
				)
				console.log(
					`      • Total SSS:               ₱${(eeSSS + erSSS).toFixed(2).padStart(10)}`,
				)
			}
		}

		// PhilHealth Contribution
		const guardPhilHealth = await prisma.guardPhilHealth.findFirst({
			where: { guard_id: guard.id },
		})

		if (guardPhilHealth) {
			const philHealthSchedule =
				await prisma.guardPhilHealthSchedule.findUnique({
					where: {
						company_id_guard_philhealth_id_pay_period_id: {
							company_id: guard.company_id,
							guard_philhealth_id: guardPhilHealth.id,
							pay_period_id: payPeriodB.id,
						},
					},
				})

			if (philHealthSchedule) {
				const eePH = Number(philHealthSchedule.ee_amount)
				const erPH = Number(philHealthSchedule.er_amount)
				totalEEForGuard += eePH
				totalERForGuard += erPH

				console.log(`\n   🏥 PhilHealth (5% of Gross):`)
				console.log(
					`      • Employee Share (2.5%):   ₱${eePH.toFixed(2).padStart(10)}`,
				)
				console.log(
					`      • Employer Share (2.5%):   ₱${erPH.toFixed(2).padStart(10)}`,
				)
				console.log(
					`      • Total PhilHealth:        ₱${(eePH + erPH).toFixed(2).padStart(10)}`,
				)
			}
		}

		// HDMF (Pag-IBIG) Contribution
		const hdmfSchedule = await prisma.guardHDMFSchedule.findUnique({
			where: {
				company_id_guard_id_pay_period_id: {
					company_id: guard.company_id,
					guard_id: guard.id,
					pay_period_id: payPeriodB.id,
				},
			},
		})

		if (hdmfSchedule) {
			const eeHDMF = Number(hdmfSchedule.ee_amount)
			const erHDMF = Number(hdmfSchedule.er_amount)
			totalEEForGuard += eeHDMF
			totalERForGuard += erHDMF

			console.log(`\n   🏠 HDMF/Pag-IBIG (2% each):`)
			console.log(
				`      • Employee Share (2%):     ₱${eeHDMF.toFixed(2).padStart(10)}`,
			)
			console.log(
				`      • Employer Share (2%):     ₱${erHDMF.toFixed(2).padStart(10)}`,
			)
			console.log(
				`      • Total HDMF:              ₱${(eeHDMF + erHDMF).toFixed(2).padStart(10)}`,
			)
		}

		console.log(`\n   ${'─'.repeat(45)}`)
		console.log(`   TOTAL DEDUCTIONS FOR ${guardInfo.employee_no}:`)
		console.log(
			`      • Total Employee Share:    ₱${totalEEForGuard.toFixed(2).padStart(10)}`,
		)
		console.log(
			`      • Total Employer Share:    ₱${totalERForGuard.toFixed(2).padStart(10)}`,
		)
		console.log(
			`      • Grand Total:             ₱${(totalEEForGuard + totalERForGuard).toFixed(2).padStart(10)}`,
		)
		console.log(
			`      • Net Take Home*:          ₱${(guardInfo.monthlyGross - totalEEForGuard).toFixed(2).padStart(10)}`,
		)
		console.log(`      (*Before tax and other deductions)`)

		grandTotalEE += totalEEForGuard
		grandTotalER += totalERForGuard
	}

	console.log('\n' + '═'.repeat(80))
	console.log('COMPANY-WIDE SUMMARY FOR PAY PERIOD 2025-09.B')
	console.log('═'.repeat(80))

	// Get all schedules for summary
	const sssSchedules = await prisma.guardSSSSchedule.findMany({
		where: { pay_period_id: payPeriodB.id },
	})
	const philHealthSchedules = await prisma.guardPhilHealthSchedule.findMany({
		where: { pay_period_id: payPeriodB.id },
	})
	const hdmfSchedules = await prisma.guardHDMFSchedule.findMany({
		where: { pay_period_id: payPeriodB.id },
	})

	const sssEE = sssSchedules.reduce((sum, s) => sum + Number(s.ee_amount), 0)
	const sssER = sssSchedules.reduce((sum, s) => sum + Number(s.er_amount), 0)
	const phEE = philHealthSchedules.reduce(
		(sum, s) => sum + Number(s.ee_amount),
		0,
	)
	const phER = philHealthSchedules.reduce(
		(sum, s) => sum + Number(s.er_amount),
		0,
	)
	const hdmfEE = hdmfSchedules.reduce((sum, s) => sum + Number(s.ee_amount), 0)
	const hdmfER = hdmfSchedules.reduce((sum, s) => sum + Number(s.er_amount), 0)

	console.log('\n📊 SSS CONTRIBUTIONS:')
	console.log(
		`   • Total Employee Share:     ₱${sssEE.toFixed(2).padStart(12)}`,
	)
	console.log(
		`   • Total Employer Share:     ₱${sssER.toFixed(2).padStart(12)}`,
	)
	console.log(
		`   • Total SSS:                ₱${(sssEE + sssER).toFixed(2).padStart(12)}`,
	)

	console.log('\n🏥 PHILHEALTH CONTRIBUTIONS:')
	console.log(`   • Total Employee Share:     ₱${phEE.toFixed(2).padStart(12)}`)
	console.log(`   • Total Employer Share:     ₱${phER.toFixed(2).padStart(12)}`)
	console.log(
		`   • Total PhilHealth:         ₱${(phEE + phER).toFixed(2).padStart(12)}`,
	)

	console.log('\n🏠 HDMF/PAG-IBIG CONTRIBUTIONS:')
	console.log(
		`   • Total Employee Share:     ₱${hdmfEE.toFixed(2).padStart(12)}`,
	)
	console.log(
		`   • Total Employer Share:     ₱${hdmfER.toFixed(2).padStart(12)}`,
	)
	console.log(
		`   • Total HDMF:               ₱${(hdmfEE + hdmfER).toFixed(2).padStart(12)}`,
	)

	console.log('\n' + '─'.repeat(50))
	console.log('💰 GRAND TOTAL ALL CONTRIBUTIONS:')
	console.log(
		`   • Total Employee Share:     ₱${grandTotalEE.toFixed(2).padStart(12)}`,
	)
	console.log(
		`   • Total Employer Share:     ₱${grandTotalER.toFixed(2).padStart(12)}`,
	)
	console.log(
		`   • GRAND TOTAL:              ₱${(grandTotalEE + grandTotalER).toFixed(2).padStart(12)}`,
	)

	console.log('\n' + '═'.repeat(80))
	console.log('📌 KEY REMINDERS:')
	console.log('═'.repeat(80))
	console.log(
		'• All statutory contributions are deducted on the B period (16-30/31)',
	)
	console.log('• SSS: 15% total (5% EE, 10% ER + ₱30 EC) - Based on MSC')
	console.log(
		'• PhilHealth: 5% total (2.5% EE, 2.5% ER) - Based on actual gross',
	)
	console.log('• HDMF: 4% total (2% EE, 2% ER) - Based on actual gross')
	console.log(
		'• These calculations are for September 2025 using the latest rates',
	)
	console.log('• Net take home shown is before income tax and other deductions')

	console.log('\n' + '═'.repeat(80))
	console.log('Report generated on:', new Date().toLocaleString())
	console.log('═'.repeat(80))
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
