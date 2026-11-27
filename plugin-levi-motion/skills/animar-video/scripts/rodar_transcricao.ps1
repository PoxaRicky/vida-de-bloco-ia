param(
  [Parameter(Mandatory = $true)]
  [string]$AudioPath,

  [Parameter(Mandatory = $true)]
  [string]$OutPath,

  [string]$Model = "large-v3-turbo",
  [string]$Language = "pt"
)

$ErrorActionPreference = "Stop"
$scriptPy = Join-Path $PSScriptRoot "transcrever_voz.py"
$uvLocal = Join-Path $env:USERPROFILE ".local\bin\uv.exe"
$uvCmd = if (Test-Path $uvLocal) { $uvLocal } else { (Get-Command uv -ErrorAction SilentlyContinue).Source }
$editorVideoDir = Join-Path $env:USERPROFILE ".gemini\config\skills\editor-video"
$editorPyproject = Join-Path $editorVideoDir "pyproject.toml"

if ($uvCmd -and (Test-Path $editorPyproject)) {
  & $uvCmd run --directory $editorVideoDir python $scriptPy --audio $AudioPath --out $OutPath --model $Model --language $Language
  exit $LASTEXITCODE
}

if ($uvCmd) {
  & $uvCmd run --with faster-whisper python $scriptPy --audio $AudioPath --out $OutPath --model $Model --language $Language
  exit $LASTEXITCODE
}

python $scriptPy --audio $AudioPath --out $OutPath --model $Model --language $Language
exit $LASTEXITCODE
