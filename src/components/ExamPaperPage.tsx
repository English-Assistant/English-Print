import ExamPaperViewer from '@/components/ExamPaperViewer';
import PrintPageLayout from '@/components/PrintPageLayout';
import type { Paper } from '@/data/types/paper';
import type { Course } from '@/data/types/course';

interface ExamPaperPageProps {
  paper: Paper;
  course: Course | undefined;
  title: string;
}

export function ExamPaperPage({ paper, course, title }: ExamPaperPageProps) {
  const examPaper = paper.examJson!;

  return (
    <PrintPageLayout className="pt-8 pb-32">
      <PrintPageLayout.CenteredHeader
        title={title}
        courseTitle={course?.title}
      />

      {/* 试卷正文 */}
      <div className="text-black">
        <ExamPaperViewer paper={examPaper} />
      </div>
    </PrintPageLayout>
  );
}
