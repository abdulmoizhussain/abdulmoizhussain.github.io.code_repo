$ErrorActionPreference = 'Stop'
$sourceRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$publishRoot = [IO.Path]::GetFullPath((Join-Path $sourceRoot 'file-to-publish'))
if ((Split-Path $publishRoot -Parent) -ne $sourceRoot -or (Split-Path $publishRoot -Leaf) -ne 'file-to-publish') {
    throw 'The publish folder must be file-to-publish inside this project.'
}
if (Test-Path -LiteralPath $publishRoot) {
    if ((Get-Item -LiteralPath $publishRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw 'The publish folder must not be a symbolic link or junction.'
    }
    Remove-Item -LiteralPath $publishRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $publishRoot | Out-Null
$files = @('index.html', '404.html', 'favicon.ico', '.nojekyll', 'service-worker.js')
$folders = @('assets', 'laundry', 'url_converters', 'rgb_to_hex', 'counter', 'render_markdown', 'percentage')
foreach ($item in ($files + $folders)) {
    Copy-Item -LiteralPath (Join-Path $sourceRoot $item) -Destination $publishRoot -Recurse -Force
}
