param(
    [ValidateRange(1024, 65535)][int]$Port = 4174,
    [string]$SiteRoot = 'civilian-site'
)
$ErrorActionPreference = 'Stop'
$taskRepo = Split-Path -Parent $PSScriptRoot
$taskRoot = if ([System.IO.Path]::IsPathRooted($SiteRoot)) { [System.IO.Path]::GetFullPath($SiteRoot) } else { [System.IO.Path]::GetFullPath((Join-Path $taskRepo $SiteRoot)) }
if (-not $taskRoot.StartsWith($taskRepo + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Preview root must be inside this workspace.'
}
if (-not (Test-Path -LiteralPath (Join-Path $taskRoot 'index.html') -PathType Leaf)) {
    throw "No index.html in preview root: $taskRoot"
}
$taskUrl = "http://127.0.0.1:$Port"
$taskSocket = [System.Net.Sockets.TcpClient]::new()
try {
    $taskConnect = $taskSocket.ConnectAsync('127.0.0.1', $Port)
    try { $taskListener = $taskConnect.Wait(1000) -and $taskSocket.Connected } catch { $taskListener = $false }
} finally { $taskSocket.Dispose() }
if ($taskListener) {
    try { $taskStatus = Invoke-RestMethod -Uri "$taskUrl/__preview/status" -TimeoutSec 3 }
    catch { throw "Port $Port is in use. No existing process was stopped. Choose another port or check the running preview." }
    if ($taskStatus.service -ne 'costin-civilian-preview' -or $taskStatus.root -ne $taskRoot) {
        throw "Port $Port is serving another site. No existing process was stopped."
    }
    Write-Output "Already running: $taskUrl"
    return
}
$taskLogs = Join-Path $taskRepo '.preview-runtime'
New-Item -ItemType Directory -Path $taskLogs -Force | Out-Null
$taskNode = (Get-Command node -ErrorAction Stop).Source
$taskScript = Join-Path $PSScriptRoot 'preview-civilian.mjs'
$taskPreviousRoot = $env:CIVILIAN_PREVIEW_ROOT
$taskPreviousPort = $env:CIVILIAN_PREVIEW_PORT
try {
    $env:CIVILIAN_PREVIEW_ROOT = $taskRoot
    $env:CIVILIAN_PREVIEW_PORT = [string]$Port
    $taskProcess = Start-Process -FilePath $taskNode -ArgumentList ('"' + $taskScript + '"') -WorkingDirectory $taskRepo -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskLogs "$Port.out.log") -RedirectStandardError (Join-Path $taskLogs "$Port.err.log")
} finally {
    $env:CIVILIAN_PREVIEW_ROOT = $taskPreviousRoot
    $env:CIVILIAN_PREVIEW_PORT = $taskPreviousPort
}
for ($taskAttempt = 0; $taskAttempt -lt 30; $taskAttempt++) {
    try {
        $taskStatus = Invoke-RestMethod -Uri "$taskUrl/__preview/status" -TimeoutSec 1
        if ($taskStatus.service -eq 'costin-civilian-preview' -and $taskStatus.root -eq $taskRoot) {
            Write-Output "Preview ready: $taskUrl (PID $($taskProcess.Id))"
            return
        }
    } catch { }
    Start-Sleep -Milliseconds 200
}
throw "Preview did not become ready. Check $taskLogs\$Port.err.log."
