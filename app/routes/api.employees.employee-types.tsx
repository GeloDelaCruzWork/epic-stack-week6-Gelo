import { prisma } from '../utils/db.server.ts'

export async function loader() {
	// Query enum values from PostgreSQL
	const result = await prisma.$queryRawUnsafe<any[]>(
		`SELECT enumlabel FROM pg_enum WHERE enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'EmployeeType'
    )`,
	)
	const types = result.map((row: any) => row.enumlabel)
	return new Response(JSON.stringify(types), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	})
}
