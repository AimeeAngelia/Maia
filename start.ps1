# 洛谷论坛系统启动脚本
Write-Host "启动洛谷论坛系统..." -ForegroundColor Green
Write-Host ""

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    Write-Host "1. 启动后端服务器..." -ForegroundColor Yellow
    $BackendDir = Join-Path $ScriptDir "backend"
    
    # 检查后端目录是否存在
    if (Test-Path $BackendDir) {
        # 启动后端服务器
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; npm start" -WindowStyle Normal
        Write-Host "   后端服务器已启动" -ForegroundColor Green
    }
    else {
        Write-Host "   错误: 找不到后端目录" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "2. 等待后端启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Write-Host "3. 启动前端开发服务器..." -ForegroundColor Yellow
    # 启动前端开发服务器
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir'; npm run dev" -WindowStyle Normal
    Write-Host "   前端开发服务器已启动" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "启动完成！" -ForegroundColor Green
    Write-Host "后端 API: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "前端页面: http://localhost:4321/forum" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "按任意键继续..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
}
catch {
    Write-Host "启动过程中发生错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
