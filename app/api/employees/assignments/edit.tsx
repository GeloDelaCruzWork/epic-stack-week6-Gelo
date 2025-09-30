// API handler for editing an employee assignment
// POST: expects { assignmentId, ...fieldsToUpdate }
import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server'

export async function action({ request }: { request: Request }) {
	const data = await request.json()
	const { assignmentId, ...fields } = data
	if (!assignmentId) {
		return json(
			{ success: false, error: 'Missing assignmentId' },
			{ status: 400 },
		)
	}
	try {
		const updated = await prisma.employeeAssignment.update({
			where: { id: assignmentId },
			data: fields,
		})
		return json({ success: true, assignment: updated })
	} catch (error) {
		return json({ success: false, error: error.message })
	}
}
