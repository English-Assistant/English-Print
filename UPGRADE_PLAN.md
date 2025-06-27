# English-Print 全栈升级计划 (V2)

本文档旨在为 English-Print 从纯前端应用向全栈应用（代号：V2）的演进提供一份清晰、可执行的路线图。升级的核心目标是：

1.  **架构升级**：引入 `NestJS` 后端，将核心业务逻辑和数据存储迁移至服务器。
2.  **功能核心转变**：从"打印优先"转变为"在线做题优先"，同时保留打印功能。
3.  **多用户支持**：实现账户系统，让数据跟随意用户。

---

## 阶段一：后端基础设施建设 (NestJS)

**目标：搭建一个稳定、可扩展的后端服务，为后续所有功能提供基础。**

1.  **项目结构：Monorepo**

    - **动作**：使用 `pnpm workspaces` 初始化一个 Monorepo 结构。
    - **目录**：
      ```
      /english-print-v2
      ├── apps/
      │   ├── frontend/  (存放现有React应用)
      │   └── backend/   (存放新的NestJS应用)
      ├── packages/      (存放共享代码, 如类型定义)
      └── package.json
      ```
    - **理由**：统一管理前后端代码，简化依赖和构建流程。

2.  **数据库与ORM**

    - **选型**：`PostgreSQL` (数据库) + `Prisma` (ORM)。
    - **动作**：
      - 在 `backend` 项目中初始化 Prisma。
      - 根据 `src/data/types` 中的现有 TypeScript 类型，在 `prisma/schema.prisma` 中定义数据模型。
    - **核心模型**：
      - `User`: 新增，用于用户认证。
      - `Course`: 对应 `course.ts`。
      - `Paper`: 对应 `paper.ts`。
      - `Vocabulary`: 对应 `vocabulary.ts`。
      - `GenerationTask`: 对应 `generation.ts` 中的任务结构，用于追踪任务状态。
      - **关联**：为 `User` 和其他模型（如`Course`, `Paper`）建立一对多关系。

3.  **用户认证 (`AuthModule`)**

    - **技术**：`@nestjs/passport`, `@nestjs/jwt`。
    - **动作**：
      - 创建 `AuthModule` 和 `UserModule`。
      - 实现用户注册 (`/auth/register`) 和登录 (`/auth/login`) 接口。
      - 登录成功后返回 JWT。
      - 创建 `JwtAuthGuard`，用于保护需要认证的路由。

4.  **核心业务API (CRUD)**
    - **动作**：为核心资源创建对应的 `Module`, `Controller`, `Service`。
      - `CoursesModule`: 管理课程的增删改查。
      - `PapersModule`: 管理试卷元数据的增删改查。
      - `VocabularyModule`: 管理全局词汇表。
    - **实现**：所有 Service 通过注入的 `PrismaService` 与数据库交互。

---

## 阶段二：AI生成逻辑迁移

**目标：将 AI 内容生成的核心逻辑从前端剥离，移至后端，使其更健壮、更安全。**

1.  **任务队列系统 (`GenerationModule`)**

    - **技术**：`BullMQ` + `Redis`。
    - **动作**：
      - 在 `backend` 中设置 `BullModule`，并配置 Redis 连接。
      - 创建一个名为 `generation` 的任务队列。
    - **理由**：`BullMQ` 提供持久化的任务队列，即使服务器重启，任务也不会丢失，远比前端的内存队列可靠。

2.  **AI调用服务**

    - **动作**：
      - 创建一个 `DifyApiService`，封装所有与 Dify.ai API 的交互逻辑。
      - 将 `apiUrl` 和 `apiToken` 从前端设置移至后端的 `.env` 文件中，作为环境变量管理。
      - 创建一个 `POST /papers/:id/generate` 接口，接收前端的生成请求，并将一个新任务添加到 `generation` 队列中。

3.  **任务处理器**
    - **动作**：
      - 创建一个队列处理器 (`Processor`)，监听 `generation` 队列。
      - 处理器从队列中接收任务，调用 `DifyApiService` 执行生成。
      - 根据 Dify API 的返回结果（成功/失败），更新数据库中对应 `GenerationTask` 的状态和内容。

