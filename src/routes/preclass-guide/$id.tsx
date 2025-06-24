// src/routes/paper/$id.tsx (已优化)
import { createFileRoute } from '@tanstack/react-router';
import { usePaperStore } from '@/stores';
import { useCourseStore } from '@/stores';
import { Alert } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown-light.css';
import PrintPageLayout from '@/components/PrintPageLayout';
import { useTitle } from 'ahooks';

/* =================================================================
 *  页面布局优化:
 *
 *  1. 【增加背景色】: 在最外层容器添加 `bg-gray-100`，为页面提供一个非白色的底色。
 *  2. 【突出纸张感】: 在试卷容器上添加 `bg-white` 和 `shadow-lg`，
 *     使其看起来像一张悬浮在灰色背景上的真实纸张，视觉效果更佳。
 * ================================================================= */

export const Route = createFileRoute('/preclass-guide/$id')({
  component: PreclassGuidePage,
});

function PreclassGuidePage() {
  const { id } = Route.useParams();
  const paperRecord = usePaperStore((state) => state.getPaperById(id));
  const course = useCourseStore((state) =>
    state.getCourseById(paperRecord?.courseId ?? ''),
  );

  const title = `${paperRecord?.title} 课程导读`;
  useTitle(title);

  const markdownContent = paperRecord?.preclass;

  return (
    <>
      <style>
        {`
          .markdown-body hr {
            display: none;
          }
          .markdown-body ul {
          list-style: auto;
          }
          `}
      </style>

      <PrintPageLayout>
        <PrintPageLayout.LeftAlignedHeader
          title={title}
          courseTitle={course?.title}
        />
        {/* Content */}
        <main className="py-6 px-8 markdown-body">
          {markdownContent ? (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownContent}
              </ReactMarkdown>
            </div>
          ) : (
            <Alert
              message="暂无导读内容"
              description="该课程尚未提供预习导读，请检查相关配置或联系管理员。"
              type="info"
              showIcon
            />
          )}
        </main>
      </PrintPageLayout>
    </>
  );
}
