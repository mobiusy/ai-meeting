#!/bin/bash

# 完整的开发环境启动脚本
# 自动启动基础服务并提供后端/前端开发选项

echo "完整的开发环境启动脚本"
echo "====================="
echo ""

# 检查是否已安装docker和docker-compose
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未安装 docker-compose"
    exit 1
fi

echo "步骤1: 检查基础服务状态..."

# 检查基础服务是否已经在运行
POSTGRES_STATUS=$(docker-compose ps postgres --status 2>/dev/null | grep -q "running" && echo "running" || echo "stopped")
REDIS_STATUS=$(docker-compose ps redis --status 2>/dev/null | grep -q "running" && echo "running" || echo "stopped")
MINIO_STATUS=$(docker-compose ps minio --status 2>/dev/null | grep -q "running" && echo "running" || echo "stopped")

if [ "$POSTGRES_STATUS" = "running" ] && [ "$REDIS_STATUS" = "running" ] && [ "$MINIO_STATUS" = "running" ]; then
    echo "✅ 基础服务已在运行中"
else
    echo "步骤1: 启动基础服务 (PostgreSQL, Redis, MinIO)..."
    docker-compose up -d postgres redis minio
    
    echo ""
    echo "等待基础服务启动..."
    sleep 5
fi

echo ""
echo "步骤2: 基础服务状态"
docker-compose ps postgres redis minio

echo ""
echo "步骤3: 登录信息"
echo ""
echo "系统已预置管理员账号:"
echo "邮箱: admin@example.com"
echo "密码: admin123"
echo "角色: ADMIN"
echo ""
echo "步骤4: 开发环境选项"
echo ""
echo "请选择开发模式:"
echo "1) 启动后端开发服务器 (npm run start:dev)"
echo "2) 启动前端开发服务器 (npm run dev)"
echo "3) 显示使用说明"
echo "4) 退出"
echo ""

read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "启动后端开发服务器..."
        echo "命令: cd api && npm run start:dev"
        echo ""
        cd api && npm run start:dev
        ;;
    2)
        echo ""
        echo "启动前端开发服务器..."
        echo "命令: npm run dev"
        echo ""
        npm run dev
        ;;
    3)
    echo ""
    echo "使用说明:"
    echo "========="
    echo ""
    echo "✅ 基础服务已在Docker中运行:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - MinIO API: localhost:9000"
    echo "  - MinIO Console: localhost:9001"
    echo ""
    echo "🔑 登录信息:"
    echo "  邮箱: admin@example.com"
    echo "  密码: admin123"
    echo "  角色: ADMIN"
    echo ""
    echo "🚀 手动启动:"
    echo "  后端: cd api && npm run start:dev"
    echo "  前端: npm run dev"
    echo ""
    echo "📍 访问地址:"
    echo "  API文档: http://localhost:3001/api/docs"
    echo "  前端应用: http://localhost:3000"
        ;;
    4)
        echo "退出脚本"
        exit 0
        ;;
    *)
        echo "错误: 无效选项 '$choice'"
        echo "请重新运行脚本并选择 1-4"
        exit 1
        ;;
esac