import useIsPrinting from '@/hooks/useIsPrinting';
import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ConfigProvider, theme, FloatButton, App, Button, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useEffect, useRef } from 'react';
import { useGenerationTaskStore } from '@/stores';
import type { GenerationTask } from '@/stores';

function GenerationNotifier() {
  const { tasks, clearTask, retryTask } = useGenerationTaskStore();
  const prevTasksRef = useRef<GenerationTask[]>([]);
  const navigate = useNavigate();
  const { notification } = App.useApp();

  useEffect(() => {
    tasks.forEach((task) => {
      const prevTask = prevTasksRef.current.find(
        (pt) => pt.paperId === task.paperId,
      );

      // 检查状态变化：从 'processing' 变为 'success' 或 'error'
      if (prevTask?.status === 'processing' && task.status !== 'processing') {
        const key = `task-notification-${task.paperId}`;
        const btn = (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              notification.destroy(key);
              clearTask(task.paperId);
            }}
          >
            我知道了
          </Button>
        );

        if (task.status === 'success') {
          notification.success({
            key,
            message: '试卷生成成功',
            description: `试卷《${task.paperTitle}》的内容已成功生成。`,
            btn,
            onClick: () => {
              notification.destroy(key);
              clearTask(task.paperId);
              navigate({
                to: '/paper-detail/$id',
                params: { id: task.paperId },
              });
            },
          });
        } else if (task.status === 'error' && task.error) {
          const errorKey = `task-failed-${task.id}`;
          const errorBtn = (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  retryTask(task.id);
                  notification.destroy(errorKey);
                }}
              >
                重试
              </Button>
              <Button
                size="small"
                onClick={() => notification.destroy(errorKey)}
              >
                关闭
              </Button>
            </Space>
          );
          notification.error({
            key: errorKey,
            message: '试卷生成失败',
            description: (
              <>
                <div>{`试卷《${task.paperTitle}》生成失败:`}</div>
                <div
                  style={{
                    maxHeight: 100,
                    overflowY: 'auto',
                    marginTop: 8,
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 4,
                  }}
                >
                  {task.error}
                </div>
              </>
            ),
            duration: 0, // 永久显示直到用户关闭
            btn: errorBtn,
          });
        }
      }
    });

    // 更新 prevTasks 以便下次比较
    prevTasksRef.current = tasks;
  }, [tasks, clearTask, retryTask, navigate, notification]);

  return null;
}

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const isPrinting = useIsPrinting();
  const isDarkMode = useSystemTheme();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        cssVar: true,
        hashed: false,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <App>
        <GenerationNotifier />
        <Outlet />
      </App>
      {import.meta.env.DEV && !isPrinting && <TanStackRouterDevtools />}
      {!isPrinting && (
        <FloatButton
          icon={<QuestionCircleOutlined />}
          tooltip="问题反馈"
          href="https://github.com/English-Assistant/English-Print/issues/new/choose"
          target="_blank"
        />
      )}
    </ConfigProvider>
  );
}
