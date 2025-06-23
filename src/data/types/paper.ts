// src/data/types/paper.d.ts

import type { ExamPaper } from './exam';
import type { ExamAnswerSheet } from './answer';
import type { CopyPracticeSheet } from './copy';

/**
 * @file
 * @description 定义了“试卷记录”的数据结构。
 * 这是一个数据库记录级别的类型，它聚合了试卷、答案和练习等多种JSON内容。
 */

export interface Paper {
  /** 试卷记录的唯一ID */
  id: string;

  /** 试卷的标题 */
  title: string;

  /** 关联的课程ID（可选） */
  courseId?: string;

  /** 备注信息（可选） */
  remark?: string;

  /** 课程导读内容（Markdown文本，可选） */
  preclass?: string;

  /** [类型优化] 抄写练习的JSON数据 */
  copyJson?: CopyPracticeSheet;

  /** [类型优化] 试卷内容的JSON数据 */
  examJson?: ExamPaper;

  /** [类型优化] 试卷答案的JSON数据 */
  answerJson?: ExamAnswerSheet;

  /** 记录的最后更新时间 */
  updatedAt: string;
}
