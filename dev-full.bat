@echo off
REM 完整的开发环境启动脚本 (Windows版本)
REM 自动启动基础服务并提供后端/前端开发选项

echo 完整的开发环境启动脚本
echo =====================
echo.

REM 检查是否已安装docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未安装 Docker
    exit /b 1
)

REM 检查是否已安装docker-compose
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未安装 docker-compose
    exit /b 1
)

echo 步骤1: 检查基础服务状态...

REM 检查基础服务是否已经在运行
docker-compose ps postgres | findstr "running" >nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL 已在运行中
) else (
    echo 正在启动 PostgreSQL...
)

docker-compose ps redis | findstr "running" >nul
if %errorlevel% equ 0 (
    echo ✅ Redis 已在运行中
) else (
    echo 正在启动 Redis...
)

docker-compose ps minio | findstr "running" >nul
if %errorlevel% equ 0 (
    echo ✅ MinIO 已在运行中
) else (
    echo 正在启动 MinIO...
)

echo 正在启动基础服务...
docker-compose up -d postgres redis minio

echo.
echo 等待基础服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 步骤2: 基础服务状态
docker-compose ps postgres redis minio

echo.
echo 步骤3: 开发环境选项
echo.
echo 请选择开发模式:
echo 1) 启动后端开发服务器 (npm run start:dev)
echo 2) 启动前端开发服务器 (npm run dev)
echo 3) 显示使用说明
echo 4) 退出
echo.

set /p choice=请输入选项 (1-4): 

if "%choice%"=="1" (
    echo.
    echo 启动后端开发服务器...
    echo 命令: cd api ^&^& npm run start:dev
    echo.
    cd api && npm run start:dev
) else if "%choice%"=="2" (
    echo.
    echo 启动前端开发服务器...
    echo 命令: npm run dev
    echo.
    npm run dev
) else if "%choice%"=="3" (
    echo.
    echo 使用说明:
    echo =========
    echo.
    echo 基础服务已在Docker中运行:
    echo   - PostgreSQL: localhost:5432
    echo   - Redis: localhost:6379
    echo   - MinIO API: localhost:9000
    echo   - MinIO Console: localhost:9001
    echo.
    echo 手动启动后端: cd api ^&^& npm run start:dev
    echo 手动启动前端: npm run dev
    echo.
    echo API文档: http://localhost:3001/api/docs
    echo 前端应用: http://localhost:3000
) else if "%choice%"=="4" (
    echo 退出脚本
    exit /b 0
) else (
    echo 错误: 无效选项 '%choice%'
    echo 请重新运行脚本并选择 1-4
    exit /b 1
)