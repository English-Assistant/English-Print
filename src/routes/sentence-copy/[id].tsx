import { createFileRoute } from '@tanstack/react-router';
import { useStore } from '@/store';

export const Route = createFileRoute('/sentence-copy/[id]')({
  component: SentenceCopy,
});

function SentenceCopy() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = useStore();
  const paper = papers.find((p) => p.id === id);

  if (!paper) {
    return <div className="p-6">未找到试卷</div>;
  }

  type CopyJson = { words?: string[]; sentences?: string[] };

  let data: CopyJson | null = null;
  try {
    data = paper.copyJson ? (JSON.parse(paper.copyJson) as CopyJson) : null;
  } catch {
    data = null;
  }

  if (!data) return <div className="p-6">暂无抄写数据</div>;

  const words = data.words ?? [];
  const sentences = data.sentences ?? [];

  return (
    <div className="w-[794px] mx-auto flex flex-col gap-6 pt-8 pb-[456px] print:w-[210mm] print:min-h-[297mm]">
      <h1 className="text-2xl font-bold text-blue-900 text-center">
        英语句型抄写练习
      </h1>

      {/* 学生信息 */}
      <div className="flex justify-between px-8 text-gray-600">
        <div className="flex items-center gap-2 w-1/2 max-w-[240px]">
          <span>学生姓名:</span>
          <div className="flex-1 border-b border-gray-400 h-px" />
        </div>
        <div className="flex items-center gap-2 w-1/3 max-w-[200px]">
          <span>日期:</span>
          <div className="flex-1 border-b border-gray-400 h-px" />
        </div>
      </div>

      <hr className="border-gray-200" />

      <Section title="I. 单词抄写">
        {words.map((word, idx) => (
          <CopyLine key={word} index={idx + 1} content={word} />
        ))}
      </Section>

      <Section title="II. 句子抄写">
        {sentences.map((sentence, idx) => (
          <CopyLine
            key={sentence}
            index={idx + 1}
            content={sentence}
            withExtraTop={idx !== 0}
          />
        ))}
      </Section>

      <footer className="mt-auto border-t border-gray-200 text-center text-gray-500 pt-4">
        第1页
      </footer>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
function Section({ title, children }: SectionProps) {
  return (
    <section className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-[#F0F7FF] flex items-center px-6 py-3 border-l-4 border-blue-600">
        <h2 className="text-lg font-semibold text-blue-900">{title}</h2>
      </div>
      <div className="flex flex-col gap-4 mt-4">{children}</div>
    </section>
  );
}

interface CopyLineProps {
  index: number;
  content: string;
  withExtraTop?: boolean;
}
function CopyLine({ index, content, withExtraTop }: CopyLineProps) {
  return (
    <div
      className={`flex items-center gap-4 px-6${withExtraTop ? ' mt-4' : ' mt-0'}`}
    >
      <span>{index}.</span>
      <span>{content}</span>
      <div className="flex-1 border-b border-gray-400" />
    </div>
  );
}
