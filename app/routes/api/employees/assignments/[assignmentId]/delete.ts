import { Request, Response } from 'express'
import { prisma } from '#app/utils/db.server'

export async function deleteAssignmentHandler(req: Request, res: Response) {
	const { assignmentId } = req.params
	if (!assignmentId) {
		return res.status(400).json({ error: 'Missing assignmentId' })
	}
	try {
		await prisma.employeeAssignment.delete({ where: { id: assignmentId } })
		return res.json({ success: true })
	} catch (error) {
		return res
			.status(500)
			.json({ error: error instanceof Error ? error.message : String(error) })
	}
}
