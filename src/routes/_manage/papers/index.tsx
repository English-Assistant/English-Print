import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Input,
  Button,
  Card,
  Tag,
  Space,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  theme,
  Typography,
  Empty,
  Select,
  App,
  Popover,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CopyOutlined,
  DeleteOutlined,
  SyncOutlined,
  PrinterOutlined,
  StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { useLocalStorageState } from 'ahooks';
import {
  usePaperStore,
  useCourseStore,
  useGenerationTaskStore,
} from '@/stores';
import { useSettingsStore } from '@/stores/settings';
import NewPaperModal from './-NewPaperModal';
import BatchNewPaperModal from './-BatchNewPaperModal';
import BatchNewPaperJsonModal from './-BatchNewPaperJsonModal';
import { useNavigate } from '@tanstack/react-router';
import type { Paper } from '@/data/types/paper';
import type { GenerationTask } from '@/stores';

export const Route = createFileRoute('/_manage/papers/')({
  component: PaperManagement,
});

function PaperManagement() {
  const { papers, deletePaper } = usePaperStore();
  const { courses } = useCourseStore();
  const { apiUrl, apiToken } = useSettingsStore();
  const { startGeneration, cancelTask } = useGenerationTaskStore();

  const tasks = useGenerationTaskStore((s) => s.tasks);

  const getLatestTaskByPaperId = useCallback(
    (paperId: string): GenerationTask | undefined => {
      const tasksForPaper = tasks.filter((t) => t.paperId === paperId);
      if (tasksForPaper.length === 0) return undefined;
      return tasksForPaper.sort((a, b) => b.startTime - a.startTime)[0];
    },
    [tasks],
  );

  const [keyword, setKeyword] = useLocalStorageState('paper-filter-keyword', {
    defaultValue: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBatchNewModalOpen, setIsBatchNewModalOpen] = useState(false);
  const [isBatchJsonModalOpen, setIsBatchJsonModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useLocalStorageState<
    string | undefined
  >('paper-filter-course', {
    defaultValue: undefined,
  });

  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const handleGenerateClick = (paper: Paper) => {
    if (!paper.title || !paper.coreWords || !paper.keySentences) {
      message.error('请先在"编辑"中填写好试卷的标题、核心单词和重点句型！');
      return;
    }
    if (!apiUrl || !apiToken) {
      message.error('请先在"接口设置"中配置 API 信息');
      return;
    }
    startGeneration(paper);
    message.info(`《${paper.title}》已加入后台生成队列`);
  };

  const filtered = papers
    .filter((p) => {
      const keywordMatch = p.title
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const courseMatch = !selectedCourseId || p.courseId === selectedCourseId;
      return keywordMatch && courseMatch;
    })
    .sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix());

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
              value={keyword}
              onSearch={(value) => setKeyword(value)}
              style={{ width: 200 }}
              allowClear
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              allowClear
              style={{ width: 200 }}
              placeholder="按课程筛选"
              value={selectedCourseId}
              onChange={(value) => setSelectedCourseId(value)}
              options={courses.map((c) => ({
                label: c.title,
                value: c.id,
              }))}
            />
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => setIsBatchNewModalOpen(true)}
            >
              批量新增
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={() => setIsBatchJsonModalOpen(true)}
            >
              批量新增 (JSON)
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => setEditingId('new')}>
              新建试卷
            </Button>
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
          {filtered.map((paper) => {
            const task = getLatestTaskByPaperId(paper.id);
            const isGenerating = task?.status === 'processing';
            const isPending = task?.status === 'pending';
            const isGenerated =
              paper.examJson ||
              paper.answerJson ||
              paper.copyJson ||
              paper.listeningJson ||
              paper.preclass;

            return (
              <Col key={paper.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Tooltip
                      title={
                        !isGenerated
                          ? '试卷内容未生成，无法打印'
                          : '合并打印试卷、答案、导读等'
                      }
                    >
                      <Link
                        to="/print/$id"
                        params={{ id: paper.id }}
                        target="_blank"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isGenerated) {
                            e.preventDefault();
                          }
                        }}
                        style={{ display: 'block', width: '100%' }}
                      >
                        <Button
                          key="print"
                          type="text"
                          icon={<PrinterOutlined />}
                          disabled={!isGenerated}
                          style={{
                            width: '100%',
                          }}
                        >
                          打印
                        </Button>
                      </Link>
                    </Tooltip>,
                    isGenerating || isPending ? (
                      <Popconfirm
                        key="cancel"
                        title="确认取消?"
                        description="取消后任务将标记为失败，可从任务管理中心重试。"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          if (task) {
                            cancelTask(task.id);
                            message.success('任务已取消');
                          }
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<StopOutlined />}
                          style={{ width: '100%' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          取消生成
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Tooltip title="基于标题、单词、句型生成试卷内容">
                        <Button
                          key="generate"
                          type="text"
                          icon={<SyncOutlined />}
                          style={{
                            width: '100%',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateClick(paper);
                          }}
                          disabled={!apiUrl || !apiToken}
                        >
                          {task?.status === 'error'
                            ? '重试生成'
                            : isGenerated
                              ? '重新生成'
                              : '生成'}
                        </Button>
                      </Tooltip>
                    ),
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
                      <Space>
                        {paper.courseId && (
                          <Tag color="blue">
                            {courses.find((c) => c.id === paper.courseId)
                              ?.title || '未知课程'}
                          </Tag>
                        )}
                        {isGenerating && (
                          <Tag icon={<SyncOutlined spin />} color="processing">
                            生成中
                          </Tag>
                        )}
                        {task?.status === 'pending' && (
                          <Tag icon={<ClockCircleOutlined />} color="default">
                            排队中
                          </Tag>
                        )}
                        {(task?.status === 'success' ||
                          (!task && isGenerated)) &&
                          !isGenerating &&
                          !isPending && <Tag color="green">已生成</Tag>}
                        {task?.status === 'error' && (
                          <Popover
                            title="失败原因"
                            trigger="hover"
                            content={
                              <div
                                style={{
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                  maxWidth: 400,
                                }}
                              >
                                {task.error}
                              </div>
                            }
                          >
                            <Tag color="red">生成失败</Tag>
                          </Popover>
                        )}
                      </Space>
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
            );
          })}
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
      <BatchNewPaperJsonModal
        open={isBatchJsonModalOpen}
        onClose={() => setIsBatchJsonModalOpen(false)}
      />
    </div>
  );
}
