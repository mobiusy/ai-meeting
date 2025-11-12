# 企业级会议系统技术架构文档

## 1. 架构设计原则

### 1.1 设计目标
- **高可用性**：系统可用性达到99.9%以上
- **高并发**：支持1000+并发用户同时访问
- **可扩展性**：支持水平扩展和垂直扩展
- **安全性**：企业级安全保障
- **可维护性**：模块化设计，易于维护

### 1.2 架构原则
- **前后端分离**：前端和后端独立部署和扩展
- **微服务架构**：核心业务模块化拆分
- **云原生设计**：支持容器化和云部署
- **API优先**：所有功能通过API提供服务
- **数据驱动**：基于数据分析优化系统

## 2. 总体架构

### 2.1 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                    前端应用层                                │
├─────────────────────────────────────────────────────────────┤
│                  API网关层                                  │
├─────────────────────────────────────────────────────────────┤
│              微服务业务层                                    │
├─────────────────────────────────────────────────────────────┤
│              数据存储层                                     │
├─────────────────────────────────────────────────────────────┤
│              基础设施层                                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 架构组件

#### 2.2.1 前端架构
- **单页应用（SPA）**：React/Vue.js + TypeScript
- **状态管理**：Redux/Zustand（React）或 Pinia（Vue）
- **UI组件库**：Ant Design（React）或 Element Plus（Vue）
- **构建工具**：Vite/Webpack
- **移动端**：响应式设计 + PWA

#### 2.2.2 后端架构
- **API网关**：Kong/Nginx + Lua
- **微服务框架**：Node.js + Express/Nest.js 或 Java + Spring Boot
- **服务注册与发现**：Consul/Eureka
- **配置中心**：Apollo/Nacos
- **消息队列**：RabbitMQ/Apache Kafka

#### 2.2.3 数据存储
- **关系型数据库**：PostgreSQL（主库）+ MySQL（备库）
- **缓存数据库**：Redis Cluster
- **文档数据库**：MongoDB（日志和审计数据）
- **时序数据库**：InfluxDB（监控数据）
- **对象存储**：MinIO/AWS S3（文件存储）

#### 2.2.4 基础设施
- **容器化**：Docker + Kubernetes
- **服务网格**：Istio（可选）
- **监控告警**：Prometheus + Grafana
- **日志收集**：ELK Stack（Elasticsearch + Logstash + Kibana）
- **链路追踪**：Jaeger/Zipkin

## 3. 微服务设计

### 3.1 服务拆分

#### 3.1.1 用户服务（User Service）
```yaml
服务名称: user-service
端口: 8001
数据库: user_db
功能:
  - 用户注册/登录
  - 用户信息管理
  - 组织架构管理
  - 权限管理
  - 用户认证授权
```

#### 3.1.2 会议服务（Meeting Service）
```yaml
服务名称: meeting-service
端口: 8002
数据库: meeting_db
功能:
  - 会议预约管理
  - 会议状态管理
  - 会议冲突检测
  - 会议审批流程
  - 会议统计分析
```

#### 3.1.3 会议室服务（Room Service）
```yaml
服务名称: room-service
端口: 8003
数据库: room_db
功能:
  - 会议室信息管理
  - 会议室状态管理
  - 设备管理
  - 会议室预订
  - 资源分配算法
```

#### 3.1.4 通知服务（Notification Service）
```yaml
服务名称: notification-service
端口: 8004
数据库: notification_db
功能:
  - 邮件通知
  - 短信通知
  - 站内消息
  - 推送通知
  - 通知模板管理
```

#### 3.1.5 审计服务（Audit Service）
```yaml
服务名称: audit-service
端口: 8005
数据库: audit_db
功能:
  - 操作日志记录
  - 审计日志查询
  - 合规性检查
  - 异常行为检测
  - 审计报表生成
消息队列: RocketMQ（异步日志处理）
```

#### 3.1.6 文件服务（File Service）
```yaml
服务名称: file-service
端口: 8006
存储: MinIO/S3
功能:
  - 文件上传/下载
  - 文件存储管理
  - 文件权限控制
  - 文件版本管理
  - 文件预览服务
```

### 3.2 服务间通信

#### 3.2.1 同步通信
- **REST API**：基于HTTP/HTTPS的RESTful API
- **GraphQL**：复杂查询场景（可选）
- **gRPC**：高性能内部服务通信

#### 3.2.2 异步通信
- **消息队列**：基于RocketMQ 5.0的异步消息（阿里巴巴开源，高性能、高可靠）
- **事件驱动**：基于领域事件的服务协作
- **发布订阅**：基于RocketMQ的发布订阅模式
- **消息类型**：
  - 会议预约事件（MeetingCreatedEvent）
  - 会议变更事件（MeetingUpdatedEvent）
  - 会议取消事件（MeetingCancelledEvent）
  - 审批流程事件（ApprovalProcessEvent）
  - 通知发送事件（NotificationSendEvent）

## 4. 数据库设计

### 4.1 数据库选型

#### 4.1.1 PostgreSQL（主数据库）
- **优势**：
  - 强大的ACID事务支持
  - 丰富的数据类型
  - 优秀的性能表现
  - 良好的扩展性
