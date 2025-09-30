import { prisma } from '../../utils/db.server'

export async function editEmployee(req, res) {
	if (req.method !== 'POST') {
		res.status(405).json({ success: false, error: 'Method not allowed' })
		return
	}
	try {
		console.log('EditEmployee API called')
		console.log('Request body:', req.body)
		const data = req.body
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
			company_id = 'default',
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
			res.status(400).json({ success: false, error: 'All fields are required' })
			return
		}
		// Update employee main fields
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
			},
			include: {
				assignments: true,
			},
		})
		// Update primary assignment for department, position, and location (office)
		let assignmentUpdate = await prisma.employeeAssignment.updateMany({
			where: {
				employee_id: id,
				isPrimary: true,
			},
			data: {
				department_id,
				position_id,
				location_id: req.body.location_id || undefined,
			},
		})
		if (assignmentUpdate.count === 0) {
			// Try updating assignment with assignment_type 'DEPARTMENT'
			assignmentUpdate = await prisma.employeeAssignment.updateMany({
				where: {
					employee_id: id,
					assignment_type: 'DEPARTMENT',
				},
				data: {
					department_id,
					position_id,
					location_id: req.body.location_id || undefined,
				},
			})
			if (assignmentUpdate.count === 0) {
				await prisma.employeeAssignment.create({
					data: {
						employee_id: id,
						company_id,
						assignment_type: 'DEPARTMENT',
						isPrimary: true,
						department_id,
						position_id,
						location_id: req.body.location_id || undefined,
						effective_from: new Date(hire_date),
					},
				})
			}
		}
		// Fetch updated employee with assignments
		const employeeWithAssignments = await prisma.employee.findUnique({
			where: { id },
			include: { assignments: true },
		})
		console.log('Prisma update result:', employeeWithAssignments)
		res.json({ success: true, employee: employeeWithAssignments })
	} catch (error) {
		console.error('EditEmployee error:', error)
		res
			.status(500)
			.json({
				success: false,
				error: error instanceof Error ? error.message : String(error),
			})
	}
}
