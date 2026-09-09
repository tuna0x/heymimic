[CmdletBinding()]
param(
  [string]$SourceDatabase = 'heymimic',
  [string]$DatabaseUser = 'heymimic',
  [string]$DrillDatabase = ('heymimic_restore_drill_' + (Get-Date -Format 'yyyyMMdd_HHmmss')),
  [string]$ArtifactDirectory = '',
  [switch]$DropDatabaseAfter
)

$ErrorActionPreference = 'Stop'

function Assert-DatabaseName {
  param(
    [string]$Value,
    [string]$ParameterName
  )

  if ($Value -notmatch '^[a-zA-Z][a-zA-Z0-9_]{0,62}$') {
    throw "$ParameterName must be a PostgreSQL identifier with at most 63 characters"
  }
}

function Invoke-Docker {
  param([string[]]$Arguments)

  $output = & docker @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw ('docker command failed with exit code {0}: docker {1}' -f $LASTEXITCODE, ($Arguments -join ' '))
  }
  return $output
}

Assert-DatabaseName -Value $SourceDatabase -ParameterName 'SourceDatabase'
Assert-DatabaseName -Value $DatabaseUser -ParameterName 'DatabaseUser'
Assert-DatabaseName -Value $DrillDatabase -ParameterName 'DrillDatabase'
if (-not $DrillDatabase.StartsWith('heymimic_restore_drill_')) {
  throw 'DrillDatabase must start with heymimic_restore_drill_'
}
if ($DrillDatabase -eq $SourceDatabase) {
  throw 'DrillDatabase must differ from SourceDatabase'
}

$backendDirectory = Split-Path -Parent $PSScriptRoot
$workspaceDirectory = Split-Path -Parent $backendDirectory
$runId = [guid]::NewGuid().ToString('N')
if ([string]::IsNullOrWhiteSpace($ArtifactDirectory)) {
  $ArtifactDirectory = Join-Path $backendDirectory "target/restore-drill/$runId"
}
New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
$artifactDirectoryPath = (Resolve-Path -LiteralPath $ArtifactDirectory).Path
$dumpPath = Join-Path $artifactDirectoryPath 'database.dump'
$manifestPath = Join-Path $artifactDirectoryPath 'audio-object-manifest.csv'
$evidencePath = Join-Path $artifactDirectoryPath 'restore-drill-evidence.json'
$containerDumpPath = "/tmp/heymimic-restore-drill-$runId.dump"
$startedAt = [DateTimeOffset]::UtcNow
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$containerId = ''
$drillCreated = $false
$status = 'FAILED'
$validationOutput = @()
$latestMigration = $null

Push-Location $workspaceDirectory
try {
  $containerId = (Invoke-Docker -Arguments @('compose', 'ps', '-q', 'postgres') | Select-Object -First 1)
  if ([string]::IsNullOrWhiteSpace($containerId)) {
    throw 'The Compose postgres container is not running'
  }

  Invoke-Docker -Arguments @(
    'exec', $containerId,
    'pg_dump',
    "--username=$DatabaseUser",
    "--dbname=$SourceDatabase",
    '--format=custom',
    '--no-owner',
    '--no-acl',
    "--file=$containerDumpPath"
  ) | Out-Null
  $containerDumpSource = $containerId + ':' + $containerDumpPath
  Invoke-Docker -Arguments @('cp', $containerDumpSource, $dumpPath) | Out-Null
  if ((Get-Item -LiteralPath $dumpPath).Length -le 0) {
    throw 'pg_dump produced an empty backup artifact'
  }

  Invoke-Docker -Arguments @(
    'exec', $containerId,
    'createdb',
    "--username=$DatabaseUser",
    '--template=template0',
    $DrillDatabase
  ) | Out-Null
  $drillCreated = $true

  Invoke-Docker -Arguments @(
    'exec', $containerId,
    'pg_restore',
    "--username=$DatabaseUser",
    "--dbname=$DrillDatabase",
    '--exit-on-error',
    '--no-owner',
    '--no-acl',
    $containerDumpPath
  ) | Out-Null

  $validationSql = @'
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'flyway_schema_history'
  ) then
    raise exception 'flyway_schema_history is missing';
  end if;
  if exists (select 1 from flyway_schema_history where success = false) then
    raise exception 'restored database contains a failed Flyway migration';
  end if;
  if exists (
    select 1 from speaking_attempts
    where audio_state = 'AVAILABLE'
      and (
        object_version is null
        or checksum is null
        or duration_ms is null
        or retention_until is null
      )
  ) then
    raise exception 'AVAILABLE speaking audio has incomplete sealed metadata';
  end if;
  if exists (
    select 1 from speaking_attempts
    where audio_state = 'AWAITING_UPLOAD'
      and (
        object_version is not null
        or checksum is not null
        or duration_ms is not null
        or retention_until is not null
      )
  ) then
    raise exception 'AWAITING_UPLOAD speaking audio contains sealed metadata';
  end if;
