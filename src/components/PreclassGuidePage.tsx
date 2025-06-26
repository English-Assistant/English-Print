import PrintPageLayout from '@/components/PrintPageLayout';
import type { Course, Paper } from '@/stores';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreclassGuidePageProps {
  paper: Paper;
  title: string;
  course?: Course;
}

export function PreclassGuidePage({
  paper,
  title,
  course,
}: PreclassGuidePageProps) {
  return (
    <PrintPageLayout>
      <PrintPageLayout.CenteredHeader
        title={title}
        courseTitle={course?.title}
        showStudentName={false}
      />
      <div className="markdown-body p-8">
        <Markdown remarkPlugins={[remarkGfm]}>{paper.preclass!}</Markdown>
      </div>
    </PrintPageLayout>
  );
}
