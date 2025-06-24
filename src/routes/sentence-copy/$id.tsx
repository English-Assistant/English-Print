import { createFileRoute } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import PrintPageLayout from '@/components/PrintPageLayout';
import { useTitle } from 'ahooks';

export const Route = createFileRoute('/sentence-copy/$id')({
  component: SentenceCopy,
});

function SentenceCopy() {
  const { id } = Route.useParams() as { id: string };
  const paper = usePaperStore((state) => state.getPaperById(id));
  const course = useCourseStore((state) =>
    state.getCourseById(paper?.courseId ?? ''),
  );

  const title = `${paper?.title} 抄写练习`;
  useTitle(title);

  if (!paper) {
    return <div className="p-6">未找到试卷</div>;
  }

  const data = paper.copyJson;

  if (!data) return <div className="p-6">暂无抄写数据</div>;

  const words = data?.word_copy ?? [];
  const sentences = data?.sentence_copy ?? [];
  const transforms = data?.sentence_transform ?? [];

  return (
    <PrintPageLayout>
      <PrintPageLayout.CenteredHeader
        title={title}
        courseTitle={course?.title}
      />

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
            lines={3}
          />
        ))}
      </Section>

      {transforms.length > 0 && (
        <Section title="III. 句子变形抄写">
          {transforms.map((s, idx) => (
            <CopyLine
              key={s}
              index={idx + 1}
              content={s}
              withExtraTop={idx !== 0}
              lines={3}
            />
          ))}
        </Section>
      )}
    </PrintPageLayout>
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
      <div className="flex flex-col gap-4 my-4">{children}</div>
    </section>
  );
}

interface CopyLineProps {
  index: number;
  content: string;
  withExtraTop?: boolean;
  lines?: number;
}
function CopyLine({ index, content, withExtraTop, lines = 1 }: CopyLineProps) {
  return (
    <div
      className={`flex flex-col text-black px-6${withExtraTop ? ' mt-4' : ' mt-0'}`}
    >
      <div className="flex items-center gap-4 border-b border-gray-400 pb-1">
        <span>{index}.</span>
        <span className="op30">{content}</span>
      </div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div
          key={i}
          className="flex items-baseline gap-4 mt-2 min-h-30px border-b border-gray-400"
        ></div>
      ))}
    </div>
  );
}
