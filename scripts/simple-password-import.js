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

async function importPasswordsOnly() {
	try {
		console.log('='.repeat(60))
		console.log('PASSWORD IMPORT FROM epic-20250910')
		console.log('='.repeat(60))

		// Get all passwords from source
		const sourcePasswords = await sourceDb.$queryRaw`
      SELECT p.*, u.username, u.email
      FROM admin."Password" p
      JOIN admin."User" u ON p."userId" = u.id
      ORDER BY u.username
    `

		console.log(
			`\nFound ${sourcePasswords.length} passwords in source database:\n`,
		)

		for (const pwd of sourcePasswords) {
			console.log(`  • ${pwd.username} (${pwd.email})`)
			console.log(`    User ID: ${pwd.userId}`)
			console.log(`    Hash: ${pwd.hash.substring(0, 20)}...`)
		}

		// Since we can't match by user ID (different schemas), let's just show the passwords
		// that could be used to create new users or update existing ones

		console.log('\n' + '='.repeat(60))
		console.log('PASSWORD HASHES FOR MANUAL IMPORT')
		console.log('='.repeat(60))
		console.log('\nYou can use these password hashes to:')
		console.log('1. Create new users with these passwords')
		console.log('2. Update existing users to have these passwords\n')

		for (const pwd of sourcePasswords) {
			console.log(`Username: ${pwd.username}`)
			console.log(`Email: ${pwd.email}`)
			console.log(`Password Hash: ${pwd.hash}`)
			console.log('-'.repeat(60))
		}

		// Special focus on kody user
		const kodyPassword = sourcePasswords.find((p) => p.username === 'kody')
		if (kodyPassword) {
			console.log('\n🔑 SPECIAL: Kody User Password')
			console.log('='.repeat(60))
			console.log('The "kody" user password hash is:')
			console.log(kodyPassword.hash)
			console.log('\nThis corresponds to the password: kodylovesyou')

			// Try to create or update a kody user in target
			console.log('\nAttempting to create kody user in target database...')

			try {
				// First check if kody exists
				const existingKody = await targetDb.$queryRaw`
          SELECT id FROM admin."User" WHERE username = 'kody' OR email = 'kody@kcd.dev'
        `

				if (existingKody.length > 0) {
					console.log('  ℹ️  User "kody" already exists in target database')

					// Update the password
					await targetDb.$executeRaw`
            INSERT INTO admin."Password" ("userId", "hash")
            VALUES (${existingKody[0].id}, ${kodyPassword.hash})
            ON CONFLICT ("userId") DO UPDATE 
            SET "hash" = EXCLUDED."hash"
          `
					console.log('  ✅ Updated password for existing kody user')
				} else {
					// Create new kody user with minimal required fields
					const newUserId = crypto.randomUUID()

					await targetDb.$executeRaw`
            INSERT INTO admin."User" (
              "id", "company_id", "email", "password_hash", 
              "display_name", "username", "name", "is_active"
            )
            VALUES (
              ${newUserId}, 
              'default',
              'kody@kcd.dev',
              ${kodyPassword.hash},
              'Kody',
              'kody',
              'Kody',
              true
            )
          `

					// Also insert into Password table
					await targetDb.$executeRaw`
            INSERT INTO admin."Password" ("userId", "hash")
            VALUES (${newUserId}, ${kodyPassword.hash})
          `

					console.log('  ✅ Created new kody user with password')
					console.log(
						'  📝 Login credentials: username=kody, password=kodylovesyou',
					)
				}
			} catch (error) {
				console.log(`  ❌ Could not create/update kody user: ${error.message}`)
			}
		}

		// Final check
		console.log('\n' + '='.repeat(60))
		console.log('FINAL STATUS')
		console.log('='.repeat(60))

		const usersWithPasswords = await targetDb.$queryRaw`
      SELECT u.username, u.email 
      FROM admin."User" u
      INNER JOIN admin."Password" p ON u.id = p."userId"
      ORDER BY u.username
    `

		console.log(
			`\nUsers with passwords in target database (${usersWithPasswords.length} total):`,
		)
		for (const user of usersWithPasswords) {
			console.log(`  ✓ ${user.username} (${user.email})`)
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
importPasswordsOnly()
	.then(() => {
		console.log('\n✅ Password information extracted successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Failed:', error)
		process.exit(1)
	})
