import { prisma } from '../utils/db.server'

export async function action({ request }) {
	if (request.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	const data = await request.json()
	const {
		id,
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
		!id ||
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
		const updated = await prisma.employee.update({
			where: { id },
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
				// assignments update logic can be added here if needed
			},
			include: {
				assignments: true,
			},
		})
		return new Response(JSON.stringify({ success: true, employee: updated }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to update employee',
				details: String(error),
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
