// examAnswer.d.ts

/**
 * @file
 * @description 定义了与 `exam.d.ts` 配套的试卷答案数据结构。
 * 该结构用于存储标准答案，支持前端进行自动批改或答案展示。
 */

/**
 * 根级答案对象类型定义。
 */
export interface ExamAnswerSheet {
  /**
   * 试卷的唯一ID（可选，但推荐）。
   * 用于确保答案与试卷的精确匹配。
   */
  paperId?: string;

  /** 试卷的标题（可选），用于人工核对。 */
  title: string;

  /**
   * 答案按大题组织的数组。
   * 其结构应与 `ExamPaper` 的 `sections` 保持一致。
   */
  sections: AnswerSection[];
}

/**
 * 大题答案的结构类型定义。
 */
export interface AnswerSection {
  /** 大题的序号，与试卷对应。 */
  sectionNumber: string;

  /** 大题内部子部分的答案数组。 */
  parts: AnswerPart[];
}

/**
 * 子部分答案的结构类型定义。
 */
export interface AnswerPart {
  /** 子部分的标识符，与试卷对应。 */
  partNumber: string;

  /**
   * 该部分所有问题的答案数组。
   * 每个元素是一个独立的答案对象。
   */
  content: AnsweredQuestion[];
}

/**
 * 单个问题的答案结构类型定义。
 */
export interface AnsweredQuestion {
  /**
   * 问题的唯一ID，必须与试卷中的题目ID完全一致。
   * 这是实现自动批改的关键。
   */
  id: string;

  /**
   * 该题的正确答案。
   * 使用联合类型以适应不同题型。
   * - `string[]`: 用于选择题，存储正确选项的文本。
   * - `boolean`: 用于判断题 (true/false)。
   * - `string`: 用于填空题和翻译题。
   */
  answer: string[] | boolean | string;
}
