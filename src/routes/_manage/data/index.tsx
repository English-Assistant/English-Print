import { createFileRoute } from '@tanstack/react-router';
import { Button, Card, Space, Typography, Upload, App, Modal } from 'antd';
import {
  ExportOutlined,
  ImportOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  useCourseStore,
  useGenerationTaskStore,
  usePaperStore,
  useSettingsStore,
  useVocabularyStore,
} from '@/stores';
import type { CourseStore } from '@/stores/courses';
import type { PaperStore } from '@/stores/papers';
import type { GenerationTaskStore } from '@/stores/generationTasks';
import type { SettingsState } from '@/stores/settings';
import type { VocabularyStore } from '@/stores/vocabulary';
import { LAST_COURSE_ID_KEY } from '@/utils/constants';

// 定义 store 名称和对应的 hook
const STORES = {
  'course-storage': useCourseStore,
  'paper-storage': usePaperStore,
  'generation-tasks-storage': useGenerationTaskStore,
  'dify-api-settings': useSettingsStore,
  'vocabulary-storage': useVocabularyStore,
};

export const Route = createFileRoute('/_manage/data/')({
  component: DataManagement,
});

function DataManagement() {
  const { message } = App.useApp();

  const handleExport = async () => {
    try {
      // 从每个 store 的 state 中收集数据
      const dataToExport = Object.entries(STORES).reduce(
        (acc, [key, storeHook]) => {
          acc[key] = storeHook.getState();
          return acc;
        },
        {} as Record<string, unknown>,
      );

      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english-print-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('数据导出成功');
    } catch (error) {
      console.error('Failed to export data', error);
      message.error('数据导出失败');
    }
  };

  const handleImport = (file: File) => {
    if (!file.name.endsWith('.json')) {
      message.error('请选择一个 JSON 文件');
      return false; // Prevent upload
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        if (!json) {
          message.error('文件内容为空');
          return;
        }
        const importedData = JSON.parse(json) as Record<string, unknown>;

        // 遍历导入的数据，并更新对应的 store
        for (const key in importedData) {
          if (Object.prototype.hasOwnProperty.call(importedData, key)) {
            const stateToImport = importedData[key];
            switch (key) {
              case 'course-storage':
                useCourseStore.setState(stateToImport as CourseStore);
                break;
              case 'paper-storage':
                usePaperStore.setState(stateToImport as PaperStore);
                break;
              case 'generation-tasks-storage':
                useGenerationTaskStore.setState(
                  stateToImport as GenerationTaskStore,
                );
                break;
              case 'dify-api-settings':
                useSettingsStore.setState(stateToImport as SettingsState);
                break;
              case 'vocabulary-storage':
                useVocabularyStore.setState(stateToImport as VocabularyStore);
                break;
              default:
                break;
            }
          }
        }

        message.success('数据导入成功，请刷新页面以应用更改。');

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Failed to import data', error);
        message.error('数据导入失败，请确保文件格式正确。');
      }
    };
    reader.readAsText(file);
    return false; // Prevent antd's default upload action
  };

  const handleClearData = () => {
    Modal.confirm({
      title: '确认清空所有数据？',
      content:
        '此操作将删除所有本地存储的数据，包括试卷、课程和设置。此操作不可逆，请谨慎操作。',
      okText: '确认清空',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // 依次清空每个 store 的持久化数据
          useCourseStore.persist.clearStorage();
          usePaperStore.persist.clearStorage();
          useSettingsStore.persist.clearStorage();
          useVocabularyStore.persist.clearStorage();
          useGenerationTaskStore.persist.clearStorage();

          // [新增] 清除课程ID记忆
          localStorage.removeItem(LAST_COURSE_ID_KEY);

          message.success('所有数据已清空，应用将在2秒后自动刷新。');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error('Failed to clear data', error);
          message.error('数据清空失败。');
        }
      },
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Typography.Title level={2}>数据管理</Typography.Title>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Title level={4}>数据导出</Typography.Title>
          <Typography.Paragraph>
            将应用内的所有数据（包括试卷、课程、设置等）导出为一个 JSON
            文件。请妥善保管导出的文件。
          </Typography.Paragraph>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出数据
          </Button>
        </Space>
      </Card>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Title level={4}>数据导入</Typography.Title>
          <Typography.Paragraph>
            从之前导出的 JSON 文件中恢复数据。请注意，导入操作会通过深合并（deep
            merge）的方式，将导入文件中的数据合并到现有数据中。如果存在相同的键，导入文件中的值将覆盖现有值。
          </Typography.Paragraph>
          <Upload
            beforeUpload={handleImport}
            showUploadList={false}
            accept=".json"
          >
            <Button icon={<ImportOutlined />}>选择文件并导入</Button>
          </Upload>
        </Space>
      </Card>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Title level={4}>清空本地数据</Typography.Title>
          <Typography.Paragraph>
            此操作将删除所有本地存储的数据，包括试卷、课程和设置等。此操作不可逆，请在执行前务必导出数据进行备份。
          </Typography.Paragraph>
          <Button icon={<DeleteOutlined />} danger onClick={handleClearData}>
            清空所有数据
          </Button>
        </Space>
      </Card>
    </Space>
  );
}
