# Vercel 部署批量删除脚本（PowerShell）
# 用于批量删除失败的、队列中的和取消的 Vercel 部署

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
Write-Host "此脚本将删除以下状态的部署:" -ForegroundColor Yellow
Write-Host "  - ERROR (构建失败)" -ForegroundColor Red
Write-Host "  - QUEUED (队列中)" -ForegroundColor Yellow
Write-Host "  - CANCELED (已取消)" -ForegroundColor Gray
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

# 统计
$deleted = 0
$failed = 0
$errorCount = 0
$queuedCount = 0
$canceledCount = 0

$deployments | ForEach-Object {
    $line = $_.ToString()
    
    # 查找包含 ERROR 的行
    if ($line -match "Error.*?(https://[^\s]+)") {
        $url = $matches[1]
        $errorCount++
        
        Write-Host "🗑️  删除 [ERROR]: $url" -ForegroundColor Red
        
        try {
            vercel rm $url --yes 2>&1 | Out-Null
            Write-Host "   ✅ 已删除" -ForegroundColor Green
            $deleted++
        } catch {
            Write-Host "   ❌ 删除失败" -ForegroundColor Red
            $failed++
        }
    }
    # 查找包含 Queued 的行
    elseif ($line -match "Queued.*?(https://[^\s]+)") {
        $url = $matches[1]
        $queuedCount++
        
        Write-Host "🗑️  删除 [QUEUED]: $url" -ForegroundColor Yellow
        
        try {
            vercel rm $url --yes 2>&1 | Out-Null
            Write-Host "   ✅ 已删除" -ForegroundColor Green
            $deleted++
        } catch {
            Write-Host "   ❌ 删除失败" -ForegroundColor Red
            $failed++
        }
    }
    # 查找包含 Canceled 的行
    elseif ($line -match "Canceled.*?(https://[^\s]+)") {
        $url = $matches[1]
        $canceledCount++
        
        Write-Host "🗑️  删除 [CANCELED]: $url" -ForegroundColor Gray
        
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
Write-Host "   发现的问题部署:" -ForegroundColor White
Write-Host "     - ERROR: $errorCount" -ForegroundColor Red
Write-Host "     - QUEUED: $queuedCount" -ForegroundColor Yellow
Write-Host "     - CANCELED: $canceledCount" -ForegroundColor Gray
Write-Host ""
Write-Host "   清理结果:" -ForegroundColor White
Write-Host "     - 成功删除: $deleted" -ForegroundColor Green
Write-Host "     - 删除失败: $failed" -ForegroundColor Red
Write-Host ""

if ($deleted -gt 0) {
    Write-Host "✨ 清理成功！建议刷新 Vercel Dashboard 查看最新状态。" -ForegroundColor Green
} else {
    Write-Host "💡 没有找到需要清理的部署。" -ForegroundColor Cyan
}
Write-Host ""
