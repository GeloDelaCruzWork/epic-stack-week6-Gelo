import { prisma } from '../utils/db.server.ts'

export async function loader() {
	const locations = await prisma.location.findMany({
		select: { id: true, name: true },
	})
	return new Response(JSON.stringify(locations), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	})
}
