import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';
import ReactMarkdown from 'react-markdown';
/* eslint-disable @typescript-eslint/no-explicit-any */

export const Route = createFileRoute('/preclass-guide/$id')({
  component: PreclassGuide,
});

function PreclassGuide() {
  const { id } = Route.useParams() as { id: string };
  const { papers } = usePaperStore();
  const paper = papers.find((p) => p.id === id);

  if (!paper) {
    return <div className="p-6">未找到试卷数据</div>;
  }

  if (!paper.preclass) {
    return <div className="p-6">暂无课程导读数据</div>;
  }

  const markdownComponents: any = {
    h1: (props: any) => (
      <h1
        className="text-2xl font-bold text-blue-800 text-center mb-4 first:mt-0"
        {...props}
      />
    ),
    h2: (props: any) => (
      <h2
        className="text-lg font-semibold text-blue-800 border-l-4 border-blue-600 bg-blue-50 pl-4 py-2 mt-8 mb-4"
        {...props}
      />
    ),
    h3: (props: any) => (
      <h3
        className="text-base font-semibold text-gray-900 mt-6 mb-2"
        {...props}
      />
    ),
    p: (props: any) => <p className="text-gray-700 leading-5" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 space-y-1" {...props} />,
    ol: (props: any) => (
      <ol className="list-decimal pl-6 space-y-1" {...props} />
    ),
    li: (props: any) => <li className="text-gray-700" {...props} />,
    strong: (props: any) => (
      <strong className="font-semibold text-gray-900" {...props} />
    ),
    em: (props: any) => <em className="italic" {...props} />,
  };

  return (
    <div className="w-[794px] mx-auto pt-8 pb-32 print:w-[210mm] print:min-h-[297mm]">
      <ReactMarkdown components={markdownComponents}>
        {paper.preclass}
      </ReactMarkdown>
    </div>
  );
}
