import type { ExamPaper } from './exam';
import type { ExamAnswerSheet } from './answer';
import type { CopyPracticeSheet } from './copy';
import type { ListeningMaterial } from './listening';

/**
 * @file
 * @description 定义了通过AI批量生成试卷接口返回的数据结构。
 */

/**
 * 代表单次AI调用生成的一套完整教学材料。
 * 这对应了我们精心设计的Prompt的输出结构。
 */
export interface GeneratedPaperData {
  /** 单元标题 */
  title?: string;
  /** 核心单词，逗号分隔 */
  coreWords?: string;
  /** 本节小故事 */
  story?: string;
  /** 课程导读内容（Markdown文本） */
  preClassGuide: string;

  /** 听力材料（JSON对象） */
  listeningMaterial: ListeningMaterial;

  /** 抄写练习的JSON数据 */
  copyExercise: CopyPracticeSheet;

  /** 试卷内容的JSON数据 */
  examPaper: ExamPaper;

  /** 试卷答案的JSON数据 */
  examAnswers: ExamAnswerSheet;
}

/**
 * 批量新增试卷接口的API响应体结构。
 */
export interface ApiBatchNewPaperResponse {
  task_id: string;
  workflow_run_id: string;
  data: {
    // id (string) workflow 执行 ID
    // workflow_id (string) 关联 Workflow ID
    // status (string) 执行状态, running / succeeded / failed / stopped
    // outputs (json) Optional 输出内容
    // error (string) Optional 错误原因
    // elapsed_time (float) Optional 耗时(s)
    // total_tokens (int) Optional 总使用 tokens
    // total_steps (int) 总步数（冗余），默认 0
    // created_at (timestamp) 开始时间
    // finished_at (timestamp) 结束时间

    id: string;
    workflow_id: string;
    status: string;
    outputs: {
      output: GeneratedPaperData;
    };
    error?: string;
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  status: number;
}

// 接口错误响应
// {
//   "code": "invalid_param",
//   "message": "unit is required in input form",
//   "status": 400
// }