- **适用场景**：
  - 用户数据
  - 会议数据
  - 权限数据
  - 核心业务数据

#### 4.1.2 Redis（缓存数据库）
- **优势**：
  - 极高的读写性能
  - 丰富的数据结构
  - 支持持久化
  - 主从复制和集群
- **适用场景**：
  - 会话缓存
  - 热点数据缓存
  - 分布式锁
  - 实时统计数据

### 4.2 数据模型设计

#### 4.2.1 用户相关表
```sql
-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    department_id BIGINT,
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 部门表
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_id BIGINT REFERENCES departments(id),
    manager_id BIGINT REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2.2 会议相关表
```sql
-- 会议表
CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    room_id BIGINT NOT NULL,
    organizer_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    priority VARCHAR(20) DEFAULT 'normal',
    require_approval BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会议室表
CREATE TABLE meeting_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(200) NOT NULL,
    floor VARCHAR(20),
    capacity INTEGER NOT NULL,
    equipment JSONB,
    status VARCHAR(50) DEFAULT 'available',
    booking_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 参会人员表
CREATE TABLE meeting_participants (
    id BIGSERIAL PRIMARY KEY,
    meeting_id BIGINT REFERENCES meetings(id),
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'participant',
    status VARCHAR(50) DEFAULT 'invited',
    attended BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. 技术栈选择

### 5.1 前端技术栈

#### 5.1.1 React技术栈（主选）
```json
{
  "框架": "React 19.x（最新稳定版，支持新特性）",
  "语言": "TypeScript 5.x（最新稳定版）",
  "状态管理": "Zustand 5.x（轻量级、高性能，适合企业级应用）",
  "路由": "React Router 7.x（最新稳定版）",
  "UI组件": "Ant Design 5.x（企业级UI组件库）",
  "样式": "Tailwind CSS 3.4.x（最新稳定版）",
  "构建工具": "Vite 6.x（最新稳定版，性能更优）",
  "HTTP客户端": "Axios 1.x",
  "表单处理": "React Hook Form 7.x",
  "日期处理": "Dayjs 1.x",
  "图表": "Recharts"
}
```

**状态管理选择说明**：
- **Zustand vs Redux**：Zustand更轻量、简单，无需复杂的样板代码
- **Zustand vs Context API**：Zustand提供更好的性能和开发体验
- **Zustand vs MobX**：Zustand API更简单，学习成本更低
- **企业级适用性**：支持TypeScript、中间件、持久化等企业级特性

#### 5.1.2 Vue技术栈（备选）
```json
{
  "框架": "Vue 3.x",
  "语言": "TypeScript 5.x",
  "状态管理": "Pinia",
  "路由": "Vue Router 4.x",
  "UI组件": "Element Plus",
  "样式": "Tailwind CSS 3.x",
  "构建工具": "Vite 4.x",
  "HTTP客户端": "Axios",
  "图标": "Vue Icons"
}
```

### 5.2 后端技术栈

#### 5.2.1 Node.js技术栈（主选）
```json
{
  "运行时": "Node.js 24.x LTS（最新LTS版本，代号'Krypton'，支持到2028年4月）",
  "框架": "NestJS 11.x（最新稳定版，企业级Node.js框架）",
  "语言": "TypeScript 5.x（最新稳定版）",
  "数据库ORM": "Prisma 6.x（最新稳定版，类型安全、开发体验优秀）",
  "验证": "class-validator 0.14.x",
  "认证": "Passport.js + JWT",
  "文档": "Swagger/OpenAPI 3.x",
  "测试": "Jest + Supertest",
  "日志": "Winston",
  "进程管理": "PM2"
}
```

**Prisma ORM选择说明**：
- **类型安全**：原生TypeScript支持，自动生成类型定义
- **开发体验**：优秀的自动补全和IDE支持
- **性能优化**：查询优化和连接池管理
- **迁移管理**：强大的数据库迁移工具
- **文档丰富**：完善的官方文档和社区支持
- **企业级特性**：支持复杂查询、事务、批量操作等

#### 5.2.2 Java技术栈（备选）
```json
{
  "运行时": "Java 17 LTS",
  "框架": "Spring Boot 3.x",
  "数据库ORM": "Spring Data JPA",
  "验证": "Hibernate Validator",
  "认证": "Spring Security + JWT",
  "文档": "SpringDoc/OpenAPI",
  "测试": "JUnit 5 + Mockito",
  "日志": "Logback/Log4j2",
  "监控": "Micrometer + Prometheus"
}
```

### 5.3 数据库和中间件

```json
{
  "主数据库": "PostgreSQL 17.x（最新稳定版，性能优化）",
  "缓存": "Redis 8.x（最新稳定版）",
  "消息队列": "RocketMQ 5.3.x（最新稳定版，阿里巴巴开源，高性能、高可靠）",
  "搜索引擎": "Elasticsearch 8.x（可选）",
  "API网关": "Nginx",
  "容器化": "Docker + Docker Compose（第一阶段）",
  "监控": "基础监控（容器健康检查）",
  "日志": "Winston + 文件日志"
}
```

## 6. 部署架构

### 6.1 第一阶段：Docker Compose私有化部署（优先支持）

#### 6.1.1 部署架构设计
- **一键部署**：通过Docker Compose实现一键私有化部署
- **服务编排**：定义所有服务的依赖关系和启动顺序
- **数据持久化**：PostgreSQL、Redis数据持久化到宿主机
- **网络隔离**：使用Docker网络实现服务间通信隔离
- **配置管理**：通过环境变量和配置文件管理服务配置

#### 6.1.2 Docker Compose配置示例
```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:17-alpine
    container_name: meeting-postgres
    environment:
      POSTGRES_DB: meeting_system
      POSTGRES_USER: meeting_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - meeting-network

  # Redis缓存
  redis:
    image: redis:8-alpine
    container_name: meeting-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - meeting-network

  # RocketMQ NameServer
  rocketmq-nameserver:
    image: apache/rocketmq:5.3.2
    container_name: meeting-rocketmq-nameserver
    command: sh mqnamesrv
    ports:
      - "9876:9876"
    networks:
      - meeting-network

  # RocketMQ Broker
  rocketmq-broker:
    image: apache/rocketmq:5.3.2
    container_name: meeting-rocketmq-broker
    command: sh mqbroker -n rocketmq-nameserver:9876
    depends_on:
      - rocketmq-nameserver
    ports:
      - "10911:10911"
      - "10912:10912"
    networks:
      - meeting-network

  # 后端API服务
  api-service:
    build: 
      context: ./api
      dockerfile: Dockerfile
    container_name: meeting-api
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: meeting_system
      DB_USER: meeting_user
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      ROCKETMQ_NAMESERVER: rocketmq-nameserver:9876
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - rocketmq-broker
    networks:
      - meeting-network

  # 前端Web服务
  web-service:
    build: ./web
    container_name: meeting-web
    environment:
      REACT_APP_API_URL: http://localhost:3000
    ports:
      - "80:80"
    depends_on:
      - api-service
    networks:
      - meeting-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: meeting-nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    ports:
      - "443:443"
      - "80:80"
    depends_on:
      - web-service
      - api-service
    networks:
      - meeting-network

volumes:
  postgres_data:
  redis_data:

networks:
  meeting-network:
    driver: bridge
```

#### 6.1.3 Dockerfile示例
```dockerfile
# 前端Dockerfile - 使用最新Node.js版本
FROM node:24-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# 后端Dockerfile - 使用最新Node.js版本
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 6.2 第二阶段：Kubernetes + Helm部署（后续支持）

#### 6.2.1 Kubernetes部署
```yaml
# 前端Deployment示例
apiVersion: apps/v1
kind: Deployment
metadata:
  name: meeting-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: meeting-frontend
  template:
    metadata:
      labels:
        app: meeting-frontend
    spec:
      containers:
      - name: frontend
        image: meeting-system/frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: API_URL
          value: "https://api.meeting-system.com"
```

#### 6.2.2 Helm Charts包管理
- **应用打包**：使用Helm Charts打包应用
- **配置管理**：通过values.yaml管理不同环境配置
- **版本管理**：支持应用版本回滚和升级
- **依赖管理**：管理应用间依赖关系

## 7. 监控与运维

### 7.1 应用监控

#### 7.1.1 性能监控
- **应用性能监控（APM）**：
  - 请求响应时间
  - 错误率和异常监控
  - 服务依赖关系
  - 性能瓶颈分析

#### 7.1.2 业务监控
- **业务指标监控**：
  - 会议预约成功率
  - 系统活跃度
  - 用户行为分析
  - 业务异常告警

### 7.2 基础设施监控

#### 7.2.1 系统监控
- **服务器监控**：
  - CPU使用率
  - 内存使用率
  - 磁盘空间
  - 网络流量

#### 7.2.2 数据库监控
- **数据库性能**：
  - 查询性能
  - 连接数
  - 锁等待
  - 慢查询

### 7.3 日志管理

#### 7.3.1 日志收集
- **结构化日志**：
  - JSON格式日志
  - 统一日志格式
  - 日志级别管理
  - 日志采样策略

#### 7.3.2 日志分析
- **实时日志分析**：
  - 错误日志监控
  - 业务日志分析
  - 安全日志审计
  - 性能日志分析

## 8. 安全架构

### 8.1 应用安全

#### 8.1.1 认证授权
- **JWT认证**：
  - 无状态认证
  - 令牌刷新机制
  - 权限验证
  - 单点登录支持

#### 8.1.2 数据安全
- **数据加密**：
  - 传输加密（HTTPS/TLS）
  - 存储加密（数据库加密）
  - 敏感信息加密
  - 密钥管理

### 8.2 网络安全

#### 8.2.1 API安全
- **API网关**：
  - 限流和熔断
  - 黑白名单
  - 参数验证
  - 签名验证

#### 8.2.2 防护措施
- **常见攻击防护**：
  - SQL注入防护
  - XSS攻击防护
  - CSRF攻击防护
  - DDoS攻击防护

---

*本技术架构文档将指导系统的技术选型和架构实现*