# Instala ou atualiza o Plugin principal "vida-de-bloco" + os 10 Agentes Auxiliares ("levi-motion") no Antigravity deste computador
$ErrorActionPreference = "Stop"

$plugins = @(
    @{ Src = "plugin-vida-de-bloco"; Dst = "vida-de-bloco" },
    @{ Src = "plugin-levi-motion";   Dst = "levi-motion" }
)

foreach ($p in $plugins) {
    $srcPath = Join-Path $PSScriptRoot $p.Src
    $dstPath = Join-Path $HOME ".gemini\config\plugins\$($p.Dst)"
    if (Test-Path $srcPath) {
        New-Item -ItemType Directory -Force -Path $dstPath | Out-Null
        Copy-Item -Path "$srcPath\*" -Destination $dstPath -Recurse -Force
        Write-Host "Plugin/Agentes '$($p.Dst)' instalados com sucesso em: $dstPath" -ForegroundColor Green
    } else {
        Write-Warning "Pasta $($p.Src) não encontrada no repositório."
    }
}
