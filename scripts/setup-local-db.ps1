$DB_NAME = "lowlands_coffee"
$DB_USER = "postgres"

Write-Host "Reset database: $DB_NAME"

psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

Write-Host "Database reset done."
Write-Host "Now run: npm run dev"