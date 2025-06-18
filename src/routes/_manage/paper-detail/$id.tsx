import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, Space, Button, Modal, message } from 'antd';
import { useState } from 'react';
import { usePaperStore } from '@/stores';
import SectionEditModal from './-SectionEditModal';

type SectionKey = 'preclass' | 'copyJson' | 'examJson' | 'answerJson';

export const Route = createFileRoute('/_manage/paper-detail/$id')({
  component: PaperDetailPage,
});

function PaperDetailPage() {
  const { id } = Route.useParams() as { id: string };
  const { papers, updatePaper } = usePaperStore();
  const paper = papers.find((p) => p.id === id);

  const [editingKey, setEditingKey] = useState<SectionKey | null>(null);

  if (!paper) return <div className="p-6">试卷不存在</div>;

  const sectionConfigs: Array<{ key: SectionKey; title: string }> = [
    { key: 'preclass', title: '课程导读' },
    { key: 'copyJson', title: '抄写练习' },
    { key: 'examJson', title: '试卷' },
    { key: 'answerJson', title: '答案卡' },
  ];

  const handleDelete = (key: SectionKey) => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该数据吗？',
      okType: 'danger',
      onOk: () => {
        updatePaper(id, { [key]: undefined });
        message.success('已删除');
      },
    });
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <Link to="/" className="text-blue-600 hover:underline">
        ← 返回试卷列表
      </Link>
      <h2 className="text-2xl font-semibold">{paper.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionConfigs.map((sec) => {
          const hasData = Boolean(paper[sec.key]);
          return (
            <Card key={sec.key} title={sec.title} className="h-40">
              <Space>
                {hasData && (
                  <Link
                    to={
                      sec.key === 'preclass'
                        ? '/preclass-guide/$id'
                        : sec.key === 'copyJson'
                          ? '/sentence-copy/$id'
                          : sec.key === 'examJson'
                            ? '/paper/$id'
                            : '/answer/$id'
                    }
                    params={{ id: paper.id }}
                  >
                    查看
                  </Link>
                )}
                <Button type="link" onClick={() => setEditingKey(sec.key)}>
                  {hasData ? '编辑' : '配置'}
                </Button>
                {hasData && (
                  <Button
                    danger
                    type="link"
                    onClick={() => handleDelete(sec.key)}
                  >
                    删除
                  </Button>
                )}
              </Space>
            </Card>
          );
        })}
      </div>

      <SectionEditModal
        open={Boolean(editingKey)}
        paperId={paper.id}
        sectionKey={editingKey}
        onClose={() => setEditingKey(null)}
      />
    </div>
  );
}
