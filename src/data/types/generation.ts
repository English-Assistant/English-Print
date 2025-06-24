import type { ExamPaper } from './exam';
import type { ExamAnswerSheet } from './answer';
import type { CopyPracticeSheet } from './copy';

/**
 * @file
 * @description 定义了通过AI批量生成试卷接口返回的数据结构。
 */

/**
 * 代表单次AI调用生成的一套完整教学材料。
 * 这对应了我们精心设计的Prompt的输出结构。
 */
export interface GeneratedPaperData {
  /** 课程导读内容（Markdown文本） */
  preClassGuide: string;

  /** 听力材料（纯文本） */
  listeningMaterial: string;

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
  /**
   * 生成的数据数组，因为是批量操作，所以返回一个列表。
   * `output` 这个键名是根据Dify平台调试时返回的结构确定的。
   */
  output: GeneratedPaperData[];
}
