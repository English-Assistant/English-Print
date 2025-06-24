import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore, useCourseStore } from '@/stores';
import ExamPaperViewer from '@/components/ExamPaperViewer';
import type { ExamPaper } from '@/data/types/exam';
import PrintPageLayout from '@/components/PrintPageLayout';

export const Route = createFileRoute('/paper/$id')({
  component: ExamPaperPage,
});

function ExamPaperPage() {
  const { id } = Route.useParams() as { id: string };
  const paperRecord = usePaperStore((state) => state.getPaperById(id));
  const course = useCourseStore((state) =>
    state.getCourseById(paperRecord?.courseId ?? ''),
  );

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
    <PrintPageLayout className="pt-8 pb-32">
      <PrintPageLayout.CenteredHeader
        title={examPaper.title || 'English Examination'}
        courseTitle={course?.title}
      />

      {/* 试卷正文 */}
      <div>
        <ExamPaperViewer paper={examPaper} />
      </div>
    </PrintPageLayout>
  );
}
