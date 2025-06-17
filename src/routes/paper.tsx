import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/paper')({
  component: Paper,
});

function Paper() {
  return (
    <div className="p-4 print:w-[210mm] print:min-h-[297mm] mx-auto">
      <h2 className="text-xl font-bold">试卷</h2>
      <p>此页面将用来渲染可打印的试卷内容。</p>
      {/* TODO: 题目排版及分页逻辑 */}
    </div>
  );
}
