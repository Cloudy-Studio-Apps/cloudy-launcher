# Installs (or updates) the Cloudy Launcher on Windows, for the current user. No admin needed.
#
# PowerShell:
#   irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1 | iex
#
# Command Prompt (cmd):
#   powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1 | iex"
#
# Remove it (PowerShell):
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1))) -Uninstall
#
# It downloads the latest release's installer, runs it with a progress window (per-user, into
# %LOCALAPPDATA%), and opens the launcher, which updates itself from then on. Works in Windows
# PowerShell 5.1 (built into Windows 10 and 11) and PowerShell 7.
param([switch]$Uninstall)

# Windows PowerShell 5.1 may default to TLS 1.0, which GitHub refuses.
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$Repo = 'Cloudy-Studio-Apps/cloudy-launcher'
$Name = 'Cloudy Launcher'
# Where the NSIS installer registers itself (the launcher reads the same key, src-tauri/src/install.rs).
$UninstallKey = "Software\Microsoft\Windows\CurrentVersion\Uninstall\$Name"

function Step($text) { Write-Host '==> ' -ForegroundColor Cyan -NoNewline; Write-Host $text }
# Stops the install with a message. Not `exit`: run through `irm | iex`, that would close the
# user's PowerShell window.
function Fail($text) { throw $text }

function Find-Installation {
  foreach ($hive in 'HKCU:', 'HKLM:') {
    $key = Get-ItemProperty -Path "$hive\$UninstallKey" -ErrorAction SilentlyContinue
    if ($key -and $key.UninstallString) {
      $dir = Split-Path -Parent ($key.UninstallString.Trim('"'))
      return [pscustomobject]@{
        Version     = $key.DisplayVersion
        Dir         = $dir
        Exe         = Join-Path $dir 'cloudy-launcher.exe'
        Uninstaller = Join-Path $dir 'uninstall.exe'
      }
    }
  }
  return $null
}

function Install-CloudyLauncher {
  # Set here, not at the top: `irm | iex` runs in the user's own session, and these would stay
  # changed in their window afterwards. Inside the function they end with it.
  $ErrorActionPreference = 'Stop'
  # Invoke-WebRequest's progress bar makes downloads many times slower in Windows PowerShell 5.1.
  $ProgressPreference = 'SilentlyContinue'

  if ($Uninstall) {
    $installed = Find-Installation
    if (-not $installed) { Write-Host "$Name isn't installed."; return }
    Step "Removing $Name"
    $process = Start-Process -FilePath $installed.Uninstaller -ArgumentList '/P' -Wait -PassThru
    if ($process.ExitCode -ne 0) { Fail "The uninstaller failed (exit code $($process.ExitCode))." }
    Write-Host "$Name removed. The apps it installed are still there; uninstall them from the launcher first if you want them gone."
    return
  }

  if (-not [Environment]::Is64BitOperatingSystem) {
    Fail 'Only 64-bit Windows builds are published.'
  }

  Step "Looking for the latest $Name"
  # The release's latest.json (the updater's file), not GitHub's API: the API allows only 60
  # requests an hour per IP address without signing in, while release downloads aren't limited.
  try {
    $latest = Invoke-RestMethod -Uri "https://github.com/$Repo/releases/latest/download/latest.json"
  } catch {
    Fail "Couldn't find a published $Name release. Check your connection, or try again later."
  }
  $platform = $latest.platforms.'windows-x86_64-nsis'
  if (-not $platform) { $platform = $latest.platforms.'windows-x86_64' }
  if (-not $platform) { Fail 'The latest release has no Windows installer yet.' }
  $version = $latest.version

  $installed = Find-Installation
  if ($installed -and $installed.Version -eq $version) {
    Step "$Name $version is already installed. Reinstalling it."
  }

  Step "Downloading $Name $version"
  $setup = Join-Path $env:TEMP "cloudy-launcher-$version-setup.exe"
  try {
    Invoke-WebRequest -Uri $platform.url -OutFile $setup -UseBasicParsing
  } catch {
    Fail "The download failed: $($_.Exception.Message)"
  }

  Step 'Installing (a progress window opens; close the launcher first if it is running)'
  # /P: passive, a progress window with no questions. Installs for this user, without admin.
  $process = Start-Process -FilePath $setup -ArgumentList '/P' -Wait -PassThru
  Remove-Item $setup -ErrorAction SilentlyContinue
  if ($process.ExitCode -ne 0) { Fail "The installer failed (exit code $($process.ExitCode))." }

  $installed = Find-Installation
  if (-not $installed -or -not (Test-Path $installed.Exe)) {
    Fail 'The installer finished, but the launcher was not found.'
  }

  Write-Host ''
  Write-Host "$Name $version is installed." -ForegroundColor Green
  Write-Host 'Opening it now. Find it later in the Start menu. It updates itself from now on.'
  Start-Process -FilePath $installed.Exe
}

try {
  Install-CloudyLauncher
} catch {
  Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
