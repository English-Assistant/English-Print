import { createFileRoute } from '@tanstack/react-router';
import {
  Input,
  Button,
  Card,
  Tag,
  Space,
  Popconfirm,
  Tooltip,
  Dropdown,
  Row,
  Col,
  theme,
  Typography,
  Empty,
  Select,
  App,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CopyOutlined,
  DownOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { usePaperStore, useCourseStore } from '@/stores';
import { useSettingsStore } from '@/stores/settings';
import NewPaperModal from './-NewPaperModal';
import BatchNewPaperModal from './-BatchNewPaperModal';
import NewCourseModal from './-NewCourseModal';
import BatchNewPaperJsonModal from './-BatchNewPaperJsonModal';
import { useNavigate } from '@tanstack/react-router';
import type { MenuProps } from 'antd';

export const Route = createFileRoute('/_manage/')({
  component: PaperManagement,
});

function PaperManagement() {
  const { papers, deletePaper } = usePaperStore();
  const { courses } = useCourseStore();
  const { apiUrl, apiToken } = useSettingsStore();
  const [keyword, setKeyword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBatchNewModalOpen, setIsBatchNewModalOpen] = useState(false);
  const [isBatchJsonModalOpen, setIsBatchJsonModalOpen] = useState(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<
    string | undefined
  >();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    e.domEvent.stopPropagation();
    if (e.key === 'batch-json') {
      setIsBatchJsonModalOpen(true);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      label: '批量新增 (JSON)',
      key: 'batch-json',
      icon: <CopyOutlined />,
    },
  ];

  const filtered = papers
    .filter((p) => {
      const keywordMatch = p.title
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const courseMatch = !selectedCourseId || p.courseId === selectedCourseId;
      return keywordMatch && courseMatch;
    })
    .sort((a, b) => dayjs(b.updatedAt).unix() - dayjs(a.updatedAt).unix());

  return (
    <div>
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input.Search
              placeholder="搜索试卷标题..."
              onSearch={(value) => setKeyword(value)}
              style={{ width: 200 }}
              allowClear
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              allowClear
              style={{ width: 200 }}
              placeholder="按课程筛选"
              onChange={(value) => setSelectedCourseId(value)}
              options={courses.map((c) => ({
                label: c.title,
                value: c.id,
              }))}
            />
            <Button
              onClick={() => setIsNewCourseModalOpen(true)}
              icon={<PlusOutlined />}
            >
              添加课程
            </Button>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setEditingId('new')}
            >
              新建试卷
            </Button>
            <Tooltip
              title={
                !apiUrl || !apiToken ? '请先在"接口设置"中配置 API 信息' : ''
              }
            >
              <Dropdown.Button
                icon={<DownOutlined />}
                menu={{ items: menuItems, onClick: handleMenuClick }}
                onClick={() => setIsBatchNewModalOpen(true)}
                disabled={!apiUrl || !apiToken}
              >
                批量新增
              </Dropdown.Button>
            </Tooltip>
          </Space>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Empty
          description="暂无试卷，请点击右上角新建"
          style={{ padding: '64px 0' }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filtered.map((paper) => (
            <Col key={paper.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    style={{
                      width: '100%',
                      color: token.colorPrimary,
                      fontWeight: 500,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(paper.id);
                    }}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确认删除?"
                    description="删除后不可恢复，确定要删除吗？"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      deletePaper(paper.id);
                      message.success('删除成功');
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ width: '100%' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
                onClick={() =>
                  navigate({
                    to: '/paper-detail/$id',
                    params: { id: paper.id },
                  })
                }
              >
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Typography.Title
                    level={5}
                    ellipsis={{ rows: 2 }}
                    style={{ margin: 0 }}
                  >
                    <Space>
                      <FileTextOutlined />
                      {paper.title}
                    </Space>
                  </Typography.Title>

                  <Space direction="vertical" size="small">
                    {paper.courseId && (
                      <Tag color="blue">
                        {courses.find((c) => c.id === paper.courseId)?.title ||
                          '未知课程'}
                      </Tag>
                    )}
                    <Space
                      size={4}
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      <ClockCircleOutlined />
                      {dayjs(paper.updatedAt).format('YYYY-MM-DD HH:mm')}
                    </Space>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <NewPaperModal
        open={editingId !== null}
        editingId={editingId}
        onClose={() => setEditingId(null)}
      />
      <BatchNewPaperModal
        open={isBatchNewModalOpen}
        onClose={() => setIsBatchNewModalOpen(false)}
      />
      <NewCourseModal
        open={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
      />
      <BatchNewPaperJsonModal
        open={isBatchJsonModalOpen}
        onClose={() => setIsBatchJsonModalOpen(false)}
      />
    </div>
  );
}
