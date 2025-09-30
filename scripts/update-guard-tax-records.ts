import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('Updating GuardTax records with proper TIN information...')

	// Guard data with tax information
	const guardTaxData = [
		{
			employee_no: 'G001',
			tin: '123-456-789-000',
			rdo_code: '049', // RDO Code for Quezon City
			tax_code: 'S', // Single
			exemption_status: '0', // No qualified dependents
		},
		{
			employee_no: 'G002',
			tin: '234-567-890-000',
			rdo_code: '039', // RDO Code for Makati
			tax_code: 'ME2', // Married with 2 qualified dependents
			exemption_status: '2',
		},
		{
			employee_no: 'G003',
			tin: '345-678-901-000',
			rdo_code: '049', // RDO Code for Quezon City
			tax_code: 'ME1', // Married with 1 qualified dependent
			exemption_status: '1',
		},
		{
			employee_no: 'G004',
			tin: '456-789-012-000',
			rdo_code: '044', // RDO Code for Pasig
			tax_code: 'S', // Single
			exemption_status: '0',
		},
	]

	console.log('\nUpdating/Creating GuardTax records...')
	console.log('━'.repeat(70))

	for (const data of guardTaxData) {
		const guard = await prisma.guard.findFirst({
			where: { employee_no: data.employee_no },
		})

		if (!guard) {
			console.log(`Guard ${data.employee_no} not found`)
			continue
		}

		// Check if GuardTax already exists
		let guardTax = await prisma.guardTax.findFirst({
			where: {
				company_id: guard.company_id,
				guard_id: guard.id,
			},
		})

		if (guardTax) {
			// Update existing record
			guardTax = await prisma.guardTax.update({
				where: { id: guardTax.id },
				data: {
					tin: data.tin,
					rdo_code: data.rdo_code,
					tax_code: data.tax_code,
					exemption_status: data.exemption_status,
					updated_at: new Date(),
				},
			})
			console.log(`✓ Updated tax record for ${data.employee_no}`)
		} else {
			// Create new record
			guardTax = await prisma.guardTax.create({
				data: {
					company_id: guard.company_id,
					guard_id: guard.id,
					tin: data.tin,
					rdo_code: data.rdo_code,
					tax_code: data.tax_code,
					exemption_status: data.exemption_status,
					status: 'ACTIVE',
				},
			})
			console.log(`✓ Created tax record for ${data.employee_no}`)
		}

		console.log(`  TIN: ${data.tin}`)
		console.log(`  RDO Code: ${data.rdo_code}`)
		console.log(
			`  Tax Code: ${data.tax_code} (${getTaxCodeDescription(data.tax_code)})`,
		)
		console.log(`  Exemption Status: ${data.exemption_status} dependent(s)`)
	}

	// Display summary
	console.log('\n' + '━'.repeat(70))
	console.log('TAX REGISTRATION SUMMARY')
	console.log('━'.repeat(70))

	const allGuardTax = await prisma.guardTax.findMany({
		orderBy: { created_at: 'asc' },
	})

	console.log(`\nTotal Tax Registrations: ${allGuardTax.length}`)

	// Group by tax code
	const taxCodeGroups = allGuardTax.reduce(
		(acc, gt) => {
			const code = gt.tax_code || 'Unknown'
			if (!acc[code]) acc[code] = 0
			acc[code]++
			return acc
		},
		{} as Record<string, number>,
	)

	console.log('\nDistribution by Tax Code:')
	for (const [code, count] of Object.entries(taxCodeGroups)) {
		console.log(`  ${code} (${getTaxCodeDescription(code)}): ${count} guard(s)`)
	}

	// Group by RDO
	const rdoGroups = allGuardTax.reduce(
		(acc, gt) => {
			const rdo = gt.rdo_code || 'Unknown'
			if (!acc[rdo]) acc[rdo] = 0
			acc[rdo]++
			return acc
		},
		{} as Record<string, number>,
	)

	console.log('\nDistribution by RDO Code:')
	for (const [rdo, count] of Object.entries(rdoGroups)) {
		console.log(`  RDO ${rdo} (${getRDODescription(rdo)}): ${count} guard(s)`)
	}

	// Now update any orphaned GuardTaxSchedule records
	console.log('\n' + '━'.repeat(70))
	console.log('UPDATING TAX SCHEDULES')
	console.log('━'.repeat(70))

	// Get the pay period
	const payPeriodB = await prisma.payPeriod.findFirst({
		where: { code: '2025-09.B' },
	})

	if (payPeriodB) {
		// Get all GuardTax records
		const guardTaxRecords = await prisma.guardTax.findMany()

		for (const guardTax of guardTaxRecords) {
			// Check if tax schedule exists for this guard
			const existingSchedule = await prisma.guardTaxSchedule.findFirst({
				where: {
					company_id: guardTax.company_id,
					guard_tax_id: guardTax.id,
					pay_period_id: payPeriodB.id,
				},
			})

			if (existingSchedule) {
				console.log(`✓ Tax schedule already exists for TIN ${guardTax.tin}`)
			} else {
				console.log(
					`⚠️ No tax schedule found for TIN ${guardTax.tin} - Please run populate-guard-tax-schedule.ts`,
				)
			}
		}
	}

	console.log('\n📌 NOTES:')
	console.log(
		'• TIN format: XXX-XXX-XXX-000 (12 digits with 000 at the end for individuals)',
	)
	console.log(
		'• RDO Code: Revenue District Office where the taxpayer is registered',
	)
	console.log(
		'• Tax Code: Determines the tax exemption based on civil status and dependents',
	)
	console.log('• All guards are now properly registered for tax purposes')
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
	return descriptions[code] || code
}

function getRDODescription(code: string): string {
	const descriptions: Record<string, string> = {
		'039': 'Makati',
		'044': 'Pasig',
		'049': 'Quezon City',
		'050': 'Caloocan',
		'051': 'Manila',
	}
	return descriptions[code] || 'Other'
}

main()
	.catch((e) => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
