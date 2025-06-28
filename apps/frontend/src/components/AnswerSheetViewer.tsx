// AnswerSheetViewer.tsx (已修复BUG并优化)
import type {
  ExamPaper,
  Section,
  Part,
  Question,
  FillInBlankData,
} from '@/data/types/exam';
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
  // 这部分代码无变化，保持原样
  const answerMap = useMemo(() => {
    const map = new Map<string, AnsweredQuestion['answer']>();
    answer.sections.forEach((answerSection) => {
      answerSection.parts.forEach((answerPart) => {
        // 安全性检查：确保 answerPart 和 content 存在
        if (answerPart?.content) {
          answerPart.content.forEach((ans) => {
            map.set(ans.id, ans.answer);
          });
        }
      });
    });
    return map;
  }, [answer]);

  return (
    <div className="flex flex-col gap-4">
      {exam.sections.map((section) => (
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
  // 这部分代码无变化，保持原样
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm">
      <div className="bg-[#F0F7FF] border-l-4 border-[#2563EB] px-5 py-2">
        <h3 className="text-lg font-bold text-[#1E40AF]">
          {section.sectionNumber}. {section.title}
        </h3>
      </div>
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
  // 这部分代码无变化，保持原样
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

  // =================================================================
  //  ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 核心修复区域 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
  // =================================================================
  const getQuestionNumber = (): string => {
    // 优先处理单词拼写题：直接从结构化数据中获取题号，最可靠
    if (question.questionType === 'FILL_IN_BLANK') {
      // 使用类型断言告诉TS，这里的data是FillInBlankData
      return (question.data as FillInBlankData).number || '';
    }

    // 对于其他题型，从文本中提取
    const text =
      'questionText' in question.data
        ? question.data.questionText
        : 'text' in question.data
          ? question.data.text
          : '';

    const match = text.match(/^(\d+)\.?\s*/);
    return match ? `${match[1]}.` : '';
  };
  // =================================================================
  //  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ 核心修复区域 ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  // =================================================================

  const questionNumber = getQuestionNumber();
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

function formatAnswer(ans: AnsweredQuestion['answer']): string {
  // 这部分代码无变化，保持原样
  if (Array.isArray(ans)) {
    return ans.map((item) => item.replace(/^[A-Z]\.\s*/, '')).join(', ');
  }
  if (typeof ans === 'boolean') {
    return ans ? 'T (正确)' : 'F (错误)';
  }
  // 增加对字符串答案的前缀移除，以防AI偶尔出错
  if (typeof ans === 'string') {
    return ans.replace(/^[A-Z]\.\s*/, '');
  }
  return String(ans);
}
