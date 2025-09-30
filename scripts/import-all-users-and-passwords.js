import { PrismaClient } from '@prisma/client'

// Source database connection
const sourceDb = new PrismaClient({
	datasources: {
		db: {
			url: 'postgresql://epic_user:epic_pass@localhost:5433/epic-20250910?schema=admin',
		},
	},
})

// Target database connection
const targetDb = new PrismaClient({
	datasources: {
		db: {
			url: 'postgresql://epic_user:epic_pass@localhost:5433/epic_db?schema=admin',
		},
	},
})

async function importAllUsersAndPasswords() {
	try {
		console.log('='.repeat(60))
		console.log('COMPLETE USER AND PASSWORD IMPORT')
		console.log('='.repeat(60))
		console.log('Source: epic-20250910')
		console.log('Target: epic_db\n')

		// Step 1: Show current state
		console.log('CURRENT STATE OF TARGET DATABASE')
		console.log('-'.repeat(60))

		const currentUsers = await targetDb.$queryRaw`
      SELECT id, username, email FROM admin."User" ORDER BY username
    `

		console.log(`Current users in target (${currentUsers.length} total):`)
		for (const user of currentUsers) {
			console.log(`  - ${user.username} (${user.email})`)
		}

		// Step 2: Get all users from source
		console.log('\n\nUSERS TO IMPORT FROM SOURCE')
		console.log('-'.repeat(60))

		const sourceUsers = await sourceDb.$queryRaw`
      SELECT * FROM admin."User" ORDER BY username
    `

		console.log(`Found ${sourceUsers.length} users in source database:`)
		for (const user of sourceUsers) {
			console.log(`  - ${user.username} (${user.email})`)
		}

		// Step 3: Import users (keeping original IDs)
		console.log('\n\nIMPORTING USERS')
		console.log('-'.repeat(60))

		let userImportCount = 0
		for (const user of sourceUsers) {
			try {
				// Check if username or email already exists
				const existing = await targetDb.$queryRaw`
          SELECT id FROM admin."User" 
          WHERE username = ${user.username} OR email = ${user.email}
        `

				if (existing.length > 0) {
					console.log(`  ⏭️  Skipping ${user.username} - already exists`)
					continue
				}

				// Import the user with original ID
				await targetDb.$executeRaw`
          INSERT INTO admin."User" (
            "id", "email", "username", "name", 
            "createdAt", "updatedAt"
          )
          VALUES (
            ${user.id}, ${user.email}, ${user.username}, ${user.name},
            ${user.createdAt}, ${user.updatedAt}
          )
        `

				console.log(`  ✅ Imported user: ${user.username}`)
				userImportCount++
			} catch (error) {
				console.log(`  ❌ Failed to import ${user.username}: ${error.message}`)
			}
		}

		console.log(`\n✓ Imported ${userImportCount} new users`)

		// Step 4: Import passwords
		console.log('\n\nIMPORTING PASSWORDS')
		console.log('-'.repeat(60))

		const sourcePasswords = await sourceDb.$queryRaw`
      SELECT p.*, u.username 
      FROM admin."Password" p
      JOIN admin."User" u ON p."userId" = u.id
      ORDER BY u.username
    `

		console.log(
			`Found ${sourcePasswords.length} passwords in source database\n`,
		)

		let passwordImportCount = 0
		for (const password of sourcePasswords) {
			try {
				// Check if user exists in target
				const targetUser = await targetDb.$queryRaw`
          SELECT id FROM admin."User" WHERE id = ${password.userId}
        `

				if (targetUser.length === 0) {
					console.log(
						`  ⏭️  Skipping password for ${password.username} - user not in target`,
					)
					continue
				}

				// Import or update password
				const result = await targetDb.$executeRaw`
          INSERT INTO admin."Password" ("userId", "hash")
          VALUES (${password.userId}, ${password.hash})
          ON CONFLICT ("userId") DO UPDATE 
          SET "hash" = EXCLUDED."hash"
        `

				console.log(`  ✅ Imported password for: ${password.username}`)
				passwordImportCount++
			} catch (error) {
				console.log(
					`  ❌ Failed to import password for ${password.username}: ${error.message}`,
				)
			}
		}

		console.log(`\n✓ Imported ${passwordImportCount} passwords`)

		// Step 5: Final verification
		console.log('\n\nFINAL VERIFICATION')
		console.log('-'.repeat(60))

		const finalUsers = await targetDb.$queryRaw`
      SELECT COUNT(*) as count FROM admin."User"
    `

		const finalPasswords = await targetDb.$queryRaw`
      SELECT COUNT(*) as count FROM admin."Password"
    `

		const usersWithPasswords = await targetDb.$queryRaw`
      SELECT u.username, u.email 
      FROM admin."User" u
      INNER JOIN admin."Password" p ON u.id = p."userId"
      ORDER BY u.username
    `

		console.log(`\nTarget database now contains:`)
		console.log(`  • ${finalUsers[0].count} total users`)
		console.log(`  • ${finalPasswords[0].count} total passwords`)
		console.log(`\nUsers with passwords (${usersWithPasswords.length} total):`)
		for (const user of usersWithPasswords) {
			console.log(`  ✓ ${user.username} (${user.email})`)
		}

		// Check specifically for kody user
		const kodyUser = await targetDb.$queryRaw`
      SELECT u.username, u.email,
             CASE WHEN p."userId" IS NOT NULL THEN '✅ Has Password' ELSE '❌ No Password' END as status
      FROM admin."User" u
      LEFT JOIN admin."Password" p ON u.id = p."userId"
      WHERE u.username = 'kody'
    `

		if (kodyUser.length > 0) {
			console.log(`\n🔑 Special Check - User 'kody': ${kodyUser[0].status}`)
			if (kodyUser[0].status.includes('Has Password')) {
				console.log(
					'   You can now login with: username=kody, password=kodylovesyou',
				)
			}
		}
	} catch (error) {
		console.error('\n❌ Import failed:', error)
		throw error
	} finally {
		await sourceDb.$disconnect()
		await targetDb.$disconnect()
	}
}

// Run the import
importAllUsersAndPasswords()
	.then(() => {
		console.log('\n' + '='.repeat(60))
		console.log('✅ IMPORT COMPLETED SUCCESSFULLY!')
		console.log('='.repeat(60))
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Import failed:', error)
		process.exit(1)
	})
