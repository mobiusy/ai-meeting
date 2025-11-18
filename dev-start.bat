@echo off
REM 开发环境启动脚本 (Windows版本)
REM 先启动基础服务，然后提供前后端本地开发选项

echo 开发环境启动脚本
echo ==================
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

echo 步骤1: 启动基础服务 (PostgreSQL, Redis, MinIO)...
docker-compose up -d postgres redis minio

echo.
echo 等待基础服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 基础服务状态:
docker-compose ps postgres redis minio

echo.
echo 步骤2: 开发环境配置
echo 基础服务已启动，可以通过以下方式继续:
echo.
echo 选项A: 本地开发模式 (推荐)
echo   - 后端开发: cd api ^&^& npm run start:dev
echo   - 前端开发: npm run dev
echo.
echo 选项B: Docker模式
echo   - 启动应用服务: docker-compose --profile app up -d
echo.
echo 服务地址:
echo   - PostgreSQL: localhost:5432
echo   - Redis: localhost:6379
echo   - MinIO API: localhost:9000
echo   - MinIO Console: localhost:9001
echo.
echo 开发环境变量已配置在 .env.development 文件中
echo 后端API将连接本地的Docker基础服务
echo.
echo 要停止基础服务，请运行: docker-compose down