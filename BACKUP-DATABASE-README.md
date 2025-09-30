# Backup PostgreSQL Database Setup

This setup creates a separate PostgreSQL database instance running on port 5435
for restoring and testing backups without affecting your main database.

## Port Configuration

- **Main Database**: Port 5433 (existing)
- **Backup Database**: Port 5435 (new)

## Quick Start

### 1. Start the Backup Database

```bash
# Using Docker Compose directly
docker-compose -f docker-compose-backup.yml up -d

# Or using the management script
.\manage-backup-db.bat start
```

### 2. Check Status

```bash
# Check if container is running
docker ps | grep epicstack-db-backup-5435

# Or using the script
.\manage-backup-db.bat status
```

### 3. Connection Details

- **Host**: localhost
- **Port**: 5435
- **Database**: epic_backup_db
- **Username**: epic_backup_user
- **Password**: epic_backup_pass

### 4. Connection String

```
postgresql://epic_backup_user:epic_backup_pass@localhost:5435/epic_backup_db
```

## Restoring a Backup

### Method 1: Using the Management Script

```bash
# For SQL format backups
.\manage-backup-db.bat restore "C:\path\to\your\backup.sql"

# For custom format dumps
.\manage-backup-db.bat restore "C:\path\to\your\backup.dump"
```

### Method 2: Manual Restore

1. Copy your backup file to the `backup-files` directory
2. Connect to the container:

```bash
docker exec -it epicstack-db-backup-5435 bash
```

3. Restore the backup:

```bash
# For SQL format
psql -U epic_backup_user -d epic_backup_db < /backup/your-backup.sql

# For custom format
pg_restore -U epic_backup_user -d epic_backup_db -v /backup/your-backup.dump
```

## Management Commands

```bash
# Start the database
.\manage-backup-db.bat start

# Stop the database
.\manage-backup-db.bat stop

# Check status
.\manage-backup-db.bat status

# View logs
.\manage-backup-db.bat logs

# Connect with psql
.\manage-backup-db.bat connect

# Restore a backup
.\manage-backup-db.bat restore <backup-file-path>

# Show help
.\manage-backup-db.bat help
```

## Connecting with Database Tools

You can connect using any PostgreSQL client (pgAdmin, DBeaver, DataGrip, etc.):

- **Server**: localhost
- **Port**: 5435
- **Database**: epic_backup_db
- **Username**: epic_backup_user
- **Password**: epic_backup_pass

## Connecting from Your Application

Update your `.env` file or connection settings to use the backup database:

```env
# For the backup database
DATABASE_URL="postgresql://epic_backup_user:epic_backup_pass@localhost:5435/epic_backup_db"
```

## File Structure

```
epic-stack-main-Copy/
├── docker-compose-01.yml          # Main database (port 5433)
├── docker-compose-backup.yml      # Backup database (port 5435)
├── manage-backup-db.ps1           # PowerShell management script
├── manage-backup-db.bat           # Batch file wrapper
├── backup-files/                  # Directory for backup files
└── BACKUP-DATABASE-README.md      # This file
```

## Stopping the Backup Database

```bash
# Using Docker Compose
docker-compose -f docker-compose-backup.yml down

# Or using the script
.\manage-backup-db.bat stop
```

## Removing the Backup Database Completely

To remove the container and its data volume:

```bash
# Stop and remove container
docker-compose -f docker-compose-backup.yml down

# Remove the data volume (WARNING: This deletes all data!)
docker volume rm epicstack_backup_volume_5435
```

## Troubleshooting

### Port Already in Use

If port 5435 is already in use, edit `docker-compose-backup.yml` and change the
port mapping:

```yaml
ports:
  - '5436:5432' # Change 5435 to another port
```

### Permission Issues

If you encounter permission issues on Windows, run the commands in an
Administrator PowerShell/Command Prompt.

### Container Won't Start

Check the logs:

```bash
docker-compose -f docker-compose-backup.yml logs
```

## Notes

- The backup database is completely isolated from your main database
- Data is persisted in a Docker volume named `epicstack_backup_volume_5435`
- The `backup-files` directory is mounted to `/backup` inside the container for
  easy file access
- Both databases can run simultaneously without conflicts
