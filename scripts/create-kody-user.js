import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

// Target database connection
const targetDb = new PrismaClient({
	datasources: {
		db: {
			url: 'postgresql://epic_user:epic_pass@localhost:5433/epic_db?schema=admin',
		},
	},
})

async function createKodyUser() {
	try {
		console.log('='.repeat(60))
		console.log('CREATING KODY USER WITH PASSWORD')
		console.log('='.repeat(60))

		// The kody password hash from epic-20250910 database
		const kodyPasswordHash =
			'$argon2id$v=19$m=19456,t=2,p=1$D0L9iyV/DUc4CTyiUfEsRw$V7qBzBMAt6f7fB+ZldJa4o8aZjksNnOG0HmB8cqyql8'

		// Check if kody already exists
		const existingKody = await targetDb.$queryRaw`
      SELECT id, username, email FROM admin."User" 
      WHERE username = 'kody' OR email = 'kody@kcd.dev'
    `

		if (existingKody.length > 0) {
			console.log(`\nUser "kody" already exists:`)
			console.log(`  ID: ${existingKody[0].id}`)
			console.log(`  Username: ${existingKody[0].username}`)
			console.log(`  Email: ${existingKody[0].email}`)

			// Update or insert password
			console.log('\nUpdating password for existing kody user...')

			try {
				const result = await targetDb.$executeRaw`
          INSERT INTO admin."Password" ("userId", "hash")
          VALUES (${existingKody[0].id}, ${kodyPasswordHash})
          ON CONFLICT ("userId") DO UPDATE 
          SET "hash" = EXCLUDED."hash"
        `

				console.log('✅ Password updated successfully!')
			} catch (error) {
				console.log(`❌ Failed to update password: ${error.message}`)
			}
		} else {
			// Create new kody user
			console.log('\nCreating new kody user...')

			const newUserId = crypto.randomUUID()
			const now = new Date()

			try {
				// Create user with all required fields including updatedAt
				await targetDb.$executeRaw`
          INSERT INTO admin."User" (
            "id", 
            "company_id", 
            "email", 
            "password_hash", 
            "display_name", 
            "username", 
            "name", 
            "is_active",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${newUserId}, 
            'default',
            'kody@kcd.dev',
            ${kodyPasswordHash},
            'Kody',
            'kody',
            'Kody',
            true,
            ${now},
            ${now}
          )
        `

				console.log('✅ User created successfully!')
				console.log(`  ID: ${newUserId}`)

				// Also insert into Password table
				await targetDb.$executeRaw`
          INSERT INTO admin."Password" ("userId", "hash")
          VALUES (${newUserId}, ${kodyPasswordHash})
        `

				console.log('✅ Password record created successfully!')
			} catch (error) {
				console.log(`❌ Failed to create user: ${error.message}`)

				// If user creation failed but the user might partially exist, try to clean up
				try {
					await targetDb.$executeRaw`
            DELETE FROM admin."User" WHERE id = ${newUserId}
          `
				} catch (cleanupError) {
					// Ignore cleanup errors
				}
			}
		}

		// Final verification
		console.log('\n' + '='.repeat(60))
		console.log('VERIFICATION')
		console.log('='.repeat(60))

		const kodyUser = await targetDb.$queryRaw`
      SELECT 
        u.id,
        u.username, 
        u.email,
        u.display_name,
        CASE WHEN p."userId" IS NOT NULL THEN true ELSE false END as has_password
      FROM admin."User" u
      LEFT JOIN admin."Password" p ON u.id = p."userId"
      WHERE u.username = 'kody'
    `

		if (kodyUser.length > 0) {
			console.log('\n✅ Kody user status:')
			console.log(`  Username: ${kodyUser[0].username}`)
			console.log(`  Email: ${kodyUser[0].email}`)
			console.log(`  Display Name: ${kodyUser[0].display_name}`)
			console.log(
				`  Has Password: ${kodyUser[0].has_password ? 'Yes ✓' : 'No ✗'}`,
			)

			if (kodyUser[0].has_password) {
				console.log('\n🔑 LOGIN CREDENTIALS:')
				console.log('  Username: kody')
				console.log('  Password: kodylovesyou')
			}
		} else {
			console.log('\n❌ Kody user not found in database')
		}

		// List all users with passwords
		console.log('\n' + '='.repeat(60))
		console.log('ALL USERS WITH PASSWORDS')
		console.log('='.repeat(60))

		const allUsersWithPasswords = await targetDb.$queryRaw`
      SELECT u.username, u.email 
      FROM admin."User" u
      INNER JOIN admin."Password" p ON u.id = p."userId"
      ORDER BY u.username
    `

		console.log(`\nTotal: ${allUsersWithPasswords.length} users with passwords`)
		for (const user of allUsersWithPasswords) {
			console.log(`  • ${user.username} (${user.email})`)
		}
	} catch (error) {
		console.error('\n❌ Operation failed:', error)
		throw error
	} finally {
		await targetDb.$disconnect()
	}
}

// Run the script
createKodyUser()
	.then(() => {
		console.log('\n✅ Script completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Script failed:', error)
		process.exit(1)
	})
