import { createFileRoute, useParams } from '@tanstack/react-router';
import { useCourseStore, usePaperStore } from '@/stores';
import { Divider, Empty, Layout } from 'antd';
import { ExamPaperPage } from '@/components/ExamPaperPage';
import { AnswerPage } from '@/components/AnswerPage';
import { CopyExercisePage } from '@/components/CopyExercisePage';
import { PreclassGuidePage } from '@/components/PreclassGuidePage';
import { ListeningPage } from '@/components/ListeningPage';
import { useTitle } from 'ahooks';

// 创建一个新的文件路由
export const Route = createFileRoute('/print/$id')({
  component: ContentAggregationPage,
});

/**
 * 内容聚合页：将所有内容组件及其可见性逻辑整合到一个数组中，最后用 `Divider` 分隔并渲染所有可见的内容部分
 */
function ContentAggregationPage() {
  const { id } = useParams({ from: '/print/$id' });
  // 采用响应式的方式直接从 store 中获取数据
  const paper = usePaperStore((state) => state.getPaperById(id));
  const course = useCourseStore((state) =>
    state.getCourseById(paper?.courseId ?? ''),
  );
  useTitle(paper ? `${paper.title} - 打印预览` : '打印预览');

  if (!paper) {
    return (
      <Layout
        style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}
      >
        <Empty description="找不到对应的试卷信息" />
      </Layout>
    );
  }

  // 数据加载后，定义所有需要展示的内容版块
  const sections: {
    title: string;
    content: React.ReactNode;
    visible: boolean;
  }[] = [
    {
      title: '课前导读',
      content: (
        <PreclassGuidePage
          paper={paper}
          course={course}
          title={`${paper.title} 课程导读`}
        />
      ),
      visible: !!paper.preclass,
    },
    {
      title: '抄写练习',
      content: (
        <CopyExercisePage
          paper={paper}
          course={course}
          title={`${paper.title} 抄写练习`}
        />
      ),
      visible: !!paper.copyJson,
    },
    {
      title: '听力素材',
      content: (
        <ListeningPage
          paper={paper}
          course={course}
          title={`${paper.title} 听力素材`}
        />
      ),
      visible: !!paper.listeningJson,
    },
    {
      title: '试卷',
      content: (
        <ExamPaperPage
          paper={paper}
          course={course}
          title={`${paper.title} 试卷`}
        />
      ),
      visible: !!paper.examJson,
    },
    {
      title: '答案',
      content: (
        <AnswerPage
          paper={paper}
          course={course}
          title={`${paper.title} 答案卡`}
        />
      ),
      visible: !!paper.answerJson,
    },
  ];

  const visibleSections = sections.filter((s) => s.visible);

  // 如果没有任何可展示的内容，显示空状态
  if (visibleSections.length === 0) {
    return (
      <Layout
        style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}
      >
        <Empty description="该试卷没有任何可展示的内容" />
      </Layout>
    );
  }

  // 渲染所有可见的版块
  return (
    <div className="content-aggregation-container bg-gray-100 p-8 print:bg-white print:p-0">
      {visibleSections.map((section, index) => (
        <div
          key={section.title}
          className={index > 0 ? 'print:break-before-page' : ''}
        >
          {index > 0 && (
            <div className="print:hidden">
              <Divider>
                <span className="text-gray-500 font-light">{`--- ${section.title} ---`}</span>
              </Divider>
            </div>
          )}
          {section.content}
        </div>
      ))}
    </div>
  );
}
