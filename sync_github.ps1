param(
    [string]$Mensagem = "chore: atualizacao automatica do projeto"
)

git pull origin main --rebase
git add .
$status = git status --porcelain
if ($status) {
    git commit -m $Mensagem
    git push origin main
    Write-Host "Alteracoes enviadas para o GitHub com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Nenhuma alteracao nova para enviar." -ForegroundColor Yellow
}
