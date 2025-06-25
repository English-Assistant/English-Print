// src/data/types/exam.ts (已清理)

/**
 * @file
 * @description 定义了中小学英语试卷的完整数据结构 (V2.1)。
 * 该结构专为前端动态渲染而设计，具有高度的灵活性和扩展性。
 */

// 根级试卷对象类型定义
export interface ExamPaper {
  title: string;
  sections: Section[];
}

// 大题结构类型定义
export interface Section {
  sectionNumber: string;
  title: string;
  points: number;
  instructions?: string;
  parts: Part[];
}

// 大题内部的子部分结构类型定义
export interface Part {
  partNumber: string;
  instructions?: string;
  passage?: string;
  content: Question[];
}

// 问题的具体类型枚举
export type QuestionType =
  | 'MULTI_SELECT_CHOICE' // 选择题 (听力、词汇、语法、情景、阅读)
  | 'TRUE_FALSE' // 判断题 (如果未来需要)
  | 'FILL_IN_BLANK' // 填空题 (单词拼写)
  | 'OPEN_ENDED' // 开放性题目 (句子改错)
  | 'GUIDED_WRITING'; // 导写题 (造句)

// 通用问题结构类型定义
export interface Question {
  type: 'QUESTION';
  questionType: QuestionType;
  data: QuestionData;
}

// 所有问题数据类型的联合类型
export type QuestionData =
  | MultiSelectChoiceData
  | TrueFalseData
  | FillInBlankData
  | OpenEndedData
  | GuidedWritingData;

// 选择题的数据结构
export interface MultiSelectChoiceData {
  id: string;
  questionText: string;
  options: string[];
}

// 判断题的数据结构
export interface TrueFalseData {
  id: string;
  questionText: string;
}

/**
 * 单词拼写/填空题的数据结构 (V2.1 结构化版本)
 */
export interface FillInBlankData {
  id: string;
  number: string; // 题号，如 "1."
  hint: string; // 中文提示，如 "春天"
  stem: string; // 词干/首字母，如 "s"
}

// 句子改错/造句等开放性题目的数据结构
export interface OpenEndedData {
  id: string;
  text: string;
}

/**
 * 造句题的数据结构 (V2.2)
 */
export interface GuidedWritingData {
  id: string;
  words: string[]; // 词组，供学生组成句子
}
