# English-Print V2

本仓库是 **English-Print** 应用的全栈升级项目 (V2)。项目采用基于 pnpm workspaces 的 Monorepo 架构，旨在将原有的纯前端应用升级为一个功能完善、前后端分离的全栈应用。

- **`apps/backend`**: 基于 [NestJS](https://nestjs.com/) + [Prisma](https://www.prisma.io/) 构建的后端服务。
- **`apps/frontend`**: 基于 [React](https://react.dev/) + [Vite](https://vitejs.dev/) 构建的前端应用。
- **`packages/types`**: 用于在前后端之间共享 TypeScript 类型定义。

---

## 📈 当前状态

**后端服务已基本完成，前端 API 层已搭建完毕。**

- ✅ **后端**:

  - 提供了包括用户认证、课程、试卷、生词本在内的全部核心业务 CRUD 接口。
  - 构建了基于 BullMQ + Redis 的异步任务队列，用于处理 AI 内容生成，并提供了任务查询、重试和取消的接口。
  - 集成了 Swagger 提供自动化 API 文档。
  - 实现了全局统一的响应和异常处理。

- ✅ **前端**:
  - 搭建了与后端接口完全匹配的 API 服务层 (`src/apis`)，所有函数均类型安全。
  - 解决了 Monorepo 环境下的跨包类型共享问题，实现了丝滑的开发体验。

---

## 🎯 下一步行动 (Next Steps)

**核心任务：将前端 UI 与后端 API 全面集成。**

我们的后端已经准备就绪，前端的 API 调用函数也已封装完毕。现在需要将这些"发动机"和"传动轴"装到"车身"上，让应用真正地跑起来。

我们将按照模块逐一替换前端的旧有逻辑和模拟数据：

1.  **用户认证**:

    - [ ] **登录/注册页**: 对接 `login` 和 `register` 接口，实现完整的用户认证流程。
    - [ ] **全局状态管理**: 在用户登录后，将获取到的 `token` 存入 `localStorage`，并设置到请求头中。
    - [ ] **路由守卫**: 实现前端路由守卫，未登录用户访问受保护页面时自动跳转到登录页。

2.  **核心管理页面**:
    - [ ] **课程管理 (`/courses`)**: 对接 `getCourses`, `createCourse` 等接口，实现课程的展示、创建、编辑和删除。
    - [ ] **试卷管理 (`/papers`)**: 对接 `getPapers`, `createPaper` 等接口，实现试卷的展示、创建和删除。
    - [ ] **试卷详情 (`/paper-detail/:id`)**: 对接 `getPaperById`, `updatePaper` 接口，并实现 `generatePaperContent` 接口的调用与反馈。
    - [ ] **任务中心 (`/tasks`)**: 对接 `getTasks`, `retryTask`, `cancelTask` 接口，实现任务列表的轮询展示和操作。
    - [ ] **生词本 (`/vocabulary`)**: 对接 `getVocabularies` 等接口，实现生词本功能。
    - [ ] **设置页 (`/settings`)**: 对接 `getProfile` 和 `updateDifyConfig` 接口。

---

## backlog 待办与未来计划

### 后端功能完善

- [ ] **动态构造 Dify 输入**: `GenerationProcessor` 中调用 Dify 的 `inputs` 目前是固定的，需要根据前端的实际需求（如 `overall.md`）进行动态构造。
- [ ] **单元/集成测试**: 为核心的 Service 和 Controller 补充测试用例。

### 未来新功能

- [ ] **在线做题与批改**:
  - **数据库模型**: 设计并添加 `Submission` (提交记录) 和 `Answer` (答案详情) 模型。
  - **后端 API**: 开发 `SubmissionsModule`，实现提交答案、自动批改、查询历史记录等接口。
  - **前端页面**: 创建在线答题页面和历史提交记录查看页面。

---

## 🚀 运行项目

### 1. 环境准备

- 安装 [Node.js](https://nodejs.org/) (v18 或更高版本)
- 安装 [pnpm](https://pnpm.io/)
- 安装 [Docker](https://www.docker.com/)

### 2. 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 3. 配置环境变量

在 `apps/backend/` 目录下，复制 `.env.example` (如果不存在请创建一个) 为 `.env` 文件，并填入数据库和 JWT 密钥等信息。

### 4. 启动后端依赖服务

在项目根目录运行，此命令将使用 Docker 启动 PostgreSQL 和 Redis 服务。

```bash
docker-compose up -d
```

### 5. 数据库迁移

首次运行或 `prisma/schema.prisma` 文件变更后，需要运行数据库迁移。

```bash
# 在项目根目录运行
pnpm -F backend exec prisma migrate dev
```

### 6. 启动开发服务器

需要打开两个终端窗口，分别启动后端和前端的开发服务器。

```bash
# 终端 1: 启动后端 (NestJS)
pnpm -F backend run start:dev
```

```bash
# 终端 2: 启动前端 (Vite)
pnpm -F frontend run dev
```

- 后端服务将运行在 `http://localhost:3000`
- API 文档位于 `http://localhost:3000/api-docs`
- 前端应用将运行在 `http://localhost:5173`
