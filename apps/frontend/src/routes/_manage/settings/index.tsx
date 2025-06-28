import { createFileRoute } from '@tanstack/react-router';
import { Form, Input, Button, Card, App, Typography, InputNumber } from 'antd';
import { useSettingsStore } from '@/stores/settings';
import { useEffect } from 'react';

export const Route = createFileRoute('/_manage/settings/')({
  component: SettingsPage,
});

function SettingsPage() {
  const { apiUrl, apiToken, maxConcurrentTasks, setSettings } =
    useSettingsStore();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    form.setFieldsValue({ apiUrl, apiToken, maxConcurrentTasks });
  }, [apiUrl, apiToken, maxConcurrentTasks, form]);

  const handleSave = (values: {
    apiUrl: string;
    apiToken: string;
    maxConcurrentTasks: number | null;
  }) => {
    setSettings(values.apiUrl, values.apiToken, values.maxConcurrentTasks);
    message.success('设置已保存！');
  };

  return (
    <Card>
      <Typography.Title level={4}>Dify API 设置</Typography.Title>
      <Typography.Paragraph type="secondary">
        请在这里配置用于批量生成试卷的 Dify Workflow API 信息。
      </Typography.Paragraph>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        style={{ maxWidth: 600 }}
        initialValues={{ apiUrl, apiToken, maxConcurrentTasks }}
      >
        <Form.Item
          name="apiUrl"
          label="API URL"
          rules={[
            { required: true, message: '请输入 API URL' },
            { type: 'url', message: '请输入有效的 URL' },
          ]}
          tooltip="Dify Workflow 的 API http://dify.xiaowo.live/v1"
        >
          <Input placeholder="http://dify.xiaowo.live/v1" />
        </Form.Item>
        <Form.Item
          name="apiToken"
          label="API 密钥 (Token)"
          rules={[{ required: true, message: '请输入 API 密钥' }]}
          tooltip="Dify API 的 Bearer Token"
          help="请直接粘贴密钥，不要包含 'Bearer ' 前缀。"
        >
          <Input.Password placeholder="请输入 API 密钥" />
        </Form.Item>
        <Form.Item
          name="maxConcurrentTasks"
          label="最大并发任务数"
          tooltip="同时执行的AI生成任务数量。为空则代表不限制并发。"
        >
          <InputNumber
            min={1}
            placeholder="为空则不限制"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
