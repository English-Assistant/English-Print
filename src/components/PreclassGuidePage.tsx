import PrintPageLayout from '@/components/PrintPageLayout';
import type { Paper } from '@/data/types/paper';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreclassGuidePageProps {
  paper: Paper;
  title: string;
}

export function PreclassGuidePage({ paper, title }: PreclassGuidePageProps) {
  return (
    <PrintPageLayout>
      <PrintPageLayout.CenteredHeader title={title} showStudentName={false} />
      <div className="markdown-body p-8">
        <Markdown remarkPlugins={[remarkGfm]}>{paper.preclass!}</Markdown>
      </div>
    </PrintPageLayout>
  );
}
