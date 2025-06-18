import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, Space } from 'antd';
import { useStore } from '@/store';

export const Route = createFileRoute('/_manage/paper-detail/[id]')({
  component: PaperDetailPage,
});

function PaperDetailPage() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = useStore();
  const paper = papers.find((p) => p.id === id);
  if (!paper) return <div className="p-6">试卷不存在</div>;

  return (
    <div className="p-6 flex flex-col gap-6">
      <Link to="/" className="text-blue-600 hover:underline">
        ← 返回试卷列表
      </Link>
      <h2 className="text-2xl font-semibold">{paper.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="课程导读" className="h-40">
          <Space direction="vertical">
            <Link
              to="/preclass-guide/[id]"
              params={{ id }}
              className="text-blue-600"
            >
              查看
            </Link>
          </Space>
        </Card>
        <Card title="英语句型抄写练习" className="h-40">
          <Space direction="vertical">
            <Link
              to="/sentence-copy/[id]"
              params={{ id }}
              className="text-blue-600"
            >
              查看
            </Link>
          </Space>
        </Card>
        <Card title="试卷" className="h-40">
          <Space direction="vertical">
            <Link to="/paper/[id]" params={{ id }} className="text-blue-600">
              查看
            </Link>
          </Space>
        </Card>
        <Card title="答案卡" className="h-40">
          <Space direction="vertical">
            <Link to="/answer/[id]" params={{ id }} className="text-blue-600">
              查看
            </Link>
          </Space>
        </Card>
      </div>
    </div>
  );
}
