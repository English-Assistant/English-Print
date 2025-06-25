import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';
import { PreclassGuidePage } from '@/components/PreclassGuidePage';
import { useTitle } from 'ahooks';

export const Route = createFileRoute('/preclass-guide/$id')({
  component: PreclassGuideRouteComponent,
});

function PreclassGuideRouteComponent() {
  const { id } = Route.useParams();
  const paper = usePaperStore((state) => state.getPaperById(id));

  const title = `${paper?.title} 课程导读`;
  useTitle(title);

  if (!paper) {
    return <div className="p-6">未找到试卷数据</div>;
  }

  if (!paper.preclass) {
    return <div className="p-6">暂无课前导读内容</div>;
  }

  return <PreclassGuidePage paper={paper} title={title} />;
}
