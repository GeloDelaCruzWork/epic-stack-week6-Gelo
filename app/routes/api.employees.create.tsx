import { prisma } from '../utils/db.server.ts'

export async function action({ request }: { request: Request }) {
	if (request.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	const data = (await request.json()) as any
	const {
		employee_no,
		first_name,
		middle_name,
		last_name,
		email,
		department_id,
		position_id,
		hire_date,
		employee_type,
		employment_status,
		company_id = 'default', // fallback, replace with actual logic
	} = data

	if (
		!employee_no ||
		!first_name ||
		!last_name ||
		!email ||
		!department_id ||
		!position_id ||
		!hire_date ||
		!employee_type ||
		!employment_status ||
		!company_id
	) {
		return new Response(
			JSON.stringify({ success: false, error: 'All fields are required' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}

	try {
		const employee = await prisma.employee.create({
			data: {
				company_id,
				employee_no,
				first_name,
				middle_name,
				last_name,
				email,
				hire_date: new Date(hire_date),
				employee_type,
				employment_status,
				assignments: {
					create: [
						{
							department: { connect: { id: department_id } },
							position: { connect: { id: position_id } },
							effective_from: new Date(hire_date),
							company_id,
							assignment_type: 'DEPARTMENT',
						},
					],
				},
			},
			include: {
				assignments: true,
			},
		})
		return new Response(JSON.stringify({ success: true, employee }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to create employee',
				details: String(error),
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
