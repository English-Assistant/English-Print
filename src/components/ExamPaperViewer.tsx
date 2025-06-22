// 导入 React 的 useMemo 钩子和您提供的类型定义
// 移除了不存在的类型引用，如 ContentItem, WordBank 等
import { useMemo } from 'react';
import type {
  ExamPaper,
  Section,
  Part,
  Question,
  MultiSelectChoiceData, // 明确导入具体数据类型，以辅助类型推断
  TrueFalseData,
  FillInBlankData,
  TranslationData,
} from '@/data/types/exam';

/* =================================================================
 *  试卷渲染器：ExamPaperViewer (已修复和重构)
 * =================================================================
 *  该组件已根据您提供的 `exam.d.ts` 文件进行了重构，解决了类型不匹配的问题。
 *
 *  核心修复点:
 *  1.  【类型对齐】: 严格遵循 `Part.content` 只包含 `Question[]` 的定义。
 *      移除了对 WordBank, Matching, ReadingPassage 等非标准类型的处理逻辑。
 *      现在整个组件完全类型安全，符合您的数据结构。
 *  2.  【结构简化】: 由于内容项类型单一，移除了多余的 `ContentItemView` 分发组件，
 *      直接由 `PartView` 渲染 `QuestionView`，代码逻辑更清晰。
 *  3.  【字段修正】: 修正了所有从 `data` 对象中取值的字段，例如，现在正确使用
 *      `data.questionText` (选择题/判断题) 和 `data.text` (填空/翻译题)。
 *  4.  【视觉保留】: 所有为了还原设计图的 UI 样式和 Tailwind CSS 类名均已保留和优化。
 */

// 组件的 Props 定义
export interface ExamPaperViewerProps {
  paper: ExamPaper;
}

// 主组件定义
export default function ExamPaperViewer({ paper }: ExamPaperViewerProps) {
  // 使用 useMemo 优化大题排序逻辑
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

// ===================================
//  辅助子组件
// ===================================

/**
 * 【大题】渲染组件
 */
function SectionView({ section }: { section: Section }) {
  return (
    <article className="border border-gray-200 rounded-lg mx-8 mt-4 overflow-hidden pb-6">
      {/* 大题标题头 */}
      <div className="bg-[#F0F7FF] border-l-4 border-[#2563EB] px-6 py-3">
        <h2 className="text-lg font-semibold text-[#1E40AF]">
          {section.sectionNumber}. {section.title}
          {section.points > 0 && (
            <span className="ml-3 font-normal text-base text-gray-600">
              (共 {section.points} 分)
            </span>
          )}
        </h2>
      </div>

      {/* 大题说明 */}
      {section.instructions && (
        <p className="mt-4 mb-4 text-gray-700 px-6">{section.instructions}</p>
      )}

      {/* 包含所有子部分的容器 */}
      <div className="flex flex-col gap-6 px-6">
        {section.parts.map((part, index) => (
          <PartView key={part.partNumber || `part-${index}`} part={part} />
        ))}
      </div>
    </article>
  );
}

/**
 * 【子部分】渲染组件 (重构核心)
 * 直接遍历 content 数组并渲染 QuestionView
 */
function PartView({ part }: { part: Part }) {
  return (
    <div>
      {/* 子部分说明 */}
      {part.instructions && (
        <p className="mb-3 font-semibold text-gray-800">{part.instructions}</p>
      )}
      {/* 题目内容容器 - 现在直接渲染 QuestionView */}
      <div className="flex flex-col gap-5">
        {part.content.map((question) => (
          // 使用题目数据中唯一的 id 作为 key
          <QuestionView key={question.data.id} question={question} />
        ))}
      </div>
    </div>
  );
}

/**
 * 【具体问题】渲染组件 (最核心的渲染逻辑)
 * 根据 questionType 决定如何渲染
 */
function QuestionView({ question }: { question: Question }) {
  const { questionType, data } = question;

  // 统一获取题干文本，兼容 questionText 和 text 两种字段
  const getStemText = (): string => {
    if ('questionText' in data)
      return (data as MultiSelectChoiceData | TrueFalseData).questionText;
    if ('text' in data) return (data as FillInBlankData | TranslationData).text;
    return '';
  };
  const stemText = getStemText();

  switch (questionType) {
    case 'MULTI_SELECT_CHOICE': {
      const choiceData = data as MultiSelectChoiceData;
      return (
        <div className="flex flex-col gap-2">
          <p>{stemText}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pl-4">
            {choiceData.options?.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-sm border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <span>{opt}</span>
              </label>
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

    case 'FILL_IN_BLANK': {
      return (
        <p
          dangerouslySetInnerHTML={{
            __html: stemText.replace(
              /__/g,
              '<span class="inline-block w-32 border-b border-gray-500 mx-1"></span>',
            ),
          }}
        />
      );
    }

    case 'FILL_IN_BLANK_AND_TRANSLATE': {
      return (
        <div>
          <p
            dangerouslySetInnerHTML={{
              __html: stemText.replace(
                /__/g,
                '<span class="inline-block w-32 border-b border-gray-500 mx-1"></span>',
              ),
            }}
          />
          <div className="mt-2 flex items-center gap-2">
            <span>翻译：</span>
            <span className="flex-1 border-b border-gray-400 h-6"></span>
          </div>
        </div>
      );
    }

    case 'OPEN_ENDED': {
      return (
        <div className="flex flex-col gap-2">
          <p>{stemText}</p>
          <div className="border border-dashed border-gray-400 rounded-md min-h-[5rem] p-2"></div>
        </div>
      );
    }

    case 'GUIDED_WRITING':
    case 'TRANSLATE_EN_TO_ZH':
    case 'TRANSLATE_ZH_TO_EN': {
      return (
        <div className="flex flex-col gap-2">
          <p>{stemText}</p>
          <div className="border-b border-gray-400 h-7 mt-1"></div>
        </div>
      );
    }

    default:
      // 为未知的题目类型提供一个友好的降级显示
      return <p className="text-red-500">不支持的题目类型: {questionType}</p>;
  }
}
