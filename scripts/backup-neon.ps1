[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$DatabaseHost,

    [ValidateNotNullOrEmpty()]
    [string]$DatabaseName = 'neondb',

    [ValidateNotNullOrEmpty()]
    [string]$DatabaseUser = 'neondb_owner',

    [ValidateNotNullOrEmpty()]
    [string]$OutputDirectory = (
        Join-Path `
            ([Environment]::GetFolderPath('MyDocuments')) `
            'MementoVivereBackups'
    )
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker no está disponible en esta terminal.'
}

New-Item `
    -ItemType Directory `
    -Path $OutputDirectory `
    -Force |
    Out-Null

$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
$backupFile = "mementoweb-production-$timestamp.dump"
$backupPath = Join-Path $OutputDirectory $backupFile

$mountSpecification =
    "type=bind,source=$OutputDirectory,target=/backups"

Write-Host 'Creando copia de seguridad de Neon...'
Write-Host 'Introduce la contraseña cuando pg_dump la solicite.'

& docker run --rm -it `
    --mount $mountSpecification `
    --env PGSSLMODE=require `
    --env PGCHANNELBINDING=require `
    postgres:16 `
    pg_dump `
    "--host=$DatabaseHost" `
    '--port=5432' `
    "--username=$DatabaseUser" `
    "--dbname=$DatabaseName" `
    --password `
    --format=custom `
    "--file=/backups/$backupFile" `
    --no-owner `
    --no-privileges `
    --verbose

if ($LASTEXITCODE -ne 0) {
    throw "pg_dump terminó con el código $LASTEXITCODE."
}

if (-not (Test-Path -LiteralPath $backupPath)) {
    throw 'pg_dump terminó, pero no se encontró el archivo generado.'
}

Write-Host 'Comprobando que el archivo puede leerse...'

& docker run --rm `
    --mount "$mountSpecification,readonly" `
    postgres:16 `
    pg_restore `
    --list `
    "/backups/$backupFile" |
    Out-Null

if ($LASTEXITCODE -ne 0) {
    throw "pg_restore no pudo validar el archivo."
}

$hash = (
    Get-FileHash `
        -LiteralPath $backupPath `
        -Algorithm SHA256
).Hash

$checksumPath = "$backupPath.sha256"

"$hash  $backupFile" |
    Set-Content `
        -LiteralPath $checksumPath `
        -Encoding ascii

$fileInformation = Get-Item -LiteralPath $backupPath

Write-Host ''
Write-Host 'Copia creada y validada correctamente.'
Write-Host "Archivo: $($fileInformation.FullName)"
Write-Host "Tamaño: $($fileInformation.Length) bytes"
Write-Host "SHA-256: $hash"