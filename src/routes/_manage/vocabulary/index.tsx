import { createFileRoute } from '@tanstack/react-router';
import {
  Form,
  Input,
  Button,
  Card,
  App,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  usePaperStore,
  useVocabularyStore,
  useCourseStore,
  type Paper,
} from '@/stores';
import { useEffect, useMemo } from 'react';

export const Route = createFileRoute('/_manage/vocabulary/')({
  component: VocabularyPage,
});

function VocabularyPage() {
  const { words: baseWords, updateWords } = useVocabularyStore();
  const { papers } = usePaperStore();
  const { courses } = useCourseStore();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    form.setFieldsValue({ words: baseWords.join('\n') });
  }, [baseWords, form]);

  const handleSave = (values: { words: string }) => {
    const wordsArray = values.words
      .split(/\n|\s|,/g)
      .map((w) => w.trim())
      .filter(Boolean);
    updateWords(wordsArray);
    message.success('词汇库已更新！');
  };

  const vocabularyByCourse = useMemo(() => {
    const grouped = new Map<
      string,
      {
        courseTitle: string;
        papers: { id: string; title: string; words: string }[];
      }
    >();

    courses.forEach((course) => {
      grouped.set(course.id, {
        courseTitle: course.title,
        papers: [],
      });
    });
    grouped.set('uncategorized', { courseTitle: '未分类', papers: [] });

    papers
      .filter((p: Paper) => p.coreWords && p.coreWords.trim().length > 0)
      .forEach((p: Paper) => {
        const courseId = p.courseId || 'uncategorized';
        const courseGroup = grouped.get(courseId);

        if (courseGroup) {
          const words = p.coreWords!.split(/,|\s+/).filter(Boolean);
          courseGroup.papers.push({
            id: p.id,
            title: p.title,
            words: words.join(', '),
          });
        }
      });

    const result: {
      courseId: string;
      courseTitle: string;
      papers: { id: string; title: string; words: string }[];
    }[] = [];
    grouped.forEach((value, key) => {
      if (value.papers.length > 0) {
        result.push({
          courseId: key,
          courseTitle: value.courseTitle,
          papers: value.papers,
        });
      }
    });

    return result;
  }, [papers, courses]);

  return (
    <Row gutter={16}>
      <Col span={12}>
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
                rows={20}
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
      </Col>
      <Col span={12}>
        <Card>
          <Typography.Title level={4}>完整词汇库预览</Typography.Title>
          <Typography.Paragraph type="secondary">
            这是最终生成试卷时，将提供给 AI
            的完整词库。它由基础词汇和课程单元的核心词汇共同构成。
          </Typography.Paragraph>
          <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            <Typography.Title level={5} style={{ marginTop: '1rem' }}>
              基础词汇
            </Typography.Title>
            <Typography.Paragraph
              style={{ wordBreak: 'break-all' }}
              copyable={
                baseWords.length > 0 ? { text: baseWords.join(', ') } : false
              }
            >
              {baseWords.join(', ')}
            </Typography.Paragraph>

            <Divider>课程单元词汇</Divider>

            {vocabularyByCourse.map(
              ({ courseId, courseTitle, papers: coursePapers }) => (
                <div key={courseId} style={{ marginBottom: '1.5rem' }}>
                  <Typography.Title level={5}>{courseTitle}</Typography.Title>
                  {coursePapers.map((p) => (
                    <div
                      key={p.id}
                      style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}
                    >
                      <Typography.Text strong>{p.title}</Typography.Text>
                      <Typography.Paragraph
                        style={{
                          wordBreak: 'break-all',
                          marginTop: '0.2rem',
                        }}
                        copyable
                      >
                        {p.words}
                      </Typography.Paragraph>
                    </div>
                  ))}
                </div>
              ),
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
