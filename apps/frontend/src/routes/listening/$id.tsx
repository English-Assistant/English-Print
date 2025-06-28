import { createFileRoute } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import { useTitle } from 'ahooks';
import { ListeningPage } from '@/components/ListeningPage';

export const Route = createFileRoute('/listening/$id')({
  component: ListeningRouteComponent,
});

function ListeningRouteComponent() {
  const { id } = Route.useParams() as { id: string };
  const paper = usePaperStore((state) => state.getPaperById(id));
  const course = useCourseStore((state) =>
    state.getCourseById(paper?.courseId ?? ''),
  );
  const title = `${paper?.title} 听力素材`;
  useTitle(title);

  if (!paper) {
    return <div className="p-6">未找到试卷</div>;
  }

  if (!paper.listeningJson) {
    return <div className="p-6">暂无听力数据</div>;
  }

  return <ListeningPage paper={paper} course={course} title={title} />;
}
