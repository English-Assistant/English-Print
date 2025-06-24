import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore, useCourseStore } from '@/stores';
import ExamPaperViewer from '@/components/ExamPaperViewer';
import PrintPageLayout from '@/components/PrintPageLayout';
import { useTitle } from 'ahooks';

export const Route = createFileRoute('/paper/$id')({
  component: ExamPaperPage,
});

function ExamPaperPage() {
  const { id } = Route.useParams() as { id: string };
  const paperRecord = usePaperStore((state) => state.getPaperById(id));
  const course = useCourseStore((state) =>
    state.getCourseById(paperRecord?.courseId ?? ''),
  );

  const title = `${paperRecord?.title} 试卷`;
  useTitle(title);

  if (!paperRecord) {
    return <div className="p-6">未找到试卷数据</div>;
  }

  if (!paperRecord.examJson) {
    return <div className="p-6">暂无试卷 JSON 数据</div>;
  }

  const examPaper = paperRecord.examJson;
  if (!examPaper) {
    return <div className="p-6">暂无试卷 JSON 数据</div>;
  }
  return (
    <PrintPageLayout className="pt-8 pb-32">
      <PrintPageLayout.CenteredHeader
        title={title}
        courseTitle={course?.title}
      />

      {/* 试卷正文 */}
      <div className="text-black">
        <ExamPaperViewer paper={examPaper} />
      </div>
    </PrintPageLayout>
  );
}
