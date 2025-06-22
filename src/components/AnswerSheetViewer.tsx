// AnswerSheetViewer.tsx (已重构和优化)
import type { ExamPaper, Section, Part, Question } from '@/data/types/exam';
import type { ExamAnswerSheet, AnsweredQuestion } from '@/data/types/answer';
import { useMemo } from 'react';

export interface AnswerSheetViewerProps {
  exam: ExamPaper;
  answer: ExamAnswerSheet;
}

// 颜色常量，与设计图保持一致
const ANSWER_COLOR = '#15803D'; // 绿色

export default function AnswerSheetViewer({
  exam,
  answer,
}: AnswerSheetViewerProps) {
  // 1. 【核心优化】: 创建一个从问题ID到答案的全局Map，实现高效、精确的查找。
  // 这样可以避免在渲染时进行复杂的、低效的嵌套循环匹配。
  const answerMap = useMemo(() => {
    const map = new Map<string, AnsweredQuestion['answer']>();
    answer.sections.forEach((answerSection) => {
      answerSection.parts.forEach((answerPart) => {
        answerPart.content.forEach((ans) => {
          map.set(ans.id, ans.answer);
        });
      });
    });
    return map;
  }, [answer]);

  return (
    <div className="flex flex-col gap-4">
      {exam.sections.map((section) => (
        // 2. 将全局的 answerMap 传递给每个子组件
        <AnswerSectionCard
          key={section.sectionNumber}
          section={section}
          answerMap={answerMap}
        />
      ))}
    </div>
  );
}

// === 子组件 ===

interface CardProps {
  section: Section;
  answerMap: Map<string, AnsweredQuestion['answer']>;
}

function AnswerSectionCard({ section, answerMap }: CardProps) {
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm">
      {/* 标题头，样式与设计图对齐 */}
      <div className="bg-[#F0F7FF] border-l-4 border-[#2563EB] px-5 py-2">
        <h3 className="text-lg font-bold text-[#1E40AF]">
          {section.sectionNumber}. {section.title}
        </h3>
      </div>
      {/* 内容区域 */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {section.parts.map((part, index) => (
          <PartAnswerView
            key={part.partNumber || index}
            part={part}
            answerMap={answerMap}
          />
        ))}
      </div>
    </div>
  );
}

interface PartAnswerViewProps {
  part: Part;
  answerMap: Map<string, AnsweredQuestion['answer']>;
}

function PartAnswerView({ part, answerMap }: PartAnswerViewProps) {
  // 3. 【视觉还原】: 如果有 part.instructions，将其作为子标题展示，与设计图一致
  const hasSubheading = !!part.instructions;

  return (
    <div>
      {hasSubheading && (
        <p className="text-base text-black font-medium mb-2">
          {part.instructions}:
        </p>
      )}
      <div className="flex flex-col gap-1 pl-4">
        {part.content.map((question) => (
          <SingleAnswer
            key={question.data.id}
            question={question}
            // 4. 从 answerMap 中直接、高效地获取答案
            answer={answerMap.get(question.data.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SingleAnswerProps {
  question: Question;
  answer: AnsweredQuestion['answer'] | undefined;
}

function SingleAnswer({ question, answer }: SingleAnswerProps) {
  if (answer === undefined) return null; // 如果没有答案，不渲染任何内容

  // 5. 【数据驱动】: 题目编号直接从 question.data.questionText 或 question.data.text 中提取
  const getQuestionNumber = (text: string): string => {
    const match = text.match(/^(\d+)\.?\s*/);
    return match ? `${match[1]}.` : '';
  };

  const questionText =
    'questionText' in question.data
      ? question.data.questionText
      : question.data.text;
  const questionNumber = getQuestionNumber(questionText);

  // 6. 【格式化】: 使用辅助函数格式化不同类型的答案，以匹配设计图
  const formattedAnswer = formatAnswer(answer);

  return (
    <div className="flex items-start">
      <span className="w-8 font-medium text-black">{questionNumber}</span>
      <span className="font-medium" style={{ color: ANSWER_COLOR }}>
        {formattedAnswer}
      </span>
    </div>
  );
}

/**
 * 格式化答案的辅助函数，使其输出与设计图完全一致
 * @param ans - 原始答案数据
 * @returns 格式化后的字符串
 */
function formatAnswer(ans: AnsweredQuestion['answer']): string {
  if (Array.isArray(ans)) {
    // 对于选择题，只取选项内容，去掉 "A. " 前缀
    return ans.map((item) => item.replace(/^[A-Z]\.\s*/, '')).join(', ');
  }
  if (typeof ans === 'boolean') {
    return ans ? 'T (正确)' : 'F (错误)';
  }
  return String(ans);
}
