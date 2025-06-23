import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import type { ExamPaper } from '@/data/types/exam';
import type { ExamAnswerSheet } from '@/data/types/answer';

export const Route = createFileRoute('/answer/$id')({
  component: Answer,
});

function Answer() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = usePaperStore();
  const paper = papers.find((p) => p.id === id);
  if (!paper) return <div className="p-6">未找到试卷</div>;

  if (!paper.examJson || !paper.answerJson) {
    return <div className="p-6">暂无答案数据</div>;
  }

  let exam: ExamPaper;
  let answerSheet: ExamAnswerSheet;
  try {
    exam = paper.examJson;
    answerSheet = paper.answerJson;
  } catch (err) {
    console.error(err);
    return <div className="p-6 text-red-600">答案 JSON 解析失败</div>;
  }

  return (
    <div className="w-[794px] mx-auto pt-8 pb-20 print:w-[210mm] print:min-h-[297mm] flex flex-col gap-6">
      <h1 className="text-[24px] leading-8 font-bold text-blue-800 text-center">
        {paper.answerJson.title}
      </h1>
      <hr className="border-gray-300 w-[730px] mx-auto" />

      {/* 答案主体 */}
      <AnswerSheetViewer exam={exam} answer={answerSheet} />

      <div className="border-t border-gray-200 mt-4" />
      <p className="text-sm text-gray-500 text-center mt-2">
        * 本答案卡仅包含核心答案内容，省略原题及解释说明，以节省纸张
      </p>
    </div>
  );
}
