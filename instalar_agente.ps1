# Instala ou atualiza o Plugin/Agente global "vida-de-bloco" no Antigravity deste computador
$ErrorActionPreference = "Stop"
$pluginDst = Join-Path $HOME ".gemini\config\plugins\vida-de-bloco"
$pluginSrc = Join-Path $PSScriptRoot "plugin-vida-de-bloco"

if (-not (Test-Path $pluginSrc)) {
    Write-Error "Pasta plugin-vida-de-bloco nao encontrada no repositorio."
    exit 1
}

New-Item -ItemType Directory -Force -Path $pluginDst | Out-Null
Copy-Item -Path "$pluginSrc\*" -Destination $pluginDst -Recurse -Force
Write-Host "Plugin e Agente 'vida-de-bloco' instalados com sucesso em: $pluginDst" -ForegroundColor Green
