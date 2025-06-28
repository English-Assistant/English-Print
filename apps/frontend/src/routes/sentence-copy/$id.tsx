import { createFileRoute } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import { CopyExercisePage } from '@/components/CopyExercisePage';
import { useTitle } from 'ahooks';

export const Route = createFileRoute('/sentence-copy/$id')({
  component: SentenceCopyRouteComponent,
});

function SentenceCopyRouteComponent() {
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

  if (!paper.copyJson) {
    return <div className="p-6">暂无抄写数据</div>;
  }

  return <CopyExercisePage paper={paper} course={course} title={title} />;
}
