// src/routes/paper/$id.tsx (已优化)
import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';
import ExamPaperViewer from '@/components/ExamPaperViewer';
import type { ExamPaper } from '@/data/types/exam';

/* =================================================================
 *  页面布局优化:
 *
 *  1. 【增加背景色】: 在最外层容器添加 `bg-gray-100`，为页面提供一个非白色的底色。
 *  2. 【突出纸张感】: 在试卷容器上添加 `bg-white` 和 `shadow-lg`，
 *     使其看起来像一张悬浮在灰色背景上的真实纸张，视觉效果更佳。
 * ================================================================= */

export const Route = createFileRoute('/preclass-guide/$id')({
  component: ExamPaperPage,
});

function ExamPaperPage() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = usePaperStore();
  const paperRecord = papers.find((p) => p.id === id);

  if (!paperRecord) {
    return <div className="p-6">未找到试卷数据</div>;
  }
  if (!paperRecord.examJson) {
    return <div className="p-6">暂无试卷 JSON 数据</div>;
  }

  let examPaper: ExamPaper;
  try {
    examPaper = paperRecord.examJson;
  } catch (err) {
    console.error(err);
    return <div className="p-6 text-red-600">试卷 JSON 解析失败</div>;
  }

  return (
    // 1. 添加背景色
    <div className="bg-gray-100 print:bg-white">
      {/* 2. 增加白色背景和阴影，突出纸张感 */}
      <div className="w-[794px] mx-auto pt-8 pb-32 print:w-[210mm] print:min-h-[297mm] flex flex-col gap-2 bg-white shadow-lg print:shadow-none">
        {/* 试卷标题及学生信息 */}
        <h1 className="text-[26px] leading-9 font-bold text-black text-center tracking-wider">
          {examPaper.title || 'English Examination'}
        </h1>
        <div className="flex items-center gap-8 text-gray-800 font-medium px-12 mt-4 mb-2">
          <div className="flex gap-2 items-baseline" style={{ minWidth: 260 }}>
            <span>Student Name:</span>
            <span className="flex-1 border-b border-gray-500 inline-block" />
          </div>
          <div className="flex gap-2 items-baseline">
            <span>Date:</span>
            <span className="border-b border-gray-500 inline-block min-w-[128px]" />
          </div>
        </div>
        <hr className="border-gray-300 w-[730px] mx-auto" />

        {/* 试卷正文 */}
        <ExamPaperViewer paper={examPaper} />

        {/* 页脚 */}
        <footer className="mt-6 border-t border-gray-200 text-center text-gray-500 pt-4">
          Page 1 of 1
        </footer>
      </div>
    </div>
  );
}
