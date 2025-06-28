import AnswerSheetViewer from '@/components/AnswerSheetViewer';
import PrintPageLayout from '@/components/PrintPageLayout';
import type { Paper } from '@/data/types/paper';
import type { Course } from '@/data/types/course';

interface AnswerPageProps {
  paper: Paper;
  course: Course | undefined;
  title: string;
}

export function AnswerPage({ paper, course, title }: AnswerPageProps) {
  const exam = paper.examJson!;
  const answerSheet = paper.answerJson!;
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
