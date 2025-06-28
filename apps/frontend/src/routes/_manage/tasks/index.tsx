import { createFileRoute } from '@tanstack/react-router';
import {
  App,
  Button,
  Card,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
  Tooltip,
} from 'antd';
import {
  useCourseStore,
  useGenerationTaskStore,
  type GenerationTask,
} from '@/stores';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import VanillaJsonEditor from '@/components/VanillaJsonEditor';
import type { GeneratedPaperData } from '@/data/types/generation';
import type { ColumnsType } from 'antd/es/table';
import { ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

// 创建文件路由
export const Route = createFileRoute('/_manage/tasks/')({
  component: TasksPage,
});

/**
 * 将毫秒时长格式化为更易读的字符串（如 X 分 Y 秒）
 * @param milliseconds - 毫秒数
 */
function formatDuration(milliseconds: number): string {
  if (!milliseconds || milliseconds < 0) {
    return '0 秒';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} 时 ${minutes} 分`;
  }
  if (minutes > 0) {
    return `${minutes} 分 ${seconds} 秒`;
  }
  return `${seconds} 秒`;
}

/**
 * 一个实时显示已过时间的组件
 * @param startTime - 开始时间的时间戳
 */
function ElapsedTime({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // 将毫秒转换为 秒
  return <span>{formatDuration(elapsed)}</span>;
}

/**
 * 任务管理页面
 */
function TasksPage() {
  const { tasks, cancelTask, retryTask } = useGenerationTaskStore();
  const { courses } = useCourseStore();
  const { message } = App.useApp();
  const { token } = theme.useToken();

  // 课程筛选
  const [selectedCourseId, setSelectedCourseId] = useState<string | 'all'>(
    'all',
  );

  // 结果预览
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<
    GeneratedPaperData | undefined
  >(undefined);

  // 将课程列表转换为 Map, 方便快速查找
  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c.title])),
    [courses],
  );

  // 根据筛选条件和状态对任务进行分类
  const { processingTasks, successTasks, errorTasks } = useMemo(() => {
    const filteredTasks =
      selectedCourseId === 'all'
        ? tasks
        : tasks.filter((t) => t.courseId === selectedCourseId);

    return {
      processingTasks: filteredTasks.filter(
        (t) => t.status === 'processing' || t.status === 'pending',
      ),
      successTasks: filteredTasks.filter((t) => t.status === 'success'),
      errorTasks: filteredTasks.filter((t) => t.status === 'error'),
    };
  }, [tasks, selectedCourseId]);

  // --- 表格列定义 ---

  const baseColumns: ColumnsType<GenerationTask> = [
    {
      title: '任务 ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Typography.Text copyable={{ text: id }} style={{ maxWidth: 120 }}>
          <Tooltip title={id}>
            <span>...{id.slice(-6)}</span>
          </Tooltip>
        </Typography.Text>
      ),
    },
    {
      title: '试卷标题',
      dataIndex: 'paperTitle',
      key: 'paperTitle',
    },
    {
      title: '所属课程',
      dataIndex: 'courseId',
      key: 'courseId',
      render: (courseId) => courseMap.get(courseId) || '未分类',
    },

    {
      title: '操作时间',
      key: 'updatedTime',
      sorter: (a, b) => (b.endTime || b.startTime) - (a.endTime || a.startTime),
      render: (_, record) => {
        const time = record.endTime || record.startTime;
        return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];

  const processingColumns: ColumnsType<GenerationTask> = [
    ...baseColumns,
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (status: GenerationTask['status']) => {
        if (status === 'pending') {
          return (
            <Tag icon={<ClockCircleOutlined />} color="default">
              排队中
            </Tag>
          );
        }
        return (
          <Tag icon={<SyncOutlined spin />} color="processing">
            处理中
          </Tag>
        );
      },
    },
    {
      title: '已耗时',
      dataIndex: 'startTime',
      key: 'elapsed',
      render: (time) => <ElapsedTime startTime={time} />,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确认取消？"
          description="此操作不可撤销"
          onConfirm={() => {
            cancelTask(record.id);
            message.info('任务已取消');
          }}
          okText="确认"
          cancelText="再想想"
        >
          <Button danger size="small">
            取消
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const successColumns: ColumnsType<GenerationTask> = [
    ...baseColumns,
    {
      title: '总耗时',
      key: 'duration',
      render: (_, record) => {
        if (!record.endTime) return '-';
        const duration = record.endTime - record.startTime;
        return formatDuration(duration);
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedResult(record.result);
            setIsResultModalOpen(true);
          }}
        >
          查看结果
        </Button>
      ),
    },
  ];

  const errorColumns: ColumnsType<GenerationTask> = [
    ...baseColumns,
    {
      title: '失败原因',
      dataIndex: 'error',
      key: 'error',
      render: (error) => (
        <div style={{ maxWidth: 400, maxHeight: 80, overflow: 'auto' }}>
          <Tag color="error" style={{ whiteSpace: 'pre-wrap' }}>
            {error || '未知错误'}
          </Tag>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确认重试？"
          description="将使用相同的配置重新发起一次生成任务"
          onConfirm={async () => {
            await retryTask(record.id);
            message.success('已重新发起任务');
          }}
          okText="确认"
          cancelText="再想想"
        >
          <Button type="primary" size="small">
            重试
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'processing',
      label: `正在进行 (${processingTasks.length})`,
      children: (
        <Table
          rowKey="id"
          columns={processingColumns}
          dataSource={processingTasks}
          pagination={false}
        />
      ),
    },
    {
      key: 'success',
      label: `已完成 (${successTasks.length})`,
      children: (
        <Table
          rowKey="id"
          columns={successColumns}
          dataSource={successTasks}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'error',
      label: `失败 (${errorTasks.length})`,
      children: (
        <Table
          rowKey="id"
          columns={errorColumns}
          dataSource={errorTasks}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            任务管理中心
          </Typography.Title>
          <Space>
            <span>筛选课程:</span>
            <Select
              style={{ width: 200 }}
              value={selectedCourseId}
              onChange={setSelectedCourseId}
              options={[
                { value: 'all', label: '所有课程' },
                ...courses.map((c) => ({ value: c.id, label: c.title })),
              ]}
            />
          </Space>
        </div>
      </Card>

      <Tabs defaultActiveKey="processing" items={tabItems} />

      <Modal
        title="查看生成结果"
        open={isResultModalOpen}
        onCancel={() => setIsResultModalOpen(false)}
        footer={null}
        width="70vw"
      >
        <div style={{ height: '60vh', marginTop: '1rem' }}>
          <VanillaJsonEditor
            value={(selectedResult || {}) as Record<string, unknown>}
            readOnly={true}
          />
        </div>
      </Modal>
    </div>
  );
}
