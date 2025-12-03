# AI 会议管理系统

基于 React + TypeScript + NestJS 的现代化会议管理系统，支持会议室预订、用户管理、文件上传等功能。

## 🚀 技术栈

### 前端
- **React 19** + **TypeScript** - 现代化前端框架
- **Vite** - 快速构建工具
- **Ant Design 5** - 企业级UI组件库
- **Tailwind CSS** - 实用优先的CSS框架
- **Zustand** - 轻量级状态管理
- **React Router** - 单页面应用路由

### 后端
- **NestJS 11** - 现代化Node.js框架
- **Prisma 6** - 类型安全的数据库ORM
- **PostgreSQL 17** - 强大的关系型数据库
- **Redis 8** - 高性能缓存服务
- **MinIO** - 兼容S3的对象存储
- **JWT** - 用户认证机制

## 📋 功能特性

### 已实现功能
- ✅ 用户注册、登录、认证系统
- ✅ 会议室管理（CRUD）
- ✅ 会议室预订功能
- ✅ 文件上传和管理
- ✅ 响应式设计
- ✅ 角色权限管理

### 开发中功能
- 🔄 会议管理
- 🔄 日历集成
- 🔄 邮件通知

## 🚀 快速开始

### 环境要求
- Node.js 20+
- Docker & Docker Compose
- Git

### 开发环境启动

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-meeting
```

2. **安装依赖**
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd api && npm install
```

3. **启动服务**

#### 使用 Docker Compose（推荐）
```bash
# 启动所有服务
docker-compose --profile full up -d

# 或者使用快捷脚本
./docker-start.sh full  # Linux/Mac
docker-start.bat full   # Windows
```

#### 手动启动
```bash
# 启动数据库、缓存、对象存储
docker-compose up -d

# 启动后端（在 api 目录）
npm run start:dev

# 启动前端（在项目根目录）
npm run dev
```

### 访问应用
- 前端应用: http://localhost:5177
- 后端API: http://localhost:3002
- MinIO控制台: http://localhost:9001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🐳 Docker Compose 配置

本项目使用 Docker Compose profiles 功能，支持灵活的服务启动方式：

### 服务分类

#### 基础服务（总是启动）
- **postgres**: PostgreSQL 数据库
- **redis**: Redis 缓存
- **minio**: MinIO 对象存储

#### 应用服务（通过 profile 控制）
- **backend**: 后端 API 服务
- **frontend**: 前端应用服务
- **nginx**: Nginx 反向代理

### 使用方式

```bash
# 只启动基础服务（数据库、缓存、对象存储）
docker-compose up -d

# 启动应用服务（后端、前端、Nginx）
docker-compose --profile app up -d

# 启动所有服务
docker-compose --profile full up -d
```

### 快捷脚本

提供了便捷的启动脚本：

```bash
# Linux/Mac
./docker-start.sh base    # 基础服务
./docker-start.sh app     # 应用服务
./docker-start.sh full    # 所有服务

# Windows
docker-start.bat base     # 基础服务
docker-start.bat app      # 应用服务
docker-start.bat full     # 所有服务
```

详细说明请参考 [DOCKER_COMPOSE_GUIDE.md](./DOCKER_COMPOSE_GUIDE.md)

## 🔧 开发指南

### 前端开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run lint         # 运行代码检查
npm run check        # TypeScript 类型检查
```

### 后端开发
```bash
cd api
npm run start:dev    # 启动开发服务器
npm run build        # 构建项目
npm run start        # 启动生产服务器
```

### 数据库操作
```bash
cd api
npx prisma migrate dev    # 运行迁移
npx prisma generate       # 生成客户端
npx prisma studio        # 打开数据库管理界面
```

## 📁 项目结构

```
ai-meeting/
├── src/                  # 前端源代码
│   ├── components/       # 可复用组件
│   ├── pages/           # 页面组件
│   ├── services/        # API 服务
│   ├── stores/          # 状态管理
│   └── types/           # TypeScript 类型定义
├── api/                  # 后端源代码
│   ├── src/
│   │   ├── auth/        # 认证模块
│   │   ├── meeting-rooms/ # 会议室模块
│   │   ├── meetings/    # 会议模块
│   │   ├── upload/      # 文件上传模块
│   │   └── users/       # 用户模块
│   └── prisma/          # 数据库模型和迁移
├── docker-compose.yml    # Docker 服务配置
├── docker-start.sh      # Linux/Mac 启动脚本
├── docker-start.bat     # Windows 启动脚本
└── DOCKER_COMPOSE_GUIDE.md # Docker 配置详细说明
```

## 🔐 环境变量

### 后端环境变量 (.env)
```env
# 数据库
DATABASE_URL="postgresql://postgres:password@localhost:5432/meeting_system?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_URL=redis://localhost:6379

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=meeting-system

# 其他
FRONTEND_URL=http://localhost:3000

# 邮件通知（SMTP）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=change-me
SMTP_SECURE=false
NOTIFY_FROM_EMAIL=noreply@example.com

# 会议审批阈值
APPROVAL_THRESHOLD=20
```

### 前端环境变量 (.env)
```env
VITE_API_BASE_URL=http://localhost:3002/api
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 📞 支持

如有问题或建议，请通过以下方式联系：
- 创建 Issue
- 发送邮件
- 提交 Pull Request

---

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**
