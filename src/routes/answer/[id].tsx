import { createFileRoute } from '@tanstack/react-router';
import { useStore } from '@/store';

export const Route = createFileRoute('/answer/[id]')({
  component: Answer,
});

function Answer() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = useStore();
  const paper = papers.find((p) => p.id === id);
  if (!paper) return <div className="p-6">未找到试卷</div>;

  type AnswerJson = { left?: SectionData[]; right?: SectionData[] };
  let json: AnswerJson | null = null;
  try {
    json = paper.answerJson
      ? (JSON.parse(paper.answerJson) as AnswerJson)
      : null;
  } catch {
    json = null;
  }
  if (!json) return <div className="p-6">暂无答案数据</div>;

  const leftSections = json.left ?? [];
  const rightSections = json.right ?? [];

  return (
    <div className="w-[794px] mx-auto flex flex-col pt-8 pb-20 gap-6 print:w-[210mm] print:min-h-[297mm]">
      <h1 className="text-2xl font-bold text-blue-900 text-center">
        英语考试答案卡
      </h1>
      <hr className="border-gray-300 w-[730px] mx-auto" />
      <h2 className="text-lg font-medium text-black mt-6">答案速查表</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {leftSections.map((sec) => (
            <AnswerSection key={sec.key} data={sec} />
          ))}
        </div>
        <div className="flex flex-col gap-8">
          {rightSections.map((sec) => (
            <AnswerSection key={sec.key} data={sec} />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center mt-10">
        * 本答案卡仅包含核心答案内容，省略原题及解释说明，以节省纸张
      </p>
      <footer className="mt-auto border-t border-gray-200 text-center text-gray-500 pt-4">
        英语考试答案卡
      </footer>
    </div>
  );
}

interface SectionData {
  key: string;
  title: string;
  items: { no: string; answer: string }[];
}
interface AnswerSectionProps {
  data: SectionData;
}
function AnswerSection({ data }: AnswerSectionProps) {
  return (
    <section>
      <div className="bg-[#F0F7FF] border-l-4 border-blue-600 px-2 py-1">
        <h3 className="text-blue-900 leading-6">{`${data.key}. ${data.title}`}</h3>
      </div>
      <div className="flex flex-col divide-y divide-gray-200">
        {data.items.map((item) => (
          <div
            key={item.no}
            className="flex justify-start items-start gap-6 py-2 text-[16px]"
          >
            <span className="w-6 flex-shrink-0 text-black">{item.no}</span>
            <span className="text-green-800 break-words flex-1">
              {item.answer}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