end
$$;

select 'identity_users=' || count(*) from identity_users;
select 'speaking_attempts=' || count(*) from speaking_attempts;
select 'available_audio=' || count(*) from speaking_attempts where audio_state = 'AVAILABLE';
select 'deleted_audio=' || count(*) from speaking_attempts where audio_state = 'DELETED';
select 'failed_final_deliveries=' || count(*)
from platform_event_deliveries where status = 'FAILED_FINAL';
'@
  $validationOutput = Invoke-Docker -Arguments @(
    'exec', $containerId,
    'psql',
    "--username=$DatabaseUser",
    "--dbname=$DrillDatabase",
    '--set=ON_ERROR_STOP=1',
    '--tuples-only',
    '--no-align',
    "--command=$validationSql"
  )

  $latestMigration = (
    Invoke-Docker -Arguments @(
      'exec', $containerId,
      'psql',
      "--username=$DatabaseUser",
      "--dbname=$DrillDatabase",
      '--set=ON_ERROR_STOP=1',
      '--tuples-only',
      '--no-align',
      '--command=select version from flyway_schema_history where success order by installed_rank desc limit 1'
    ) | Select-Object -First 1
  ).Trim()

  $manifest = Invoke-Docker -Arguments @(
    'exec', $containerId,
    'psql',
    "--username=$DatabaseUser",
    "--dbname=$DrillDatabase",
    '--set=ON_ERROR_STOP=1',
    '--csv',
    '--command=select id, object_key, object_version, checksum, size_bytes, mime_type, duration_ms, audio_state, retention_until from speaking_attempts where object_version is not null order by id'
  )
  Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding utf8
  $status = 'PASSED'
} finally {
  $stopwatch.Stop()
  if (-not [string]::IsNullOrWhiteSpace($containerId)) {
    try {
      Invoke-Docker -Arguments @('exec', $containerId, 'rm', '-f', $containerDumpPath) | Out-Null
    } catch {
      Write-Warning "Could not remove temporary dump inside postgres container: $($_.Exception.Message)"
    }
  }

  if ($DropDatabaseAfter -and $drillCreated -and -not [string]::IsNullOrWhiteSpace($containerId)) {
    Invoke-Docker -Arguments @(
      'exec', $containerId,
      'dropdb',
      "--username=$DatabaseUser",
      '--if-exists',
      $DrillDatabase
    ) | Out-Null
  }

  $dumpHash = if (Test-Path -LiteralPath $dumpPath) {
    (Get-FileHash -LiteralPath $dumpPath -Algorithm SHA256).Hash
  } else {
    $null
  }
  $evidence = [ordered]@{
    runId = $runId
    status = $status
    sourceDatabase = $SourceDatabase
    drillDatabase = $DrillDatabase
    drillDatabaseRetained = ($drillCreated -and -not $DropDatabaseAfter)
    startedAt = $startedAt.ToString('O')
    finishedAt = [DateTimeOffset]::UtcNow.ToString('O')
    durationSeconds = [Math]::Round($stopwatch.Elapsed.TotalSeconds, 3)
    dumpSha256 = $dumpHash
    latestFlywayMigration = $latestMigration
    validationOutput = @($validationOutput | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    audioManifest = if (Test-Path -LiteralPath $manifestPath) { $manifestPath } else { $null }
  }
  $evidence | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $evidencePath -Encoding utf8
  Pop-Location
}

Write-Host "Restore drill passed. Evidence: $evidencePath"
if (-not $DropDatabaseAfter) {
  Write-Host "Restored database retained for inspection: $DrillDatabase"
}