---

## 阶段三：前端应用重构

**目标：改造现有 React 应用，使其从数据源（后端API）消费数据，并移除所有旧的数据持久化和业务逻辑。**

1.  **移除旧逻辑**

    - **动作**：
      - 删除 `dexie.js` 依赖。
      - 从所有 Zustand store 中移除 `persist` 中间件和 `dexieStorage`。
      - 删除 `src/apis/generation.ts` 文件，其功能已被后端取代。
      - 精简 `generationTasks.ts` store，移除队列和并发控制逻辑，只保留用于驱动UI的瞬时状态。

2.  **引入服务端状态管理**

    - **技术**：`TanStack Query` (`@tanstack/react-query`)。
    - **动作**：
      - 在整个应用外层包裹 `QueryClientProvider`。
      - 创建 `hooks` 用于封装 API 调用，例如 `useCourses` (内部使用 `useQuery` 获取课程列表), `useCreateCourse` (内部使用 `useMutation` 创建新课程)。
    - **改造**：所有页面和组件（如 `courses/index.tsx`, `papers/index.tsx`）的数据获取方式，从调用 Zustand store 改为调用对应的 `TanStack Query` hook。

3.  **认证流程集成**

    - **动作**：
      - 创建 `LoginPage.tsx` 和 `RegisterPage.tsx` 组件。
      - 实现登录逻辑：调用后端 `/auth/login`，成功后将获取的 JWT 存储在 `localStorage` 中。
      - 创建一个 API 客户端实例 (如 `axios` instance)，在请求头中自动附带 JWT。
      - 使用 TanStack Router 的 `beforeLoad` API，在进入 `/manage` 等受保护路由前检查 `localStorage` 中是否存在有效的 JWT，若不存在则重定向至登录页。

4.  **任务状态同步**
    - **动作**：
      - 改造 `GenerationNotifier` 和任务中心页面。
      - 当用户点击"生成"后，调用 `POST /papers/:id/generate` 接口。
      - 使用 `useQuery` 定期轮询 (Polling) 后端的 `GET /tasks` 或 `GET /tasks/:id` 接口，以获取最新任务状态并更新UI。`refetchInterval` 是 `useQuery` 的一个完美选项。

---

## 阶段四：核心新功能 - 在线做题

**目标：在新的全栈架构上，开发核心的在线练习和自动批改功能。**

1.  **数据库模型扩展**

    - **动作**：在 `schema.prisma` 中添加新模型。
      - `Submission`: 记录一次完整的答卷提交，关联 `User` 和 `Paper`。
      - `Answer`: 记录对具体某个问题的回答，关联 `Submission` 和原试卷中的问题ID。包含 `content`, `isCorrect` 等字段。

2.  **后端API开发 (`SubmissionsModule`)**

    - **动作**：创建 `SubmissionsModule`。
      - `POST /submissions`: 接收用户提交的答案，进行保存和初步批改（如选择题、填空题可自动判断对错）。
      - `GET /submissions/:id`: 获取某次提交的结果和详情。
      - `GET /papers/:id/submissions`: 获取某个用户对特定试卷的所有提交历史。

3.  **前端交互升级**
    - **组件**：`ExamPaperViewer.tsx` 是改造核心。
    - **动作**：
      - 将其从一个纯展示组件，升级为包裹在 `<form>` 内的可交互组件。
      - 根据题目类型 (`question.type`)，渲染为不同的输入控件 (如 `<input type="radio">` 用于选择题，`<input type="text">` 用于填空题)。
      - 使用 React Hook Form 或其他表单库管理答题状态。
      - 添加"提交答案"按钮，触发调用 `POST /submissions` 接口的 `useMutation` hook。
    - **新页面**：
      - 创建"答题报告页"，用于展示批改后的结果、得分和正确答案。
      - 创建"历史记录页"，展示用户的所有答题历史。
