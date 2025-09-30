import { prisma } from '../utils/db.server.ts'

export async function loader() {
	const departments = await prisma.department.findMany({
		select: { id: true, name: true },
	})
	return new Response(JSON.stringify(departments), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	})
}
