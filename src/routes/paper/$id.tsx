import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';

export const Route = createFileRoute('/paper/$id')({
  component: ExamPaper,
});

function ExamPaper() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = usePaperStore();
  const paperRecord = papers.find((p) => p.id === id);
  if (!paperRecord) return <div className="p-6">未找到试卷</div>;

  // 这里可以根据 paperRecord.paperJson 渲染实际内容；暂保留静态模板

  return (
    <div className="w-[794px] mx-auto flex flex-col gap-6 pt-8 pb-32 print:w-[210mm] print:min-h-[297mm]">
      <h1 className="text-2xl font-bold text-blue-900 text-center">
        English Examination
      </h1>
      {/* 其余静态内容同旧模板，可按需移植或动态渲染 */}
      <footer className="mt-8 border-t border-gray-200 text-center text-gray-500 pt-4">
        Page 1 of 1
      </footer>
    </div>
  );
}
