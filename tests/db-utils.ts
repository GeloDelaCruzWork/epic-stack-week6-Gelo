import { faker } from '@faker-js/faker'
import * as argon2 from 'argon2'
import { UniqueEnforcer } from 'enforce-unique'
import { prisma } from '#app/utils/db.server.ts'

const uniqueUsernameEnforcer = new UniqueEnforcer()

export async function ensureUserRole() {
	return prisma.role.upsert({
		where: { code: 'user' },
		create: {
			code: 'user',
			name: 'Regular User',
			description: 'Default user role',
		},
		update: {},
	})
}

export function createUser() {
	const firstName = faker.person.firstName()
	const lastName = faker.person.lastName()

	const username = uniqueUsernameEnforcer
		.enforce(() => {
			return (
				faker.string.alphanumeric({ length: 2 }) +
				'_' +
				faker.internet.username({
					firstName: firstName.toLowerCase(),
					lastName: lastName.toLowerCase(),
				})
			)
		})
		.slice(0, 20)
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, '_')
	const name = `${firstName} ${lastName}`
	return {
		username,
		name,
		email: `${username}@example.com`,
		company_id: 'default-company',
		display_name: name,
		password_hash: 'temp-hash', // Will be replaced when creating password
		is_active: true,
	}
}

export async function createUserInDb(
	overrides?: Partial<{
		username: string
		name: string
		email: string
		company_id?: string
		display_name?: string
	}>,
) {
	const userData = createUser()
	const password = await createPassword()
	return prisma.user.create({
		data: {
			...userData,
			password_hash: password.hash,
			...overrides,
			password: { create: password },
		},
		select: {
			id: true,
			username: true,
			name: true,
			email: true,
		},
	})
}

export async function createPassword(
	password: string = faker.internet.password(),
) {
	return {
		hash: await argon2.hash(password, {
			type: argon2.argon2id,
			memoryCost: 19456, // 19 MiB
			timeCost: 2,
			parallelism: 1,
		}),
	}
}

let noteImages: Array<{ altText: string; objectKey: string }> | undefined
export async function getNoteImages() {
	if (noteImages) return noteImages

	noteImages = await Promise.all([
		{
			altText: 'a nice country house',
			objectKey: 'notes/0.png',
		},
		{
			altText: 'a city scape',
			objectKey: 'notes/1.png',
		},
		{
			altText: 'a sunrise',
			objectKey: 'notes/2.png',
		},
		{
			altText: 'a group of friends',
			objectKey: 'notes/3.png',
		},
		{
			altText: 'friends being inclusive of someone who looks lonely',
			objectKey: 'notes/4.png',
		},
		{
			altText: 'an illustration of a hot air balloon',
			objectKey: 'notes/5.png',
		},
		{
			altText:
				'an office full of laptops and other office equipment that look like it was abandoned in a rush out of the building in an emergency years ago.',
			objectKey: 'notes/6.png',
		},
		{
			altText: 'a rusty lock',
			objectKey: 'notes/7.png',
		},
		{
			altText: 'something very happy in nature',
			objectKey: 'notes/8.png',
		},
		{
			altText: `someone at the end of a cry session who's starting to feel a little better.`,
			objectKey: 'notes/9.png',
		},
	])

	return noteImages
}

let userImages: Array<{ objectKey: string }> | undefined
export async function getUserImages() {
	if (userImages) return userImages

	userImages = await Promise.all(
		Array.from({ length: 10 }, (_, index) => ({
			objectKey: `user/${index}.jpg`,
		})),
	)

	return userImages
}

export function createEmployee({
	employeeNo = `EMP${faker.number.int({ min: 1000, max: 9999 })}`,
	firstName = faker.person.firstName(),
	lastName = faker.person.lastName(),
	middleName = faker.person.middleName(),
	email = faker.internet.email(),
	departmentId = 'dept-default',
	companyId = 'default-company',
	hireDate = new Date(),
}: {
	employeeNo?: string
	firstName?: string
	lastName?: string
	middleName?: string | null
	email?: string
	departmentId?: string
	companyId?: string
	hireDate?: Date
} = {}) {
	return prisma.employee.create({
		data: {
			employee_no: employeeNo,
			first_name: firstName,
			last_name: lastName,
			middle_name: middleName,
			email,
			department_id: departmentId,
			company_id: companyId,
			hire_date: hireDate,
		},
	})
}

export function createPayPeriod({
	code = '2024-01-01',
	startDate = new Date('2024-01-01'),
	endDate = new Date('2024-01-15'),
	month = 1,
	year = 2024,
	companyId = 'default-company',
	from = 1,
	to = 15,
	status = 'OPEN',
}: {
	code?: string
	startDate?: Date
	endDate?: Date
	month?: number
	year?: number
	companyId?: string
	from?: number
	to?: number
	status?: string
} = {}) {
	return prisma.payPeriod.create({
		data: {
			code,
			start_date: startDate,
			end_date: endDate,
			month,
			year,
			company_id: companyId,
			from,
			to,
			status,
		},
	})
}

export function createPayrollRun({
	payPeriodId,
	payrollType = 'REGULAR',
	status = 'PROCESSING',
}: {
	payPeriodId: string
	payrollType?: string
	status?: string
}) {
	return prisma.payrollRun.create({
		data: {
			pay_period_id: payPeriodId,
			payroll_type: payrollType,
			status,
		},
	})
}

export function createPayslip({
	employeeId,
	payrollRunId,
	basicPay = 30000,
	overtimePay = 0,
	nightDiffPay = 0,
	holidayPay = 0,
	status = 'DRAFT',
}: {
	employeeId: string
	payrollRunId: string
	basicPay?: number
	overtimePay?: number
	nightDiffPay?: number
	holidayPay?: number
	status?: string
}) {
	const sssEE = basicPay * 0.045 // 4.5% for SSS
	const philhealthEE = basicPay * 0.0125 // 1.25% for PhilHealth
	const hdmfEE = 200 // Fixed Pag-IBIG
	const withholdingTax = basicPay * 0.1 // Simplified 10% tax
	const grossPay = basicPay + overtimePay + nightDiffPay + holidayPay
	const totalDeductions = sssEE + philhealthEE + hdmfEE + withholdingTax
	const netPay = grossPay - totalDeductions

	return prisma.employeePayslip.create({
		data: {
			employee_id: employeeId,
			payroll_run_id: payrollRunId,
			basic_pay: basicPay,
			overtime_pay: overtimePay,
			night_diff_pay: nightDiffPay,
			holiday_pay: holidayPay,
			allowances_total: 0,
			absences_amount: 0,
			tardiness_amount: 0,
			loans_total: 0,
			other_deductions: 0,
			sss_ee: sssEE,
			sss_er: sssEE * 1.5,
			philhealth_ee: philhealthEE,
			philhealth_er: philhealthEE,
			hdmf_ee: hdmfEE,
			hdmf_er: hdmfEE,
			taxable_income: grossPay - sssEE - philhealthEE - hdmfEE,
			withholding_tax: withholdingTax,
			gross_pay: grossPay,
			total_deductions: totalDeductions,
			net_pay: netPay,
			status,
		},
	})
}
