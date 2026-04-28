# OpenAgent one-step install (Windows PowerShell): pull and run the all-in-one Docker image.
# Usage (run only if you trust this script source):
#   irm https://raw.githubusercontent.com/the-open-agent/openagent/master/scripts/install.ps1 | iex
#
# Optional environment variables: same as scripts/install.sh (OPENAGENT_*, MYSQL_ROOT_PASSWORD, OPENAGENT_FORCE)

$ErrorActionPreference = 'Stop'

$OpenAgentImage = if ($env:OPENAGENT_IMAGE) { $env:OPENAGENT_IMAGE } else { 'casbin/openagent-all-in-one' }
$OpenAgentTag = if ($env:OPENAGENT_TAG) { $env:OPENAGENT_TAG } else { 'latest' }
$OpenAgentPort = if ($env:OPENAGENT_PORT) { [int]$env:OPENAGENT_PORT } else { 14000 }
$OpenAgentContainerName = if ($env:OPENAGENT_CONTAINER_NAME) { $env:OPENAGENT_CONTAINER_NAME } else { 'openagent' }
$MysqlRootPassword = if ($env:MYSQL_ROOT_PASSWORD) { $env:MYSQL_ROOT_PASSWORD } else { '123456' }
$OpenAgentForce = if ($env:OPENAGENT_FORCE -eq '1') { $true } else { $false }

$ContainerHttpPort = 14000
$FullImage = "${OpenAgentImage}:${OpenAgentTag}"

function Test-DockerAvailable {
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) {
        throw 'docker not found. Install and start Docker Desktop for Windows.'
    }
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker is not running or not accessible. Start Docker Desktop.'
    }
}

Test-DockerAvailable

$existing = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq $OpenAgentContainerName }
if ($existing) {
    if ($OpenAgentForce) {
        Write-Host "[openagent] Removing existing container: $OpenAgentContainerName"
        docker rm -f $OpenAgentContainerName | Out-Null
    }
    else {
        throw "Container $OpenAgentContainerName already exists. Remove it, set OPENAGENT_CONTAINER_NAME, or OPENAGENT_FORCE=1."
    }
}

Write-Host "Pulling image $FullImage ..."
docker pull $FullImage

Write-Host "Starting container $OpenAgentContainerName (first start may take tens of seconds for DB init) ..."
docker run -d `
    --name $OpenAgentContainerName `
    --restart unless-stopped `
    -p "${OpenAgentPort}:${ContainerHttpPort}" `
    -e "MYSQL_ROOT_PASSWORD=$MysqlRootPassword" `
    $FullImage

Write-Host ""
Write-Host "OpenAgent is running."
Write-Host "  Web UI:  http://127.0.0.1:$OpenAgentPort/"
Write-Host "  Logs:     docker logs -f $OpenAgentContainerName"
Write-Host "  Stop:     docker rm -f $OpenAgentContainerName"
Write-Host ""
