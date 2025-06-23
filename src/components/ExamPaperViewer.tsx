// src/components/ExamPaperViewer.tsx (已优化)
import { useMemo } from 'react';
import type {
  ExamPaper,
  Section,
  Part,
  Question,
  MultiSelectChoiceData,
  TrueFalseData,
  FillInBlankData,
  TranslationData,
  OpenEndedData, // 引入 OpenEndedData 类型
} from '@/data/types/exam';

/* =================================================================
 *  试卷渲染核心优化 (已解决您提出的所有问题)
 * =================================================================
 *
 *  1. 【问题一：大题标题】:
 *     - 优化了 `SectionView` 组件，将大题号 (如 "I.") 和标题 (如 "Listening Comprehension")
 *       用更醒目的、符合纸质试卷的样式分开展示，增强了视觉层级感。
 *     - 您的 Prompt 会生成包含中文和英文的标题，这里的样式能很好地呈现。
 *
 *  2. 【问题二：填空题下划线】:
 *     - 彻底重构了 `FILL_IN_BLANK` 和 `FILL_IN_BLANK_AND_TRANSLATE` 题型的渲染逻辑。
 *     - 新逻辑通过 `stemText.split('__')` 将题干和填空符分开，然后使用 flex-1 的 span
 *       来创建一个自适应长度的下划线。
 *     - 这完美解决了下划线过长的问题，并能精确实现您期望的 `1. (春天)S___________` 效果。
 *     - (前提是AI生成的JSON中，该题的text字段为："1. (春天) S__")
 *
 *  3. 【问题三：开放题样式】:
 *     - 重写了 `OPEN_ENDED` 题型的渲染方式。
 *     - 移除了原有的虚线框，改为生成3条标准的答题下划线，完全模拟纸质试卷的作答区域。
 *     - 为保持一致性，对 `GUIDED_WRITING` 等类似题型也应用了多行下划线的样式。
 *
 *  4. 【选择题样式】:
 *     - 将多选题的选项渲染从 a,b,c,d 改为更标准的 A, B, C, D。
 * ================================================================= */

export interface ExamPaperViewerProps {
  paper: ExamPaper;
}

export default function ExamPaperViewer({ paper }: ExamPaperViewerProps) {
  const reorderedSections = useMemo(() => {
    /* ... (代码无变化) ... */
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

/**
 * 【大题】渲染组件 (样式优化)
 */
function SectionView({ section }: { section: Section }) {
  return (
    // 移除外层边框，让内容区更舒展
    <article className="mx-8 mt-4 pb-2">
      {/* 大题标题头 - 样式重构 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-black flex items-baseline gap-3">
          <span>{section.sectionNumber}</span>
          <span>{section.title}</span>
          {section.points > 0 && (
            <span className="ml-2 font-normal text-base text-gray-600">
              (共 {section.points} 分)
            </span>
          )}
        </h2>
      </div>

      {/* 大题说明 */}
      {section.instructions && (
        <p className="mb-4 text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
          {section.instructions}
        </p>
      )}

      {/* 包含所有子部分的容器 */}
      <div className="flex flex-col gap-6">
        {section.parts.map((part, index) => (
          <PartView key={part.partNumber || `part-${index}`} part={part} />
        ))}
      </div>
    </article>
  );
}

/**
 * 【子部分】渲染组件
 */
function PartView({ part }: { part: Part }) {
  return (
    <div>
      {part.instructions && (
        <p className="mb-4 font-semibold text-gray-800">{part.instructions}</p>
      )}
      <div className="flex flex-col gap-5 pl-4">
        {part.content.map((question) => (
          <QuestionView key={question.data.id} question={question} />
        ))}
      </div>
    </div>
  );
}

/**
 * 【具体问题】渲染组件 (核心渲染逻辑重构)
 */
function QuestionView({ question }: { question: Question }) {
  const { questionType, data } = question;

  const getStemText = (): string => {
    if ('questionText' in data)
      return (data as MultiSelectChoiceData | TrueFalseData).questionText;
    if ('text' in data)
      return (data as FillInBlankData | TranslationData | OpenEndedData).text;
    return '';
  };
  const stemText = getStemText();

  switch (questionType) {
    case 'MULTI_SELECT_CHOICE': {
      const choiceData = data as MultiSelectChoiceData;
      return (
        <div className="flex flex-col gap-3">
          <p>{stemText}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 pl-4">
            {choiceData.options?.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span>{String.fromCharCode(65 + idx)}.</span>
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'TRUE_FALSE': {
      return (
        <div className="flex justify-between items-center pr-4">
          <p>{stemText}</p>
          <div className="flex items-center gap-4">
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
        </div>
      );
    }

    // --- 问题二：填空题下划线修复 ---
    case 'FILL_IN_BLANK': {
      const [promptPart, restPart] = stemText.split('__');
      return (
        <div className="flex items-baseline">
          <span dangerouslySetInnerHTML={{ __html: promptPart }} />
          <span className="flex-1 border-b border-gray-600 mx-2 min-w-[80px]"></span>
          {restPart && <span>{restPart}</span>}
        </div>
      );
    }

    case 'FILL_IN_BLANK_AND_TRANSLATE': {
      const [promptPart, restPart] = stemText.split('__');
      return (
        <div>
          <div className="flex items-baseline">
            <span dangerouslySetInnerHTML={{ __html: promptPart }} />
            <span className="flex-1 border-b border-gray-600 mx-2 min-w-[80px]"></span>
            {restPart && <span>{restPart}</span>}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span>翻译：</span>
            <span className="flex-1 border-b border-gray-500 h-6"></span>
          </div>
        </div>
      );
    }

    // --- 问题三：开放题样式修复 ---
    case 'OPEN_ENDED':
    case 'GUIDED_WRITING':
    case 'TRANSLATE_EN_TO_ZH':
    case 'TRANSLATE_ZH_TO_EN': {
      // 统一使用多行下划线作答区
      const lines = questionType === 'GUIDED_WRITING' ? 4 : 3; // 作文题行数更多
      return (
        <div className="flex flex-col">
          <p className="mb-2">{stemText}</p>
          <div className="flex flex-col gap-5 mt-1">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className="w-full border-b border-gray-500 h-[1.5em]"
              ></div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return <p className="text-red-500">不支持的题目类型: {questionType}</p>;
  }
}
