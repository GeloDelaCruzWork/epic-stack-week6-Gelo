import { prisma } from '../utils/db.server.ts'

export async function loader() {
	const positions = await prisma.position.findMany({
		select: { id: true, name: true },
	})
	return new Response(JSON.stringify(positions), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	})
}
