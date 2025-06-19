// exam.d.ts

/**
 * @file
 * @description 定义了中小学英语试卷的完整数据结构。
 * 该结构专为前端动态渲染而设计，具有高度的灵活性和扩展性。
 */

/**
 * 根级试卷对象类型定义。
 */
export interface ExamPaper {
  /** 试卷的主标题，例如 '二年级下 Unit 6 + 复习练习卷'。 */
  title: string;

  /**
   * 试卷主要大题的数组。
   * 每个元素代表一个大题，如"一、听力理解"、"二、词汇与句型"等。
   */
  sections: Section[];
}

/**
 * 大题结构类型定义。
 */
export interface Section {
  /** 大题的序号，例如 '一', '二'。 */
  sectionNumber: string;

  /** 大题的标题，例如 '听力理解'。 */
  title: string;

  /** 该大题的总分值，用于显示。 */
  points: number;

  /** 适用于整个大题的通用说明，例如 '请根据所听内容完成下列各题。'。 */
  instructions: string;

  /**
   * 大题内部的子部分数组。
   * 例如，一个听力大题可能包含"听对话选择"、"听音判断"等多个子部分。
   */
  parts: Part[];
}

/**
 * 大题内部的子部分结构类型定义。
 */
export interface Part {
  /**
   * 子部分的可选标识符，例如 '(1)', 'A'。
   * 用于在视觉上组织题目。
   */
  partNumber: string;

  /** 针对此子部分的特定说明，例如 '听对话，选择你所听到的句子。'。 */
  instructions: string;

  /**
   * 构成此部分的内容项数组。
   * 允许混合不同类型的题目，如选择题、填空题等。
   */
  content: Question[];
}

/**
 * 问题的具体类型枚举。
 * 决定了 `data` 字段的结构和渲染方式。
 */
export type QuestionType =
  | 'MULTI_SELECT_CHOICE' // 单项/多项选择题
  | 'TRUE_FALSE' // 判断题
  | 'FILL_IN_BLANK_AND_TRANSLATE' // 带中文提示的填空题
  | 'FILL_IN_BLANK' // 纯填空
  | 'GUIDED_WRITING' // 导写题
  | 'OPEN_ENDED' // 开放性题目
  | 'TRANSLATE_ZH_TO_EN' // 中译英
  | 'TRANSLATE_EN_TO_ZH'; // 英译中

/**
 * 通用问题结构类型定义。
 * 这是一个容器，通过 `questionType` 区分具体题目类型。
 */
export interface Question {
  /**
   * 标记内容项为"问题"。
   * 此处固定为 'QUESTION'，用于类型守卫。
   */
  type: 'QUESTION';

  /** 问题的具体类型，详见 QuestionType 枚举。 */
  questionType: QuestionType;

  /**
   * 问题的具体数据负载。
   * 其结构由 `questionType` 决定。
   */
  data: QuestionData;
}

/**
 * 所有问题数据类型的联合类型。
 * 使用 TypeScript 的联合类型来表示不同题型的数据结构。
 */
export type QuestionData =
  | MultiSelectChoiceData
  | TrueFalseData
  | FillInBlankData
  | TranslationData;

/**
 * 选择题的数据结构。
 */
export interface MultiSelectChoiceData {
  /** 题目的唯一ID，用于与答案匹配。 */
  id: string;

  /** 题干内容。对于听力题，通常包含来源提示，如 '(听力对话1)'。 */
  questionText: string;

  /** 选项数组，每个选项都是一个字符串。 */
  options: string[];

  /**
   * 正确答案数组（可选，通常在答案文件中提供）。
   * 此处保留是为了灵活性，例如在教师端直接显示答案。
   */
  correctAnswers?: string[];
}

/**
 * 判断题的数据结构。
 */
export interface TrueFalseData {
  /** 题目的唯一ID。 */
  id: string;

  /**
   * 题干内容。
   * 对于听力判断题，通常包含对图片或情景的文字描述。
   */
  questionText: string;

  /**
   * 正确答案（可选）。
   * true 代表"正确/T"，false 代表"错误/F"。
   */
  isCorrect?: boolean;
}

/**
 * 带中文提示的填空题的数据结构。
 */
export interface FillInBlankData {
  /** 题目的唯一ID。 */
  id: string;

  /**
   * 题干文本，通常包含下划线 `__` 表示填空位置，并附带中文提示。
   * 例如: '________ Christmas! （圣诞快乐！）'
   */
  text: string;

  /**
   * 正确答案（可选）。
   */
  answer?: string;
}

/**
 * 翻译题的数据结构。
 */
export interface TranslationData {
  /** 题目的唯一ID。 */
  id: string;

  /** 需要翻译的源文本。 */
  text: string;

  /**
   * 参考答案（可选）。
   */
  referenceAnswer?: string;
}
