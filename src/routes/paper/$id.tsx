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
    examPaper = paperRecord.examJson as unknown as ExamPaper;
  } catch (err) {
    console.error(err);
    return <div className="p-6 text-red-600">试卷 JSON 解析失败</div>;
  }

  return (
    <div className="w-[794px] mx-auto pt-8 pb-32 print:w-[210mm] print:min-h-[297mm]">
      {/* 试卷标题及学生信息 */}
      <h1 className="text-2xl font-bold text-blue-900 text-center">
        {examPaper.title || 'English Examination'}
      </h1>
      <div className="flex items-center gap-12 mt-2 text-gray-600 font-medium">
        <div className="flex items-center gap-2">
          <span>Student Name:</span>
          <span className="inline-block border-b border-gray-400 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <span>Date:</span>
          <span className="inline-block border-b border-gray-400 w-32" />
        </div>
      </div>
      <div className="border-t border-gray-300 my-2" />

      {/* 试卷正文 */}
      <ExamPaperViewer paper={examPaper} />

      {/* 页脚 */}
      <footer className="mt-6 border-t border-gray-200 text-center text-gray-500 pt-4">
        Page 1 of 1
      </footer>
    </div>
  );
}
