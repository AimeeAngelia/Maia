@echo off
echo 启动洛谷论坛系统...
echo.

echo 1. 启动后端服务器...
cd /d "%~dp0backend"
start "后端服务器" cmd /k "npm start"

echo 2. 等待后端启动...
timeout /t 3 /nobreak > nul

echo 3. 启动前端开发服务器...
cd /d "%~dp0"
start "前端开发服务器" cmd /k "npm run dev"

echo.
echo 启动完成！
echo 后端 API: http://localhost:3001
echo 前端页面: http://localhost:4321/forum
echo.
pause
