import Ajv2020 from 'ajv/dist/2020';
import draft7Meta from 'ajv/dist/refs/json-schema-draft-07.json';
import examSchema from '@/data/schema/exam.schema.json';
import answerSchema from '@/data/schema/answer.schema.json';
import copySchema from '@/data/schema/copy.schema.json';
import type { GeneratedPaperData } from '@/data/types/generation';

const ajv = new Ajv2020();
ajv.addMetaSchema(draft7Meta);

/**
 * 校验器 - 用于"抄写练习"的JSON数据
 */
export const validateCopy = ajv.compile(copySchema as object);

/**
 * 校验器 - 用于"试卷内容"的JSON数据
 */
export const validateExam = ajv.compile(examSchema as object);

/**
 * 校验器 - 用于"试卷答案"的JSON数据
 */
export const validateAnswer = ajv.compile(answerSchema as object);

/**
 * 对一个完整的 GeneratedPaperData 对象进行全面校验。
 * @param data - 需要校验的 GeneratedPaperData 对象。
 * @returns - 返回一个包含所有校验错误的字符串数组。如果数组为空，则表示校验通过。
 */
export function validateGeneratedPaperData(data: GeneratedPaperData): string[] {
  const errors: string[] = [];
  const formatError = (validator: typeof validateCopy, prefix: string) => {
    return (
      validator.errors
        ?.map((e) => `${prefix} (${e.instancePath || 'root'}): ${e.message}`)
        .join('; ') ?? `${prefix} 校验失败`
    );
  };

  if (!validateCopy(data.copyExercise)) {
    errors.push(formatError(validateCopy, '抄写练习'));
  }

  if (!validateExam(data.examPaper)) {
    errors.push(formatError(validateExam, '试卷'));
  }

  if (!validateAnswer(data.examAnswers)) {
    errors.push(formatError(validateAnswer, '答案卡'));
  }

  return errors;
}
