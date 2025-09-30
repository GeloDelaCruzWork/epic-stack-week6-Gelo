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

async function migratePasswords() {
	try {
		console.log('Connecting to source database (epic-20250910)...')

		// Fetch all Password records from source
		const passwords = await sourceDb.$queryRaw`
      SELECT * FROM admin."Password"
    `

		console.log(`Found ${passwords.length} Password records in source database`)

		if (passwords.length === 0) {
			console.log('No Password records to migrate')
			return
		}

		console.log('Connecting to target database (epic_db)...')

		// Check if any records already exist in target
		const existingCount = await targetDb.$queryRaw`
      SELECT COUNT(*) as count FROM admin."Password"
    `
		console.log(
			`Target database currently has ${existingCount[0].count} Password records`,
		)

		// Insert records into target database
		console.log('Inserting Password records into target database...')

		for (const password of passwords) {
			try {
				await targetDb.$queryRaw`
          INSERT INTO admin."Password" ("userId", "hash")
          VALUES (${password.userId}, ${password.hash})
          ON CONFLICT ("userId") DO UPDATE 
          SET "hash" = EXCLUDED."hash"
        `
			} catch (error) {
				console.error(
					`Error inserting password for userId ${password.userId}:`,
					error.message,
				)
			}
		}

		// Verify migration
		const finalCount = await targetDb.$queryRaw`
      SELECT COUNT(*) as count FROM admin."Password"
    `
		console.log(
			`Migration complete! Target database now has ${finalCount[0].count} Password records`,
		)
	} catch (error) {
		console.error('Migration failed:', error)
		throw error
	} finally {
		await sourceDb.$disconnect()
		await targetDb.$disconnect()
	}
}

// Run the migration
migratePasswords()
	.then(() => {
		console.log('Password migration completed successfully!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('Password migration failed:', error)
		process.exit(1)
	})
