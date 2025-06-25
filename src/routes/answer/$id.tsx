import { createFileRoute } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import { AnswerPage } from '@/components/AnswerPage';
import { useTitle } from 'ahooks';

export const Route = createFileRoute('/answer/$id')({
  component: AnswerRouteComponent,
});

function AnswerRouteComponent() {
  const { id } = Route.useParams() as { id: string };
  const paper = usePaperStore((state) => state.getPaperById(id));
  const course = useCourseStore((state) =>
    state.getCourseById(paper?.courseId ?? ''),
  );

  const title = `${paper?.title} 答案卡`;
  useTitle(title);

  if (!paper) return <div className="p-6">未找到试卷</div>;

  if (!paper.examJson || !paper.answerJson) {
    return <div className="p-6">试卷或答案数据不完整</div>;
  }

  return <AnswerPage paper={paper} course={course} title={title} />;
}
