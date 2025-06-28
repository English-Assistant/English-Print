# English-Print 后端服务

本项目是 [English-Print](https://github.com/your-username/english-print) 全栈升级计划 (V2) 的后端部分，基于 [NestJS](https://nestjs.com/) 构建，旨在为应用提供稳定、可扩展的后台支持。

## ✨ 功能特性

- 🛡️ **类型安全**: 基于 TypeScript 构建，并使用 Prisma 作为类型安全的 ORM。
- 🔑 **用户认证**: 内置基于 JWT 的完整用户注册和登录流程。
- 📚 **核心业务 API**: 提供课程和试卷的增删改查 (CRUD) 接口。
- 🤖 **AI 任务队列**: 使用 BullMQ 和 Redis 构建了异步任务队列，用于处理耗时的 AI 生成任务。
- 📝 **自动 API 文档**: 集成 Swagger，自动生成并托管交互式 API 文档。
- 📦 **统一响应格式**: 全局拦截器和过滤器确保所有 API 返回统一的 `{ code, msg, data }` 结构。

## 🛠️ 技术栈

- **框架**: [NestJS](https://nestjs.com/)
- **数据库 ORM**: [Prisma](https://www.prisma.io/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/)
- **任务队列**: [BullMQ](https://bullmq.io/)
- **缓存/消息代理**: [Redis](https://redis.io/)
- **认证**: [Passport.js](http://www.passportjs.org/) (JWT Strategy)
- **API 文档**: [Swagger](https://swagger.io/)

---

## 🚀 快速开始

### 1. 安装依赖

本项目使用 `pnpm` 作为包管理工具。

```bash
# 在项目根目录运行
pnpm install
```

### 2. 配置环境变量

在 `apps/backend/` 目录下，复制 `.env.example` (如果不存在请创建一个) 为 `.env` 文件，并填入必要的环境变量：

```env
# .env

# 数据库连接字符串
# 指向由 docker-compose 启动的 PostgreSQL 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/english_print?schema=public"

# 用于 JWT 签名的密钥，请使用一个随机的长字符串
JWT_SECRET="your-super-secret-key-that-is-long-and-random"

# Redis 连接信息 (如果不是默认值)
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

### 3. 启动开发环境

本项目使用 Docker Compose 管理数据库和缓存服务。

```bash
# 在项目根目录运行，启动 PostgreSQL 和 Redis 服务
docker-compose up -d
```

### 4. 运行数据库迁移

首次启动或数据模型变更后，需要运行数据库迁移。

```bash
# 在项目根目录运行
pnpm -F backend exec prisma migrate dev
```

### 5. 启动后端服务

```bash
# 在项目根目录运行
pnpm -F backend run start:dev
```

服务启动后，默认监听在 `http://localhost:3000`。

### 6. API 文档

服务启动后，可以访问以下地址查看交互式 API 文档：

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📈 项目升级状态 (V2)

本文档追踪 [UPGRADE_PLAN.md](../../UPGRADE_PLAN.md) 中定义的后端开发任务。

### ✅ 已完成

- **阶段一：后端基础设施建设**

  - [x] 使用 pnpm workspaces 搭建 Monorepo 结构。
  - [x] 选型 PostgreSQL + Prisma，并使用 Docker Compose 管理。
  - [x] 完成 `User`, `Course`, `Paper` 核心数据模型定义与迁移。
  - [x] 基于 Passport.js 和 JWT 实现完整的用户认证 (`AuthModule`)。
  - [x] 实现 `Course` 和 `Paper` 模块的核心 CRUD 接口。
  - [x] 实现用户 Dify API 配置的存储与更新接口。

- **阶段二：AI 生成逻辑迁移**

  - [x] 使用 BullMQ + Redis 搭建任务队列系统 (`GenerationModule`)。
  - [x] 封装 `DifyApiService`，用于调用 Dify Workflow API。
  - [x] 创建 `GenerationProcessor`，用于在后台处理 AI 生成任务。
  - [x] 提供 `POST /papers/:id/generate` 接口，用于异步触发生成任务。
  - [x] 添加 `GenerationTask` 模型用于完整的任务状态跟踪。
  - [x] 实现 `Task` 模块，提供任务查询、重试和取消的 API。

- **全局功能**
  - [x] 实现全局响应拦截器，统一返回格式。
  - [x] 实现全局异常过滤器，统一错误格式。
  - [x] 集成 Swagger 并实现文档中文化。
  - [x] 实现 `VocabularyModule` (生词本) 的 CRUD 接口。

---

### 📖 项目路线图

后端的阶段性开发目标已基本完成。关于项目的下一步计划、前端集成任务以及未来的功能规划，请查阅**项目根目录的 [README.md](../../README.md)**。
