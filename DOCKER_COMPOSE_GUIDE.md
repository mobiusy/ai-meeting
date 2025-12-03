# Docker Compose 配置说明

本项目的 Docker Compose 配置支持通过 profiles 控制服务的启动方式。

## 服务分类

### 基础服务（总是启动）
这些服务是系统运行的基础，无论使用哪种 profile 都会启动：
- **postgres**: PostgreSQL 数据库
- **redis**: Redis 缓存
- **minio**: MinIO 对象存储

### 应用服务（通过 profile 控制）
这些服务可以通过 profile 参数控制是否启动：
- **backend**: 后端 API 服务
- **frontend**: 前端应用服务  
- **nginx**: Nginx 反向代理

## 使用方法

### 1. 只启动基础服务
适用于只需要数据库、缓存和对象存储的场景：
```bash
docker-compose up -d
```

### 2. 启动全部服务（包括应用服务）
适用于完整应用部署：
```bash
docker-compose --profile full up -d
```

### 3. 只启动应用服务（不包含基础服务）
适用于基础服务已经运行，只需要启动应用服务的场景：
```bash
docker-compose --profile app up -d
```

### 4. 组合使用
也可以同时指定多个 profile：
```bash
docker-compose --profile app --profile full up -d
```

## 常用命令

### 查看服务状态
```bash
docker-compose ps
```

### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止特定 profile 的服务
docker-compose --profile app down
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
```

### 重新构建服务
```bash
# 重新构建所有服务
docker-compose build

# 重新构建特定服务
docker-compose build backend
```

## 端口映射

- PostgreSQL: 5432
- Redis: 6379
- MinIO API: 9000
- MinIO Console: 9001
- Backend API: 3001
- Frontend: 3000
- Nginx: 80

## 环境变量

基础服务使用默认配置，应用服务的环境变量可以在 docker-compose.yml 文件中修改。

### 应用服务环境变量清单

后端（backend）支持以下环境变量：
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `FRONTEND_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`（`true`/`false`）
- `NOTIFY_FROM_EMAIL`
- `APPROVAL_THRESHOLD`（超过该人数需审批）

## 数据持久化

所有基础服务的数据都会持久化到 Docker volumes：
- postgres_data: PostgreSQL 数据
- redis_data: Redis 数据
- minio_data: MinIO 对象存储数据
