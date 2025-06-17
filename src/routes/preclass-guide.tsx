import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/preclass-guide')({
  component: PreclassGuide,
});

function PreclassGuide() {
  return (
    <div className="p-4 print:w-[210mm] print:min-h-[297mm] mx-auto">
      <h2 className="text-xl font-bold">课前导读</h2>
      <p>此页面将用于课前导读资料的设计与打印。</p>
      {/* TODO: 导读内容排版 */}
    </div>
  );
}
