import type { ExamPaper, Section } from '@/data/types/exam';
import type { ExamAnswerSheet, AnswerSection } from '@/data/types/answer';

export interface AnswerSheetViewerProps {
  exam: ExamPaper;
  answer: ExamAnswerSheet;
}

// 颜色常量
const ANSWER_COLOR = '#15803D';

export default function AnswerSheetViewer({
  exam,
  answer,
}: AnswerSheetViewerProps) {
  const toRoman = (num: number) => {
    const romans = [
      '',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
    ];
    return romans[num] ?? num.toString();
  };

  const answerSectionMap = new Map<string, AnswerSection>();
  answer.sections.forEach((sec) =>
    answerSectionMap.set(sec.sectionNumber, sec),
  );

  return (
    <div className="flex flex-col gap-3">
      {exam.sections.map((sec, idx) => (
        <AnswerSectionCard
          key={idx}
          section={sec}
          answerSection={answerSectionMap.get(sec.sectionNumber)}
          displayNumber={toRoman(idx + 1)}
        />
      ))}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CardProps {
  section: Section;
  answerSection: any | undefined;
  displayNumber: string;
}

function AnswerSectionCard({
  section,
  answerSection,
  displayNumber,
}: CardProps) {
  if (!answerSection) return null;
  const partMap = new Map<string, any>();
  answerSection.parts?.forEach((p: any) => partMap.set(p.partNumber, p));

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm">
      {/* header */}
      <div className="bg-[#F0F7FF] border-l-4 border-[#2563EB] px-5 py-2 flex items-center">
        <h3 className="text-[#1E40AF] leading-6">
          {displayNumber}. {section.title}
        </h3>
      </div>
      <div className="flex flex-col gap-2 py-2">
        {section.parts.map((part, pIdx) => (
          <PartAnswerView
            key={pIdx}
            part={part}
            answerPart={partMap.get(part.partNumber)}
            index={pIdx + 1}
          />
        ))}
      </div>
    </div>
  );
}

function PartAnswerView({
  part,
  answerPart,
  index,
}: {
  part: any;
  answerPart: any;
  index: number;
}) {
  if (!answerPart) return null;

  // 如果有 instructions，用作子标题。例如"1. 听单词答案："
  return (
    <div className="px-4 space-y-1">
      {part.instructions && (
        <p className="text-sm text-black font-medium mt-2">
          {index}. {part.instructions}：
        </p>
      )}

      {answerPart.content?.map((ansItem: any, idx: number) => {
        if (ansItem.type === 'QUESTION') {
          const qIdx = idx + 1;
          const text = formatAnswer(ansItem.answer);
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-4 text-black">{qIdx}.</span>
              <span className="text-[16px]" style={{ color: ANSWER_COLOR }}>
                {text}
              </span>
            </div>
          );
        }
        if (ansItem.type === 'MATCHING') {
          // answer is object mapping stemId->optionId, display sequential as 1 - A
          return Object.entries(ansItem.answer).map(([key, val], i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-6 text-black">{key} -</span>
              <span className="text-[16px]" style={{ color: ANSWER_COLOR }}>
                {String(val)}
              </span>
            </div>
          ));
        }
        return null;
      })}
    </div>
  );
}

function formatAnswer(ans: any): string {
  if (Array.isArray(ans)) return ans.join(', ');
  if (typeof ans === 'boolean') return ans ? 'T (正确)' : 'F (错误)';
  return String(ans);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
