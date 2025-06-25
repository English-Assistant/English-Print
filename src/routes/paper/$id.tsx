import { createFileRoute } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import { ExamPaperPage } from '@/components/ExamPaperPage';
import { useTitle } from 'ahooks';

export const Route = createFileRoute('/paper/$id')({
  component: ExamPaperRouteComponent,
});

function ExamPaperRouteComponent() {
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

  return <ExamPaperPage paper={paperRecord} course={course} title={title} />;
}
