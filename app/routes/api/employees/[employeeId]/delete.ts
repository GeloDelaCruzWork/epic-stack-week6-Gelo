import { Request, Response } from 'express'
import { prisma } from '#app/utils/db.server'

export async function deleteEmployeeHandler(req: Request, res: Response) {
	const { employeeId } = req.params
	if (!employeeId) {
		return res.status(400).json({ error: 'Missing employeeId' })
	}
	try {
		// Delete all assignments for this employee first
		await prisma.employeeAssignment.deleteMany({
			where: { employee_id: employeeId },
		})
		// Now delete the employee
		await prisma.employee.delete({ where: { id: employeeId } })
		return res.json({ success: true })
	} catch (error) {
		return res
			.status(500)
			.json({ error: error instanceof Error ? error.message : String(error) })
	}
}
