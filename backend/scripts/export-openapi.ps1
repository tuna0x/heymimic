$ErrorActionPreference = 'Stop'

$backendDirectory = Split-Path -Parent $PSScriptRoot
$wrapper = Join-Path $backendDirectory 'mvnw.cmd'
$generated = Join-Path $backendDirectory 'target/generated-openapi/openapi.json'
$committedDirectory = Join-Path $backendDirectory 'openapi'
$committed = Join-Path $committedDirectory 'openapi.json'

Push-Location $backendDirectory
try {
  & $wrapper '-Dtest=OpenApiContractTest' '-Dheymimic.openapi.update=true' test
  if ($LASTEXITCODE -ne 0) {
    throw "OpenAPI contract generation failed with exit code $LASTEXITCODE"
  }
} finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path $committedDirectory | Out-Null
Copy-Item -LiteralPath $generated -Destination $committed -Force
Write-Host "Exported $committed"
