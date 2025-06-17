import { createFileRoute } from '@tanstack/react-router';
import 'virtual:uno.css';

export const Route = createFileRoute('/answer')({
  component: Answer,
});

function Answer() {
  return (
    <div className="p-4 print:w-[210mm] print:min-h-[297mm] mx-auto">
      <h2 className="text-xl font-bold">答案</h2>
      <p>此页面将展示试卷对应的答案，格式化后可直接打印。</p>
      {/* TODO: 答案内容排版 */}
    </div>
  );
}
