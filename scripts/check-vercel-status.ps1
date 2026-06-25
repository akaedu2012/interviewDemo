# Vercel 部署状态检查脚本
# 用途：检查当前 Vercel 部署状态

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Vercel 部署状态检查" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了 Vercel CLI
Write-Host "[1/5] 检查 Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "✗ Vercel CLI 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "安装方法：" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor White
    Write-Host ""
    Write-Host "或者直接访问 Vercel Dashboard：" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/dashboard" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ Vercel CLI 已安装" -ForegroundColor Green
Write-Host ""

# 检查登录状态
Write-Host "[2/5] 检查登录状态..." -ForegroundColor Yellow
$loginCheck = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 未登录 Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先登录：" -ForegroundColor Yellow
    Write-Host "  vercel login" -ForegroundColor White
    Write-Host ""
    Write-Host "如果网络问题无法登录，请访问：" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/dashboard" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ 已登录为: $loginCheck" -ForegroundColor Green
Write-Host ""

# 获取最新部署
Write-Host "[3/5] 获取部署列表..." -ForegroundColor Yellow
$deployments = vercel ls --json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 无法获取部署列表" -ForegroundColor Red
    Write-Host ""
    Write-Host "请访问 Vercel Dashboard：" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/dashboard" -ForegroundColor Cyan
    exit 1
}

# 解析 JSON
try {
    $deploymentsData = $deployments | ConvertFrom-Json
    $totalDeployments = $deploymentsData.deployments.Count
    
    Write-Host "✓ 找到 $totalDeployments 个部署" -ForegroundColor Green
    Write-Host ""
    
    # 统计各状态的部署数量
    Write-Host "[4/5] 统计部署状态..." -ForegroundColor Yellow
    $statusCount = @{}
    
    foreach ($deployment in $deploymentsData.deployments) {
        $state = $deployment.state
        if ($statusCount.ContainsKey($state)) {
            $statusCount[$state]++
        } else {
            $statusCount[$state] = 1
        }
    }
    
    # 显示统计结果
    foreach ($status in $statusCount.Keys | Sort-Object) {
        $count = $statusCount[$status]
        $color = switch ($status) {
            "READY" { "Green" }
            "BUILDING" { "Yellow" }
            "ERROR" { "Red" }
            "QUEUED" { "Yellow" }
            "CANCELED" { "Gray" }
            default { "White" }
        }
        Write-Host "  $status : $count" -ForegroundColor $color
    }
    Write-Host ""
    
    # 显示最新的5个部署
    Write-Host "[5/5] 最新部署记录..." -ForegroundColor Yellow
    Write-Host ""
    
    $latestDeployments = $deploymentsData.deployments | Select-Object -First 5
    
    foreach ($deployment in $latestDeployments) {
        $state = $deployment.state
        $url = $deployment.url
        $created = $deployment.created
        $createdDate = [DateTimeOffset]::FromUnixTimeMilliseconds($created).LocalDateTime.ToString("yyyy-MM-dd HH:mm:ss")
        
        $statusSymbol = switch ($state) {
            "READY" { "✓" }
            "BUILDING" { "⏳" }
            "ERROR" { "✗" }
            "QUEUED" { "⏸" }
            "CANCELED" { "⊗" }
            default { "?" }
        }
        
        $color = switch ($state) {
            "READY" { "Green" }
            "BUILDING" { "Yellow" }
            "ERROR" { "Red" }
            "QUEUED" { "Yellow" }
            "CANCELED" { "Gray" }
            default { "White" }
        }
        
        Write-Host "$statusSymbol " -ForegroundColor $color -NoNewline
        Write-Host "$state" -ForegroundColor $color -NoNewline
        Write-Host " | " -NoNewline
        Write-Host "$createdDate" -ForegroundColor White -NoNewline
        Write-Host " | " -NoNewline
        Write-Host "https://$url" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 检查是否有构建中的部署
    $building = $deploymentsData.deployments | Where-Object { $_.state -eq "BUILDING" }
    if ($building) {
        Write-Host "⏳ 有 $($building.Count) 个部署正在构建中" -ForegroundColor Yellow
        Write-Host "   请稍等片刻后再次运行此脚本" -ForegroundColor Yellow
    }
    
    # 检查是否有失败的部署
    $errors = $deploymentsData.deployments | Where-Object { $_.state -eq "ERROR" }
    if ($errors) {
        Write-Host "✗ 有 $($errors.Count) 个部署失败" -ForegroundColor Red
        Write-Host "   运行清理脚本: .\scripts\cleanup-vercel.ps1" -ForegroundColor Yellow
    }
    
    # 检查是否有成功的部署
    $ready = $deploymentsData.deployments | Where-Object { $_.state -eq "READY" }
    if ($ready) {
        Write-Host "✓ 有 $($ready.Count) 个部署成功" -ForegroundColor Green
        $latestReady = $ready | Select-Object -First 1
        Write-Host "   最新成功部署: https://$($latestReady.url)" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "✗ 解析部署数据失败" -ForegroundColor Red
    Write-Host "错误: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请访问 Vercel Dashboard：" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/dashboard" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "  • 查看详细日志：vercel logs [deployment-url]" -ForegroundColor White
Write-Host "  • 访问 Dashboard：https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  • 清理失败部署：.\scripts\cleanup-vercel.ps1" -ForegroundColor White
Write-Host "=====================================" -ForegroundColor Cyan
