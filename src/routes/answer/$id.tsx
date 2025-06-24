import { createFileRoute } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import PrintPageLayout from '@/components/PrintPageLayout';
import { useTitle } from 'ahooks';

export const Route = createFileRoute('/answer/$id')({
  component: Answer,
});

function Answer() {
  const { id } = Route.useParams() as { id: string };
  const paper = usePaperStore((state) => state.papers.find((p) => p.id === id));
  const course = useCourseStore((state) =>
    state.getCourseById(paper?.courseId ?? ''),
  );

  const title = `${paper?.title} 答案卡`;

  useTitle(title);

  if (!paper) return <div className="p-6">未找到试卷</div>;

  if (!paper.examJson || !paper.answerJson) {
    return <div className="p-6">试卷或答案数据不完整</div>;
  }
  const exam = paper.examJson;
  const answerSheet = paper.answerJson;
  return (
    <PrintPageLayout>
      <PrintPageLayout.CenteredHeader
        title={title}
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
