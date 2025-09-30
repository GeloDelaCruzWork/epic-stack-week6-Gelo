import { prisma } from '#app/utils/db.server.ts'

export async function loader({ params }: { params: { id: string } }) {
	console.log('DEBUG assignments loader params:', params)
	const employeeId = params.id
	if (!employeeId) {
		return new Response(
			JSON.stringify({ error: 'Employee ID is required', params }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
	try {
		const assignmentsData = await prisma.employeeAssignment.findMany({
			where: { employee_id: employeeId },
			include: {
				department: true,
				position: true,
				location: true,
			},
			orderBy: { effective_from: 'desc' },
		})
		const assignments = assignmentsData.map((asg) => ({
			...asg,
			department: asg.department?.name || 'N/A',
			position: asg.position?.name || 'N/A',
			office: asg.location?.name || 'N/A',
			employmentType: asg.assignment_type || 'N/A',
		}))
		return new Response(JSON.stringify({ assignments }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		return new Response(
			JSON.stringify({ error: 'Failed to fetch assignments.', params }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
