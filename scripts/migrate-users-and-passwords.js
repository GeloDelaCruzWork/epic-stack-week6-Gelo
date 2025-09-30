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

async function migrateUsersAndPasswords() {
	try {
		console.log('Starting migration from epic-20250910 to epic_db...\n')

		// First, migrate Users
		console.log('Step 1: Migrating User records...')
		console.log('=========================================')

		const users = await sourceDb.$queryRaw`
      SELECT * FROM admin."User"
    `

		console.log(`Found ${users.length} User records in source database`)

		let usersInserted = 0
		let usersSkipped = 0

		for (const user of users) {
			try {
				await targetDb.$queryRaw`
          INSERT INTO admin."User" (
            "id", "email", "username", "name", 
            "createdAt", "updatedAt"
          )
          VALUES (
            ${user.id}, ${user.email}, ${user.username}, ${user.name},
            ${user.createdAt}, ${user.updatedAt}
          )
          ON CONFLICT ("id") DO NOTHING
        `
				usersInserted++
			} catch (error) {
				console.log(
					`  - Skipped user ${user.username} (${user.email}): May already exist or has conflicts`,
				)
				usersSkipped++
			}
		}

		console.log(
			`✓ Users migration complete: ${usersInserted} inserted, ${usersSkipped} skipped\n`,
		)

		// Then, migrate Passwords
		console.log('Step 2: Migrating Password records...')
		console.log('=========================================')

		const passwords = await sourceDb.$queryRaw`
      SELECT * FROM admin."Password"
    `

		console.log(`Found ${passwords.length} Password records in source database`)

		let passwordsInserted = 0
		let passwordsUpdated = 0
		let passwordsSkipped = 0

		for (const password of passwords) {
			try {
				// First check if the user exists in target
				const userExists = await targetDb.$queryRaw`
          SELECT id FROM admin."User" WHERE id = ${password.userId}
        `

				if (userExists.length === 0) {
					console.log(
						`  - Skipped password for userId ${password.userId}: User doesn't exist in target`,
					)
					passwordsSkipped++
					continue
				}

				// Try to insert or update the password
				const result = await targetDb.$executeRaw`
          INSERT INTO admin."Password" ("userId", "hash")
          VALUES (${password.userId}, ${password.hash})
          ON CONFLICT ("userId") DO UPDATE 
          SET "hash" = EXCLUDED."hash"
        `

				if (result === 1) {
					passwordsInserted++
				} else {
					passwordsUpdated++
				}
			} catch (error) {
				console.log(
					`  - Error with password for userId ${password.userId}: ${error.message}`,
				)
				passwordsSkipped++
			}
		}

		console.log(
			`✓ Passwords migration complete: ${passwordsInserted} inserted, ${passwordsUpdated} updated, ${passwordsSkipped} skipped\n`,
		)

		// Verify final state
		console.log('Step 3: Verification')
		console.log('=========================================')

		const finalUserCount = await targetDb.$queryRaw`
      SELECT COUNT(*) as count FROM admin."User"
    `
		const finalPasswordCount = await targetDb.$queryRaw`
      SELECT COUNT(*) as count FROM admin."Password"
    `

		console.log(`Target database now has:`)
		console.log(`  - ${finalUserCount[0].count} User records`)
		console.log(`  - ${finalPasswordCount[0].count} Password records`)

		// Show users with passwords
		const usersWithPasswords = await targetDb.$queryRaw`
      SELECT u.username, u.email 
      FROM admin."User" u
      INNER JOIN admin."Password" p ON u.id = p."userId"
      ORDER BY u.username
    `

		console.log(`\nUsers with passwords in target database:`)
		for (const user of usersWithPasswords) {
			console.log(`  - ${user.username} (${user.email})`)
		}
	} catch (error) {
		console.error('Migration failed:', error)
		throw error
	} finally {
		await sourceDb.$disconnect()
		await targetDb.$disconnect()
	}
}

// Run the migration
migrateUsersAndPasswords()
	.then(() => {
		console.log('\n✅ Migration completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Migration failed:', error)
		process.exit(1)
	})
