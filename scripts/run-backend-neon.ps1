$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $rootDir ".env"

if (Test-Path -LiteralPath $envPath) {
    Get-Content -LiteralPath $envPath | ForEach-Object {
        $line = $_.Trim()

        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $separatorIndex = $line.IndexOf("=")
        if ($separatorIndex -le 0) {
            return
        }

        $key = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()

        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        Set-Item -Path "Env:$key" -Value $value
    }
}
else {
    Write-Warning "No .env file found at $envPath. Using existing PowerShell environment variables."
}

$requiredVariables = @("DB_URL", "DB_USERNAME", "DB_PASSWORD", "JWT_SECRET")
$missingVariables = $requiredVariables | Where-Object { -not [Environment]::GetEnvironmentVariable($_, "Process") }

if ($missingVariables.Count -gt 0) {
    throw "Missing required environment variables: $($missingVariables -join ', ')"
}

Set-Location -LiteralPath (Join-Path $rootDir "code/backend")
mvn spring-boot:run
