import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';
import ExamPaperViewer from '@/components/ExamPaperViewer';
import type { ExamPaper } from '@/data/types/exam';

export const Route = createFileRoute('/paper/$id')({
  component: ExamPaperPage,
});

function ExamPaperPage() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = usePaperStore();
  const paperRecord = papers.find((p) => p.id === id);
  if (!paperRecord) {
    return <div className="p-6">未找到试卷数据</div>;
  }

  if (!paperRecord.examJson) {
    return <div className="p-6">暂无试卷 JSON 数据</div>;
  }

  let examPaper: ExamPaper;
  try {
    examPaper = paperRecord.examJson;
  } catch (err) {
    console.error(err);
    return <div className="p-6 text-red-600">试卷 JSON 解析失败</div>;
  }

  return (
    <div className="w-[794px] mx-auto pt-8 pb-32 print:w-[210mm] print:min-h-[297mm] flex flex-col gap-2">
      {/* 试卷标题及学生信息 */}
      <h1 className="text-[24px] leading-8 font-bold text-blue-800 text-center">
        {examPaper.title || 'English Examination'}
      </h1>
      <div className="flex items-center gap-8 text-gray-700 font-medium px-12 my-4 justify-center">
        <div className="flex gap-2 items-baseline" style={{ minWidth: 260 }}>
          <span>Student Name:</span>
          <span className="border-b border-gray-400 inline-block min-w-[160px]" />
        </div>
        <div className="flex gap-2 items-baseline">
          <span>Date:</span>
          <span className="border-b border-gray-400 inline-block min-w-[128px]" />
        </div>
      </div>
      <hr className="border-gray-300 w-[730px] mx-auto" />

      {/* 试卷正文 */}
      <ExamPaperViewer paper={examPaper} />
    </div>
  );
}
