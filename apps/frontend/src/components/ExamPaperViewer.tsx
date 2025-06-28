/* eslint-disable no-irregular-whitespace */
// src/components/ExamPaperViewer.tsx (最终版，整合新样式并优化打印)
import { useMemo } from 'react';
import type {
  ExamPaper,
  Section,
  Part,
  Question,
  MultiSelectChoiceData,
  TrueFalseData,
  FillInBlankData,
  OpenEndedData,
  GuidedWritingData,
} from '@/data/types/exam';

export interface ExamPaperViewerProps {
  paper: ExamPaper;
}

export default function ExamPaperViewer({ paper }: ExamPaperViewerProps) {
  // 这部分代码无变化，保持原样
  const reorderedSections = useMemo(() => {
    const sectionsCopy = [...paper.sections];
    const listeningIndex = sectionsCopy.findIndex((s) =>
      /听力|listening/i.test(s.title),
    );
    if (listeningIndex > 0) {
      const [listeningSection] = sectionsCopy.splice(listeningIndex, 1);
      sectionsCopy.unshift(listeningSection);
    }
    return sectionsCopy;
  }, [paper]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {reorderedSections.map((section) => (
        <SectionView key={section.sectionNumber} section={section} />
      ))}
    </div>
  );
}

function SectionView({ section }: { section: Section }) {
  // 完全保留您优化的新样式
  return (
    <article className="mt-4 pb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <header className="bg-blue-50 border-l-4 border-blue-600 rounded-t-lg px-5 py-3 mb-4">
        <h2 className="text-lg font-semibold text-blue-900 flex items-baseline gap-3">
          <span>{section.sectionNumber}</span>
          <span>{section.title}</span>
          {section.points > 0 && (
            <span className="ml-2 font-normal text-base text-gray-600">
              (共 {section.points} 分)
            </span>
          )}
        </h2>
      </header>

      <div className="px-6">
        {section.instructions && section.instructions !== section.title && (
          <p className="mb-4 text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
            {section.instructions}
          </p>
        )}

        <div className="flex flex-col gap-6">
          {section.parts.map((part, index) => (
            <PartView
              key={part.partNumber || `part-${index}`}
              part={part}
              sectionTitle={section.title}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function PartView({
  part,
  sectionTitle,
}: {
  part: Part;
  sectionTitle: string;
}) {
  return (
    <div>
      {part.instructions && part.instructions !== sectionTitle && (
        <p className="mb-4 font-medium text-gray-800 bg-gray-100 px-4 py-2 rounded">
          {part.instructions}
        </p>
      )}
      {part.passage && (
        <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-800 leading-relaxed">
          <p style={{ whiteSpace: 'pre-wrap' }}>{part.passage}</p>
        </div>
      )}
      <div className="flex flex-col gap-5 pl-4">
        {part.content.map((question) => (
          <QuestionView key={question.data.id} question={question} />
        ))}
      </div>
    </div>
  );
}

// 这是我们修改的核心区域
function QuestionView({ question }: { question: Question }) {
  const { questionType, data } = question;

  switch (questionType) {
    // =================================================================
    //  ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 选择题核心修改区域 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
    // =================================================================
    case 'MULTI_SELECT_CHOICE': {
      const choiceData = data as MultiSelectChoiceData;
      return (
        <div className="flex flex-col gap-3">
          {/* 将题干和打印用的括号放在一个 flex 容器中 */}
          <div className="flex justify-between items-baseline">
            <p className="flex-grow">{choiceData.questionText}</p>
            {/* === 打印时显示的、供手写的版本 === */}
            <div className="hidden print:block pl-4">
              <span className="font-semibold text-lg text-gray-400">
                (      )
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 pl-4">
            {choiceData.options?.map((opt, idx) => (
              <div key={idx}>
                {/* === 屏幕上显示的、可交互的版本 === */}
                <label className="flex items-center gap-2 cursor-pointer print:hidden">
                  <input
                    type="radio"
                    name={data.id} // 确保同组题目单选
                    value={opt}
                    className="w-4 h-4 border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{String.fromCharCode(65 + idx)}.</span>
                  <span>{opt}</span>
                </label>

                {/* === 打印时显示的、纯文本选项 === */}
                <div className="hidden print:flex print:items-baseline print:gap-2">
                  <span>
                    {String.fromCharCode(65 + idx)}. {opt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // =================================================================
    //  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ 选择题核心修改区域 ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    // =================================================================
    case 'TRUE_FALSE': {
      const trueFalseData = data as TrueFalseData;
      return (
        <div className="flex justify-between items-center pr-4">
          <p>{trueFalseData.questionText}</p>

          {/* 这个容器包含了屏幕和打印两种状态 */}
          <div>
            {/* === 屏幕上显示的、可交互的版本 === */}
            <div className="flex items-center gap-4 print:hidden">
              {['T', 'F'].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={data.id}
                    value={val}
                    className="w-4 h-4 border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{val}</span>
                </label>
              ))}
            </div>

            {/* === 打印时显示的、供手写的版本 === */}
            <div className="hidden print:block">
              <span className="font-semibold text-lg text-gray-400">
                (      )
              </span>
            </div>
          </div>
        </div>
      );
    }

    case 'FILL_IN_BLANK': {
      const spellingData = data as FillInBlankData;
      const promptPart = `${spellingData.number} (${spellingData.hint}) ${spellingData.stem}`;

      return (
        <div className="flex items-end">
          <span>{promptPart}</span>
          <span className="flex-1 border-b border-gray-400 ml-2 min-w-[150px]"></span>
        </div>
      );
    }

    case 'OPEN_ENDED': {
      const openEndedData = data as OpenEndedData;
      return (
        <div className="flex flex-col">
          <p className="mb-2">{openEndedData.text}</p>
          <div className="flex flex-col gap-5 mt-1">
            <div className="w-full border-b border-gray-400 h-[1.5em]"></div>
          </div>
        </div>
      );
    }
    case 'GUIDED_WRITING': {
      const guidedWritingData = data as GuidedWritingData;
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-medium text-gray-700">请用以下词语造句:</span>
            <span className="text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded">
              {guidedWritingData.words.join(' | ')}
            </span>
          </div>
          {guidedWritingData.hint && (
            <div className="mb-2 text-sm text-gray-600">
              <span className="font-medium">提示：</span>
              <span>{guidedWritingData.hint}</span>
            </div>
          )}
          <div className="flex flex-col gap-5 mt-1">
            <div className="w-full border-b border-gray-400 h-[1.5em]"></div>
            <div className="w-full border-b border-gray-400 h-[1.5em]"></div>
          </div>
        </div>
      );
    }

    default:
      return <p className="text-red-500">不支持的题目类型: {questionType}</p>;
  }
}
