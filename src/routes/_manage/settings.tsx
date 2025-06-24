import { createFileRoute } from '@tanstack/react-router';
import { Form, Input, Button, Card, App, Typography } from 'antd';
import { useSettingsStore } from '@/stores/settings';
import { useEffect } from 'react';

export const Route = createFileRoute('/_manage/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { apiUrl, apiToken, setSettings } = useSettingsStore();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    form.setFieldsValue({ apiUrl, apiToken });
  }, [apiUrl, apiToken, form]);

  const handleSave = (values: { apiUrl: string; apiToken: string }) => {
    setSettings(values.apiUrl, values.apiToken);
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
        initialValues={{ apiUrl, apiToken }}
      >
        <Form.Item
          name="apiUrl"
          label="API URL"
          rules={[
            { required: true, message: '请输入 API URL' },
            { type: 'url', message: '请输入有效的 URL' },
          ]}
          tooltip="Dify Workflow 的 API 地址，例如：https://api.dify.ai/v1/workflows/run"
        >
          <Input placeholder="https://api.dify.ai/v1/workflows/run" />
        </Form.Item>
        <Form.Item
          name="apiToken"
          label="API 密钥 (Token)"
          rules={[{ required: true, message: '请输入 API 密钥' }]}
          tooltip="Dify API 的 Bearer Token"
        >
          <Input.Password placeholder="请输入 API 密钥" />
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
