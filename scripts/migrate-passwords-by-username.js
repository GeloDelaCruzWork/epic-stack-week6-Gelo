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

async function migratePasswordsByUsername() {
	try {
		console.log('Starting password migration by username/email matching...\n')

		// Get users with passwords from source
		console.log('Step 1: Fetching users with passwords from source database...')
		console.log('==========================================================')

		const sourceUsersWithPasswords = await sourceDb.$queryRaw`
      SELECT u.id, u.username, u.email, p.hash
      FROM admin."User" u
      INNER JOIN admin."Password" p ON u.id = p."userId"
      ORDER BY u.username
    `

		console.log(
			`Found ${sourceUsersWithPasswords.length} users with passwords in source database:\n`,
		)
		for (const user of sourceUsersWithPasswords) {
			console.log(`  - ${user.username} (${user.email})`)
		}

		console.log('\nStep 2: Matching users and migrating passwords...')
		console.log('=================================================')

		let successCount = 0
		let skipCount = 0
		let notFoundCount = 0

		for (const sourceUser of sourceUsersWithPasswords) {
			try {
				// Find matching user in target by username or email
				const targetUser = await targetDb.$queryRaw`
          SELECT id, username, email
          FROM admin."User"
          WHERE username = ${sourceUser.username} 
             OR email = ${sourceUser.email}
          LIMIT 1
        `

				if (targetUser.length === 0) {
					console.log(
						`  ❌ No match found for ${sourceUser.username} (${sourceUser.email})`,
					)
					notFoundCount++
					continue
				}

				const targetUserId = targetUser[0].id
				console.log(
					`  🔍 Found match: ${sourceUser.username} -> Target ID: ${targetUserId}`,
				)

				// Check if password already exists
				const existingPassword = await targetDb.$queryRaw`
          SELECT "userId" FROM admin."Password" WHERE "userId" = ${targetUserId}
        `

				if (existingPassword.length > 0) {
					// Update existing password
					await targetDb.$executeRaw`
            UPDATE admin."Password" 
            SET "hash" = ${sourceUser.hash}
            WHERE "userId" = ${targetUserId}
          `
					console.log(`    ✅ Updated password for ${sourceUser.username}`)
				} else {
					// Insert new password
					await targetDb.$executeRaw`
            INSERT INTO admin."Password" ("userId", "hash")
            VALUES (${targetUserId}, ${sourceUser.hash})
          `
					console.log(`    ✅ Inserted password for ${sourceUser.username}`)
				}

				successCount++
			} catch (error) {
				console.log(
					`  ⚠️  Error processing ${sourceUser.username}: ${error.message}`,
				)
				skipCount++
			}
		}

		console.log('\nStep 3: Migration Summary')
		console.log('=========================')
		console.log(`✅ Successfully migrated: ${successCount} passwords`)
		console.log(`❌ Users not found: ${notFoundCount}`)
		console.log(`⚠️  Errors/Skipped: ${skipCount}`)

		// Verify final state
		console.log('\nStep 4: Final Verification')
		console.log('===========================')

		const finalPasswordCount = await targetDb.$queryRaw`
      SELECT COUNT(*) as count FROM admin."Password"
    `

		const usersWithPasswords = await targetDb.$queryRaw`
      SELECT u.username, u.email 
      FROM admin."User" u
      INNER JOIN admin."Password" p ON u.id = p."userId"
      ORDER BY u.username
    `

		console.log(
			`\nTarget database now has ${finalPasswordCount[0].count} password records`,
		)
		console.log(`\nUsers with passwords in target database:`)
		for (const user of usersWithPasswords) {
			console.log(`  ✓ ${user.username} (${user.email})`)
		}

		// Special check for kody user
		const kodyCheck = await targetDb.$queryRaw`
      SELECT u.username, 
             CASE WHEN p."userId" IS NOT NULL THEN 'Has Password' ELSE 'No Password' END as status
      FROM admin."User" u
      LEFT JOIN admin."Password" p ON u.id = p."userId"
      WHERE u.username = 'kody'
    `

		if (kodyCheck.length > 0) {
			console.log(`\n🔑 Special user 'kody': ${kodyCheck[0].status}`)
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
migratePasswordsByUsername()
	.then(() => {
		console.log('\n✅ Password migration completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Password migration failed:', error)
		process.exit(1)
	})
