import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('=== SSS IMPLEMENTATION SUMMARY ===\n')

	// Show sample SSS brackets
	const sampleBrackets = await prisma.govTableSSS.findMany({
		where: {
			effective_from: { lte: new Date('2025-09-30') },
			OR: [
				{ effective_to: null },
				{ effective_to: { gte: new Date('2025-09-01') } },
			],
			msc: {
				in: [5000, 10000, 15000, 20000, 25000, 30000, 35000],
			},
		},
		orderBy: { msc: 'asc' },
	})

	console.log('📊 SAMPLE SSS CONTRIBUTION BRACKETS (2025 Rates - 15% Total):')
	console.log('━'.repeat(80))
	console.log(
		'Salary Range           | MSC      | EE (5%)   | ER (10%+EC) | Total',
	)
	console.log('━'.repeat(80))

	for (const bracket of sampleBrackets) {
		const rangeStr = `₱${bracket.range1.toLocaleString()}-${bracket.range2 > 100000 ? 'above' : bracket.range2.toLocaleString()}`
		console.log(
			`${rangeStr.padEnd(22)} | ` +
				`₱${bracket.msc.toLocaleString().padStart(7)} | ` +
				`₱${bracket.employeeContrib.toFixed(2).padStart(8)} | ` +
				`₱${bracket.employerContrib.toFixed(2).padStart(10)} | ` +
				`₱${(Number(bracket.employeeContrib) + Number(bracket.employerContrib)).toFixed(2).padStart(8)}`,
		)
	}

	console.log("\nNote: ER includes ₱30 EC (Employees' Compensation)")

	// Show guard SSS registrations
	const guardSSS = await prisma.guardSSS.findMany()

	console.log('\n📋 GUARD SSS REGISTRATIONS:')
	console.log('━'.repeat(60))
	console.log(
		'Employee No | Name                    | SSS Number      | Status',
	)
	console.log('━'.repeat(60))

	for (const record of guardSSS) {
		const guard = await prisma.guard.findUnique({
			where: { id: record.guard_id },
		})
		if (guard) {
			const name = `${guard.last_name}, ${guard.first_name}`
			console.log(
				`${guard.employee_no.padEnd(11)} | ` +
					`${name.padEnd(23)} | ` +
					`${record.sss_no.padEnd(15)} | ` +
					`${record.status}`,
			)
		}
	}

	// Show SSS schedules for period 2025-09.B
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (payPeriodB) {
		const schedules = await prisma.guardSSSSchedule.findMany({
			where: { pay_period_id: payPeriodB.id },
		})

		console.log('\n💰 SSS SCHEDULE FOR PAY PERIOD 2025-09.B (Sept 16-30):')
		console.log('━'.repeat(75))
		console.log(
			'Guard   | Monthly Gross | MSC      | EE Share  | ER Share   | Total',
		)
		console.log('━'.repeat(75))

		// Map schedules to guards with their salary info
		const guardSalaries = [
			{ employee_no: 'G001', monthlyGross: 25000, msc: 26000 },
			{ employee_no: 'G002', monthlyGross: 18500, msc: 19000 },
			{ employee_no: 'G003', monthlyGross: 30000, msc: 31000 },
			{ employee_no: 'G004', monthlyGross: 22500, msc: 23000 },
		]

		let totalEE = 0
		let totalER = 0

		for (const guardInfo of guardSalaries) {
			const guard = await prisma.guard.findFirst({
				where: { employee_no: guardInfo.employee_no },
			})

			if (guard) {
				const guardSSS = await prisma.guardSSS.findFirst({
					where: { guard_id: guard.id },
				})

				if (guardSSS) {
					const schedule = await prisma.guardSSSSchedule.findUnique({
						where: {
							company_id_guard_sss_id_pay_period_id: {
								company_id: guard.company_id,
								guard_sss_id: guardSSS.id,
								pay_period_id: payPeriodB.id,
							},
						},
					})

					if (schedule) {
						totalEE += Number(schedule.ee_amount)
						totalER += Number(schedule.er_amount)

						console.log(
							`${guardInfo.employee_no.padEnd(7)} | ` +
								`₱${guardInfo.monthlyGross.toLocaleString().padStart(12)} | ` +
								`₱${guardInfo.msc.toLocaleString().padStart(7)} | ` +
								`₱${Number(schedule.ee_amount).toFixed(2).padStart(8)} | ` +
								`₱${Number(schedule.er_amount).toFixed(2).padStart(9)} | ` +
								`₱${(Number(schedule.ee_amount) + Number(schedule.er_amount)).toFixed(2).padStart(8)}`,
						)
					}
				}
			}
		}

		console.log('━'.repeat(75))
		console.log(
			`${'TOTALS'.padEnd(7)} | ` +
				`${''.padEnd(13)} | ` +
				`${''.padEnd(8)} | ` +
				`₱${totalEE.toFixed(2).padStart(8)} | ` +
				`₱${totalER.toFixed(2).padStart(9)} | ` +
				`₱${(totalEE + totalER).toFixed(2).padStart(8)}`,
		)

		console.log('\n📌 KEY POINTS:')
		console.log(
			'• SSS contributions are based on 2025 rates (15% total: 5% EE, 10% ER)',
		)
		console.log("• Employer share includes ₱30 EC (Employees' Compensation)")
		console.log(
			'• SSS is deducted only on the B period (16-30/31) of each month',
		)
		console.log('• Monthly Salary Credit (MSC) ranges from ₱5,000 to ₱35,000')
		console.log(
			'• Contributions are calculated based on the MSC, not actual salary',
		)
	}
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
