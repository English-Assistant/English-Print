import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/paper-management')({
  component: PaperManagement,
});

function PaperManagement() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">试卷管理</h2>
      <p>这里将提供试卷的增删改查等交互功能。</p>
      <div className="flex gap-3 flex-wrap">
        <Link to="/workbook" className="btn">
          练习册
        </Link>
        <Link to="/paper" className="btn">
          试卷
        </Link>
        <Link to="/answer" className="btn">
          答案
        </Link>
        <Link to="/preclass-guide" className="btn">
          课前导读
        </Link>
      </div>
    </div>
  );
}
