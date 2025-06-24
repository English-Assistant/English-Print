import { createFileRoute } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import type { ExamPaper } from '@/data/types/exam';
import type { ExamAnswerSheet } from '@/data/types/answer';
import PrintPageLayout from '@/components/PrintPageLayout';

export const Route = createFileRoute('/answer/$id')({
  component: Answer,
});

function Answer() {
  const { id } = Route.useParams() as { id: string };
  const paper = usePaperStore((state) => state.papers.find((p) => p.id === id));
  const course = useCourseStore((state) =>
    state.getCourseById(paper?.courseId ?? ''),
  );

  if (!paper) return <div className="p-6">未找到试卷</div>;

  if (!paper.examJson || !paper.answerJson) {
    return <div className="p-6 text-red-600">答案 JSON 解析失败</div>;
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
    <PrintPageLayout>
      <PrintPageLayout.CenteredHeader
        title={paper.answerJson.title}
        courseTitle={course?.title}
        showStudentName={false}
      />

      {/* 答案主体 */}
      <AnswerSheetViewer exam={exam} answer={answerSheet} />

      <p className="text-sm text-gray-500 text-center mt-2 px-8">
        * 本答案卡仅包含核心答案内容，省略原题及解释说明，以节省纸张
      </p>
    </PrintPageLayout>
  );
}
