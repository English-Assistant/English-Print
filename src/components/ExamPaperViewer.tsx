import type { ExamPaper, Section, Part } from '@/data/types/exam';

/*
 * ExamPaperViewer
 * 根据 ExamPaper JSON 数据渲染排版后的试卷页面。
 * - 自动将含"听力/Listening"关键字的大题置于第一位
 * - 采用与设计稿一致的排版与颜色（使用 Tailwind）
 */
export interface ExamPaperViewerProps {
  paper: ExamPaper;
}

export default function ExamPaperViewer({ paper }: ExamPaperViewerProps) {
  const reorderSections = (sections: Section[]): Section[] => {
    const copy = [...sections];
    const idx = copy.findIndex((s) => /听力|listening/i.test(s.title));
    if (idx > 0) {
      const [listen] = copy.splice(idx, 1);
      copy.unshift(listen);
    }
    return copy;
  };

  const sections = reorderSections(paper.sections);

  const toRoman = (num: number): string => {
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

  return (
    <div className="flex flex-col gap-4">
      {sections.map((sec, idx) => (
        <SectionView key={idx} section={sec} displayNumber={toRoman(idx + 1)} />
      ))}
    </div>
  );
}

interface SectionViewProps {
  section: Section;
  displayNumber: string;
}

function SectionView({ section, displayNumber }: SectionViewProps) {
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm px-6 pb-6 pt-1">
      {/* Header */}
      <div className="bg-[#F0F7FF] border-l-4 border-[#2563EB] pl-5 py-3 mt-1 flex items-center">
        <h2 className="text-lg font-semibold text-[#1E40AF]">
          {displayNumber}. {section.title}
        </h2>
      </div>

      {/* Instructions */}
      {section.instructions && (
        <p className="mt-4 text-gray-900 leading-5">{section.instructions}</p>
      )}

      <div className="flex flex-col gap-4 mt-4">
        {section.parts.map((p, idx) => (
          <PartView key={idx} part={p} />
        ))}
      </div>
    </div>
  );
}

interface PartViewProps {
  part: Part;
}

function PartView({ part }: PartViewProps) {
  return (
    <div>
      {(part.partNumber || part.instructions) && (
        <div className="mb-2 flex items-start gap-2">
          {part.partNumber && (
            <span className="font-medium text-base text-gray-900">
              {part.partNumber}
            </span>
          )}
          {part.instructions && (
            <span className="text-gray-900 leading-5">{part.instructions}</span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {part.content.map((item, idx) => (
          <ContentItemView key={idx} item={item} qIndex={idx + 1} />
        ))}
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ContentItemView({ item, qIndex }: { item: any; qIndex: number }) {
  if (!item || typeof item !== 'object') return null;

  switch (item.type) {
    case 'WORD_BANK':
      return (
        <div className="bg-gray-100 rounded-md px-3 py-2 text-gray-900 font-medium">
          {item.label ? `${item.label} ` : '选项：'}
          {Array.isArray(item.words) ? item.words.join(' ') : ''}
        </div>
      );
    case 'MATCHING':
      return (
        <div className="flex gap-6">
          <div className="flex flex-col gap-2">
            {item.stems?.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-medium">{i + 1}.</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
          <div className="border-l border-gray-300" />
          <div className="flex flex-col gap-2">
            {item.options?.map((o: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-medium">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span>{o.text}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'READING_PASSAGE':
      return (
        <div className="bg-gray-50 rounded-md px-4 py-4 leading-6 text-gray-900">
          {item.text}
        </div>
      );
    case 'QUESTION':
      return <QuestionView question={item} qIndex={qIndex} />;
    default:
      return null;
  }
}

function QuestionView({ question, qIndex }: { question: any; qIndex: number }) {
  const { questionType, data } = question;

  switch (questionType) {
    case 'MULTI_SELECT_CHOICE':
      return (
        <div className="flex flex-col gap-1">
          <span>
            {qIndex}. {data.questionText}
          </span>
          <div className="flex flex-wrap gap-4 pl-4">
            {data.options?.map((opt: string, idx: number) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="inline-block w-4 h-4 border border-gray-400" />
                {opt}
              </span>
            ))}
          </div>
        </div>
      );
    case 'TRUE_FALSE':
      return (
        <div className="flex justify-between items-center">
          <span>
            {qIndex}. {data.questionText}
          </span>
          <div className="flex gap-6 pr-8">
            {['T', 'F'].map((v) => (
              <label key={v} className="flex items-center gap-1">
                <span className="inline-block w-4 h-4 border border-gray-400 rounded-full" />
                {v}
              </label>
            ))}
          </div>
        </div>
      );
    case 'FILL_IN_BLANK_AND_TRANSLATE':
    case 'FILL_IN_BLANK':
      return (
        <div className="flex items-start gap-2">
          <span>{qIndex}.</span>
          <span className="flex-1">{data.text?.replace(/__/g, '______')}</span>
        </div>
      );
    case 'TRANSLATE_ZH_TO_EN':
    case 'TRANSLATE_EN_TO_ZH':
    case 'OPEN_ENDED':
    case 'GUIDED_WRITING':
      return (
        <div className="flex flex-col gap-1">
          <span>
            {qIndex}. {data.text}
          </span>
          <div className="border-b border-dashed border-gray-300 h-8" />
        </div>
      );
    default:
      return null;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
