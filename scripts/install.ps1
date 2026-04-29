# OpenAgent one-step install (Windows PowerShell): download the release binary for your platform.
# Usage (run only if you trust this script source):
#   irm https://raw.githubusercontent.com/the-open-agent/openagent/master/scripts/install.ps1 | iex
#
# Optional environment variables:
#   OPENAGENT_VERSION   e.g. v1.777.3  (default: latest release)
#   INSTALL_DIR         installation directory (default: $env:LOCALAPPDATA\openagent)

$ErrorActionPreference = 'Stop'

$Repo    = 'the-open-agent/openagent'
$Version = if ($env:OPENAGENT_VERSION) { $env:OPENAGENT_VERSION } else { 'latest' }
$InstallDir = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { "$env:LOCALAPPDATA\openagent" }

function Write-Info { param([string]$Msg) Write-Host $Msg }
function Write-Err  { param([string]$Msg) Write-Host "[openagent] $Msg" -ForegroundColor Red }

# ── resolve version ────────────────────────────────────────────────────────────
if ($Version -eq 'latest') {
    Write-Info 'Fetching latest release version...'
    $release = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
    $Version = $release.tag_name
    if (-not $Version) { throw 'Failed to fetch latest version from GitHub API.' }
}
Write-Info "Installing openagent $Version"

# ── detect arch ───────────────────────────────────────────────────────────────
$Arch = (Get-CimInstance Win32_Processor).Architecture
# 0=x86, 5=ARM, 9=x86-64, 12=ARM64
$ArchName = switch ($Arch) {
    9  { 'x86_64' }
    12 { 'arm64' }
    default { throw "Unsupported architecture ($Arch). Download manually from https://github.com/$Repo/releases" }
}

$Filename = "openagent_Windows_${ArchName}.zip"
$Url      = "https://github.com/$Repo/releases/download/$Version/$Filename"

# ── download & extract ─────────────────────────────────────────────────────────
$TmpDir = Join-Path $env:TEMP "openagent_install_$(Get-Random)"
New-Item -ItemType Directory -Path $TmpDir | Out-Null

try {
    $ZipPath = Join-Path $TmpDir $Filename
    Write-Info "Downloading $Url ..."
    Invoke-WebRequest -Uri $Url -OutFile $ZipPath -UseBasicParsing

    Write-Info 'Extracting...'
    Expand-Archive -Path $ZipPath -DestinationPath $TmpDir -Force

    $Binary = Get-ChildItem -Path $TmpDir -Filter 'openagent.exe' -Recurse | Select-Object -First 1
    if (-not $Binary) { throw 'openagent.exe not found in archive.' }

    # ── install ────────────────────────────────────────────────────────────────
    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir | Out-Null
    }
    Copy-Item -Path $Binary.FullName -Destination "$InstallDir\openagent.exe" -Force
}
finally {
    Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
}

# ── add to PATH for this session and persistently for the user ─────────────────
$UserPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')
if ($UserPath -notlike "*$InstallDir*") {
    [System.Environment]::SetEnvironmentVariable('PATH', "$UserPath;$InstallDir", 'User')
    $env:PATH = "$env:PATH;$InstallDir"
    Write-Info "Added $InstallDir to your PATH."
}

Write-Info ''
Write-Info "openagent $Version installed to $InstallDir\openagent.exe"
Write-Info ''
Write-Info 'Next steps:'
Write-Info '  1. Edit conf/app.conf to point to your MySQL/MariaDB database.'
Write-Info '  2. Run: openagent serve'
Write-Info '  3. Open:  http://127.0.0.1:14000/'
Write-Info ''
Write-Info "For more information visit https://github.com/$Repo"
Write-Info ''
