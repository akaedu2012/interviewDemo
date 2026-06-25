# Vercel 部署批量删除脚本（PowerShell）
# 用于批量删除失败的 Vercel 部署

Write-Host "🧹 Vercel 部署清理工具" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了 Vercel CLI
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI 版本: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未安装 Vercel CLI" -ForegroundColor Red
    Write-Host "   请运行: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "⚠️  此脚本将删除所有失败（ERROR）的部署" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "是否继续？(y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📋 获取部署列表..." -ForegroundColor Cyan

# 获取部署列表
$deployments = vercel ls --yes 2>&1

# 解析并删除失败的部署
$deleted = 0
$failed = 0

$deployments | ForEach-Object {
    $line = $_.ToString()
    
    # 查找包含 ERROR 的行
    if ($line -match "Error.*?(https://[^\s]+)") {
        $url = $matches[1]
        
        Write-Host "🗑️  删除: $url" -ForegroundColor Yellow
        
        try {
            vercel rm $url --yes 2>&1 | Out-Null
            Write-Host "   ✅ 已删除" -ForegroundColor Green
            $deleted++
        } catch {
            Write-Host "   ❌ 删除失败" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "📊 清理完成:" -ForegroundColor Cyan
Write-Host "   成功删除: $deleted" -ForegroundColor Green
Write-Host "   删除失败: $failed" -ForegroundColor Red
Write-Host ""
