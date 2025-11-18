#!/bin/bash

# Docker Compose 启动脚本
# 根据参数选择启动不同的服务组合

echo "Docker Compose 启动脚本"
echo "========================"
echo ""
echo "使用方法:"
echo "  ./docker-start.sh [选项]"
echo ""
echo "选项:"
echo "  base     - 只启动基础服务 (PostgreSQL, Redis, MinIO)"
echo "  app      - 只启动应用服务 (Backend, Frontend, Nginx)"
echo "  full     - 启动所有服务"
echo "  help     - 显示帮助信息"
echo ""

# 如果没有参数，默认启动基础服务
if [ $# -eq 0 ]; then
    echo "未指定参数，默认启动基础服务..."
    docker-compose up -d
    exit 0
fi

case "$1" in
    base)
        echo "正在启动基础服务 (PostgreSQL, Redis, MinIO)..."
        docker-compose up -d
        ;;
    app)
        echo "正在启动应用服务 (Backend, Frontend, Nginx)..."
        docker-compose --profile app up -d
        ;;
    full)
        echo "正在启动所有服务..."
        docker-compose --profile full up -d
        ;;
    help)
        echo "帮助信息已显示在上面"
        ;;
    *)
        echo "错误: 未知选项 '$1'"
        echo "请使用 './docker-start.sh help' 查看帮助信息"
        exit 1
        ;;
esac

echo ""
echo "启动命令执行完成！"
echo "可以使用 'docker-compose ps' 查看服务状态"
echo "可以使用 'docker-compose logs -f [服务名]' 查看日志"