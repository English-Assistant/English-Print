import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Button,
  Card,
  Space,
  Typography,
  theme,
  Row,
  Col,
  Tag,
  Popconfirm,
  App,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SettingOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { usePaperStore, useCourseStore } from '@/stores';
import { useState } from 'react';
import SectionEditModal from './-SectionEditModal';

export const Route = createFileRoute('/_manage/paper-detail/$id')({
  component: PaperDetailPage,
});

type SectionKey =
  | 'preclass'
  | 'listeningJson'
  | 'copyJson'
  | 'examJson'
  | 'answerJson';

function PaperDetailPage() {
  const { token } = theme.useToken();
  const { papers, updatePaper } = usePaperStore();
  const { courses } = useCourseStore();
  const params = Route.useParams();
  const paper = papers.find((p) => p.id === params.id);
  const [editingKey, setEditingKey] = useState<SectionKey | null>(null);
  const navigate = useNavigate();
  const { message } = App.useApp();
  if (!paper) {
    return (
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate({ to: '/' })}
          >
            返回列表
          </Button>
          <Typography.Text type="danger">试卷不存在</Typography.Text>
        </Space>
      </Card>
    );
  }

  const handleDelete = (key: SectionKey) => {
    updatePaper(paper.id, { [key]: undefined });
    message.success('已删除');
  };

  const sectionConfigs: Array<{
    key: SectionKey;
    title: string;
    viewPath: string;
    description: string;
  }> = [
    {
      key: 'preclass',
      title: '课程导读',
      viewPath: '/preclass-guide/$id',
      description: '课前预习指导，包含学习目标和重点内容',
    },

    {
      key: 'copyJson',
      title: '抄写练习',
      viewPath: '/sentence-copy/$id',
      description: '句子抄写练习，帮助学生掌握句型结构',
    },
    {
      key: 'listeningJson',
      title: '听力素材',
      viewPath: '/listening/$id',
      description: '试卷配套的听力原文或补充材料',
    },
    {
      key: 'examJson',
      title: '试卷',
      viewPath: '/paper/$id',
      description: '正式考试内容，包含听力、阅读等多个部分',
    },
    {
      key: 'answerJson',
      title: '答案卡',
      viewPath: '/answer/$id',
      description: '学生答题卡，用于记录答案',
    },
  ];

  return (
    <>
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
          marginBottom: token.marginMD,
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate({ to: '/papers' })}
            >
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={() => window.open(`/print/${paper.id}`, '_blank')}
            >
              合并打印
            </Button>
          </Space>
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {paper.title}
            </Typography.Title>
            <Tag color="blue">
              {courses.find((c) => c.id === paper.courseId)?.title}
            </Tag>
          </Space>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {sectionConfigs.map((section) => {
          const hasData = Boolean(paper[section.key]);
          return (
            <Col key={section.key} xs={24} sm={12}>
              <Card
                title={
                  <Space>
                    <Typography.Text strong>{section.title}</Typography.Text>
                    {hasData && <Tag color="success">已配置</Tag>}
                  </Space>
                }
                style={{
                  height: '100%',
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowTertiary,
                }}
                styles={{
                  body: {
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  },
                }}
                actions={[
                  hasData ? (
                    [
                      <Button
                        key="view"
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          navigate({
                            to: section.viewPath,
                            params: { id: paper.id },
                          });
                        }}
                      >
                        预览
                      </Button>,
                      <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setEditingKey(section.key)}
                      >
                        编辑
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="确认删除?"
                        description="删除后不可恢复，确定要删除吗？"
                        onConfirm={() => handleDelete(section.key)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]
                  ) : (
                    <Button
                      key="configure"
                      type="text"
                      icon={<SettingOutlined />}
                      onClick={() => setEditingKey(section.key)}
                      style={{ width: '100%' }}
                    >
                      配置
                    </Button>
                  ),
                ].flat()}
              >
                <Typography.Paragraph
                  type="secondary"
                  style={{
                    margin: 0,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                    overflow: 'hidden',
                  }}
                >
                  {section.description}
                </Typography.Paragraph>
              </Card>
            </Col>
          );
        })}
      </Row>

      <SectionEditModal
        open={Boolean(editingKey)}
        paperId={paper.id}
        sectionKey={editingKey}
        onClose={() => setEditingKey(null)}
      />
    </>
  );
}
