// Express API endpoint for editing an employee
import express from 'express'
const router = express.Router()

router.post('/api/employees/edit', async (req, res) => {
	const data = req.body
	// TODO: Update employee in database using data.id and other fields
	// Example:
	// await db.employee.update({ where: { id: data.id }, data });
	res.json({ success: true, employee: data })
})

export default router
