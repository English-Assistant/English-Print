import { createFileRoute } from '@tanstack/react-router';
import { Form, Input, Button, Card, App, Typography } from 'antd';
import { useVocabularyStore } from '@/stores';
import { useEffect } from 'react';

export const Route = createFileRoute('/_manage/vocabulary/')({
  component: VocabularyPage,
});

function VocabularyPage() {
  const { words, updateWords } = useVocabularyStore();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    form.setFieldsValue({ words: words.join('\\n') });
  }, [words, form]);

  const handleSave = (values: { words: string }) => {
    const wordsArray = values.words
      .split(/\\n|\\s|,/g)
      .map((w) => w.trim())
      .filter(Boolean);
    updateWords(wordsArray);
    message.success('词汇库已更新！');
  };

  return (
    <Card>
      <Typography.Title level={4}>通用词汇库管理</Typography.Title>
      <Typography.Paragraph type="secondary">
        此处维护一个全局共享的词汇库。这些词汇将作为生成试卷时（例如完形填空）的干扰项或基础词汇。
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item
          name="words"
          label="单词列表"
          tooltip="每行一个单词，或用逗号、空格分隔。"
        >
          <Input.TextArea
            rows={15}
            placeholder="one&#10;two&#10;three"
            style={{ fontFamily: 'monospace' }}
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
