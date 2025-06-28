/**
 * @file
 * @description 定义了英语抄写练习的数据结构。
 * 该类型定义与 'Unit Schema' JSON Schema 完全对应。
 */

/**
 * 抄写练习表的根级对象类型定义。
 */
export interface CopyPracticeSheet {
  /**
   * 单元标题
   */
  title: string;

  /**
   * 需要抄写的单词列表
   */
  word_copy: string[];

  /**
   * 需要抄写的句子列表
   */
  sentence_copy: string[];

  /**
   * 根据句子结构来变形来的句子列表，考虑句子的知识点，但是换一种形式来练习
   */
  sentence_transform: string[];
}
