# 开发环境使用指南

本指南介绍如何使用Docker启动基础服务，然后通过本地开发模式运行前后端服务，提高开发效率。

## 🚀 快速开始

### 1. 启动基础服务

使用开发启动脚本一键启动基础服务：

```bash
# Linux/Mac
./dev-start.sh

# Windows
dev-start.bat
```

这个脚本会启动以下基础服务：
- **PostgreSQL** (端口: 5432)
- **Redis** (端口: 6379)  
- **MinIO** (API端口: 9000, 控制台端口: 9001)

### 2. 本地开发模式启动

基础服务启动后，在**两个独立的终端窗口**中分别运行：

#### 后端开发
```bash
cd api
npm install      # 首次运行需要安装依赖
npm run start:dev # 启动后端开发服务器
```

#### 前端开发
```bash
npm install  # 首次运行需要安装依赖
npm run dev  # 启动前端开发服务器
```

### 3. 登录系统

前端启动后，访问 http://localhost:3000 并使用以下账号登录：

**管理员账号**: 
- 邮箱: `admin@example.com`
- 密码: `admin123`
- 角色: ADMIN

更多账号信息请参考 `LOGIN_INFO.md` 文件。

## 📋 开发环境配置

### 环境变量

开发环境使用 `.env.development` 文件配置：

```env
# 数据库连接
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meeting_system
DB_USER=postgres
DB_PASSWORD=password

# Redis连接
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO对象存储
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# 服务端口
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

### 服务地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | React开发服务器 |
| 后端API | http://localhost:3001 | NestJS开发服务器 |
| PostgreSQL | localhost:5432 | 数据库 |
| Redis | localhost:6379 | 缓存 |
| MinIO API | http://localhost:9000 | 对象存储 |
| MinIO控制台 | http://localhost:9001 | 文件管理界面 |
| API文档 | http://localhost:3001/api/docs | Swagger文档 |

## 🔧 开发工作流

### 典型开发流程

1. **启动基础服务**: 运行 `./dev-start.sh` (只需一次)
2. **启动后端服务**: `cd api && npm run dev`
3. **启动前端服务**: `npm run dev` (在新终端)
4. **开始开发**: 修改代码，服务会自动热重载

### 数据库操作

```bash
# 进入API目录
cd api

# 运行数据库迁移
npm run db:migrate

# 生成Prisma客户端
npm run db:generate

# 重置数据库
npm run db:reset
```

### 查看日志

```bash
# 查看基础服务日志
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f minio

# 查看所有服务状态
docker-compose ps
```

## 🛠️ 常用命令

### 基础服务管理
```bash
# 启动基础服务
docker-compose up -d postgres redis minio

# 停止基础服务
docker-compose down

# 重启基础服务
docker-compose restart postgres redis minio
```

### 开发服务器管理
```bash
# 后端开发服务器
cd api
npm run start:dev  # 启动开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产服务器

# 前端开发服务器
npm run dev     # 启动开发服务器
npm run build   # 构建生产版本
npm run preview # 预览生产构建
```

## 🔄 切换环境

### 开发环境 → Docker完整环境

如果需要测试完整Docker环境：

```bash
# 停止本地开发服务 (Ctrl+C)

# 启动完整Docker环境
docker-compose --profile full up -d
```

### Docker完整环境 → 开发环境

```bash
# 停止Docker应用服务
docker-compose --profile app down

# 启动本地开发服务
cd api && npm run dev
npm run dev
```

## 🐛 常见问题

### 端口冲突
如果端口被占用，检查：
```bash
# 查看端口使用情况
netstat -ano | findstr :3001  # Windows
lsof -i :3001                  # Linux/Mac
```

### 数据库连接失败
确保PostgreSQL已启动：
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### 热重载不工作
检查文件监听限制：
```bash
# Linux/Mac
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📁 项目结构

```
ai-meeting/
├── api/                    # 后端API (NestJS)
│   ├── src/
│   ├── prisma/
│   └── package.json
├── src/                    # 前端应用 (React)
│   ├── components/
│   ├── pages/
│   └── services/
├── docker-compose.yml      # Docker配置
├── .env.development       # 开发环境变量
├── dev-start.sh           # 开发启动脚本
└── package.json           # 前端依赖
```

## 🎯 最佳实践

1. **分离关注点**: 基础服务用Docker，应用服务本地开发
2. **环境一致性**: 使用环境变量配置，避免硬编码
3. **热重载**: 利用开发服务器的热重载功能提高开发效率
4. **日志监控**: 定期查看服务日志，及时发现异常
5. **数据持久化**: Docker卷保证数据安全，重启不丢失

## 📞 技术支持

如有问题，请检查：
1. 基础服务是否正常运行: `docker-compose ps`
2. 环境变量是否正确加载
3. 端口是否被其他程序占用
4. 查看相关服务日志获取详细错误信息