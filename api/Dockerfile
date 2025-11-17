# 后端Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 安装所有依赖（包括开发依赖）
COPY package*.json ./
RUN npm ci

# 复制源代码和Prisma schema
COPY . .

# 生成Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制Prisma schema和生成的Client
COPY prisma ./prisma
RUN npx prisma generate

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "run", "start:prod"]