# EnglishPrint AI开发备忘录

本文件作为一份技术摘要，旨在帮助AI助手快速理解项目的架构、核心逻辑和设计模式。

## 1. 项目概览

- **核心目标**: 一款AI驱动的Web应用，用于生成和打印A4尺寸的英语学习材料。
- **核心工作流**: 用户提供基本信息（标题、单词、故事）-> 应用调用Dify.ai API -> AI返回结构化JSON -> 应用解析并显示材料以供打印。
- **技术栈**: React, Vite, TanStack Router, Zustand, Ant Design, UnoCSS, Dexie.js (IndexedDB)。

## 2. 关键目录结构

- `src/apis`: 包含API调用函数，主要是`generation.ts`，用于调用Dify工作流。
- `src/components`: 可复用的React组件。`ExamPaperViewer.tsx` 对于从JSON渲染试卷至关重要。
- `src/data`: 应用的"大脑"。
  - `prompts/`: 存储发送给LLM的主Prompt。
  - `schema/`: 包含JSON Schema（`dify.schema.json`, `exam.schema.json`等），用于通过`Ajv`校验AI的输出。
  - `types/`: 所有主要数据结构的TypeScript类型定义（如 `paper.ts`, `exam.ts`）。
- `src/hooks`: 自定义React钩子。
- `src/routes`: 由TanStack Router管理的文件式路由。`_manage`目录包含所有管理后台页面。
- `src/stores`: 用于全局状态管理的Zustand store。
- `src/utils`: 工具函数，包括`schemaValidators.ts`。

## 3. 状态管理 (Zustand)

状态由多个模块化的store进行管理。所有store都使用带有`dexieStorage` (IndexedDB)的`persist`中间件。

- **`useSettingsStore`**: `name: 'dify-api-settings'`
  - 存储 `apiUrl`, `apiToken`, 和 `maxConcurrentTasks`。
- **`useCourseStore`**: `name: 'course-storage'`
  - 管理课程。
- **`usePaperStore`**: `name: 'paper-storage'`
  - 管理试卷/单元的元数据。
- **`useVocabularyStore`**: `name: 'vocabulary-storage'`
  - 管理一个全局词汇表。
- **`useGenerationTaskStore`**: `name: 'generation-tasks-storage'`
  - **核心**: 管理AI内容生成任务。

### 生成任务逻辑 (`generationTasks.ts`)

这是最复杂的store，它实现了一个带并发限制的任务队列。

- **任务状态**: `pending` (排队中) -> `processing` (处理中) -> `success` (成功) | `error` (失败)。
- **`startGeneration(paper)`**: 这个函数**不会**直接运行任务。它将一个状态为`pending`的新任务添加到队列中，然后调用`processQueue()`。
- **`processQueue()`**: 核心调度器。它检查`processing`状态的任务数量是否小于`maxConcurrentTasks`。如果是，它会找到第一个`pending`状态的任务，将其状态更改为`processing`，然后调用`_runTask()`。
- **`_runTask(task)`**: 一个私有的异步方法，其中包含用于API调用（`runDifyWorkflow`）的实际`try/catch`块。
- **`finally` 块**: 在每个任务执行完毕后（无论成功或失败），`_runTask`中的`finally`块都会再次调用`processQueue()`，以检查是否可以启动另一个任务。这就形成了处理循环。

## 4. 核心数据流：通知系统

- **触发**: 用户操作（如点击"生成"）调用store中的一个方法（如`generationTasks.ts`中的`startGeneration`）。
- **状态变更**: store更新其状态（如添加一个状态为`pending`的任务）。**store本身不触发通知。**
- **UI响应**: `src/routes/__root.tsx`中的`GenerationNotifier`组件订阅了`useGenerationTaskStore`。
- **通知触发**: `GenerationNotifier`中的一个`useEffect`钩子比较前后两次的任务状态。当它检测到状态变更时（如从`processing`变为`success`或`error`），它会触发相应的Ant Design通知。
- **结论**: 这种模式将业务逻辑（在store中）与UI表现（在组件中）解耦，使得通知系统得以集中和保持一致。

## 5. 关键前端组件

- `BatchNewPaperModal.tsx` & `BatchNewPaperJsonModal.tsx`: 具有复杂的两栏布局，使用`Form.List`和一个基于`Anchor`的导航系统。它们管理着自己的活动索引状态。
- `ExamPaperViewer.tsx`: 接收`examJson`数据并将其渲染为面向用户的试卷，处理各种题型。
- `VanillaJsonEditor.tsx`: `vanilla-jsoneditor`库的包装器，用于显示和校验JSON内容。
