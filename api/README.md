# 企业级会议系统后端

基于 NestJS 11 + Prisma 6 + PostgreSQL 17 + Redis 8 构建的企业级会议预约管理系统后端API。

## 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL 17.x
- **ORM**: Prisma 6.x
- **缓存**: Redis 8.x
- **认证**: JWT + Passport
- **文件存储**: MinIO (兼容S3)
- **API文档**: Swagger/OpenAPI

## 快速开始

### 1. 安装依赖

```bash
cd api
npm install
```

### 2. 数据库设置

确保 PostgreSQL 和 Redis 服务已启动，然后运行：

```bash
# 生成 Prisma 客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate
```

### 3. 启动开发服务器

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

API 文档地址: http://localhost:3001/api/docs

## 项目结构

```
api/
├── src/
│   ├── auth/          # 认证模块
│   ├── users/         # 用户管理
│   ├── meeting-rooms/ # 会议室管理
│   ├── meetings/      # 会议管理
│   ├── upload/        # 文件上传
│   ├── health/        # 健康检查
│   └── prisma/        # 数据库连接
├── prisma/
│   └── schema.prisma  # 数据库模式
└── test/              # 测试文件
```

## API端点

- `POST /auth/login` - 用户登录
- `GET /health` - 健康检查
- `GET /users` - 用户管理
- `GET /meeting-rooms` - 会议室管理
- `GET /meetings` - 会议管理

## 环境变量

复制 `.env.example` 为 `.env` 并配置相关参数。