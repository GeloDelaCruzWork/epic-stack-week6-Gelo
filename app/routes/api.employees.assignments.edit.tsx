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
		assignmentId,
		effective_from,
		effective_to,
		department_id,
		position_id,
		location_id,
		assignment_type,
		isPrimary,
		remarks,
		company_id = 'default',
	} = data

	if (!assignmentId || !department_id || !position_id || !assignment_type) {
		return new Response(
			JSON.stringify({ success: false, error: 'Missing required fields' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}

	try {
		const updated = await prisma.employeeAssignment.update({
			where: { id: assignmentId },
			data: {
				effective_from: effective_from ? new Date(effective_from) : undefined,
				effective_to: effective_to ? new Date(effective_to) : undefined,
				department: { connect: { id: department_id } },
				position: { connect: { id: position_id } },
				location: location_id ? { connect: { id: location_id } } : undefined,
				assignment_type,
				isPrimary: !!isPrimary,
				remarks,
				company_id,
			},
			include: {
				location: true,
			},
		})
		return new Response(
			JSON.stringify({
				success: true,
				assignment: {
					...updated,
					office: updated.location ? updated.location.name : null,
					employmentType: updated.assignment_type,
				},
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to update assignment',
				details: String(error),
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
