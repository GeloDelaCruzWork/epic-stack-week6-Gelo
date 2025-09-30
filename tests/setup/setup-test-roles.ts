import { prisma } from '#app/utils/db.server.ts'

export async function ensureRoles() {
	// Ensure user role exists
	await prisma.role.upsert({
		where: { code: 'user' },
		create: {
			code: 'user',
			name: 'Regular User',
			description: 'Default user role',
		},
		update: {},
	})

	// Ensure admin role exists
	await prisma.role.upsert({
		where: { code: 'admin' },
		create: {
			code: 'admin',
			name: 'Administrator',
			description: 'Administrator with full access',
		},
		update: {},
	})

	console.log('✅ Roles ensured: user, admin')
}

// Run if called directly
if (import.meta.url.startsWith('file:')) {
	ensureRoles()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error('❌ Failed to ensure roles:', error)
			process.exit(1)
		})
}
