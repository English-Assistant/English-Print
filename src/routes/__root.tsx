import useIsPrinting from '@/hooks/useIsPrinting';
import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import {
  ConfigProvider,
  theme,
  FloatButton,
  App,
  Button,
  notification,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import { useEffect, useRef } from 'react';
import { useGenerationTaskStore } from '@/stores';
import type { GenerationTask } from '@/stores';

function GenerationNotifier() {
  const tasks = useGenerationTaskStore((s) => s.tasks);
  const clearTask = useGenerationTaskStore((s) => s.clearTask);
  const prevTasksRef = useRef<GenerationTask[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    tasks.forEach((task) => {
      const prevTask = prevTasksRef.current.find(
        (pt) => pt.paperId === task.paperId,
      );

      // 检查状态变化：从 'generating' 变为 'success' 或 'error'
      if (prevTask?.status === 'generating' && task.status !== 'generating') {
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
        } else if (task.status === 'error') {
          notification.error({
            key,
            message: '试卷生成失败',
            description: `试卷《${task.paperTitle}》生成失败: ${task.error}`,
            duration: 0, // 永久显示直到用户关闭
            btn,
          });
        }
      }
    });

    // 更新 prevTasks 以便下次比较
    prevTasksRef.current = tasks;
  }, [tasks, clearTask, navigate]);

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
