import {
  Modal,
  Form,
  Input,
  Button,
  App,
  Row,
  Col,
  Divider,
  Card,
  Select,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePaperStore, useCourseStore } from '@/stores';
import type { Paper } from '@/data/types/paper';
import dayjs from 'dayjs';
import { runDifyWorkflow } from '@/apis/generation';
import { useRequest } from 'ahooks';
import type { GeneratedPaperData } from '@/data/types/generation';
import { useEffect } from 'react';
import { validateGeneratedPaperData } from '@/utils/schemaValidators';

const LAST_VOCABULARY_KEY = 'english-print-last-vocabulary';
const LAST_COURSE_ID_KEY = 'english-print-last-course-id';

interface BatchNewPaperModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  vocabulary: string;
  papers: {
    unit: string;
    courseId?: string;
    notes?: string;
  }[];
}

function BatchNewPaperModal({ open, onClose }: BatchNewPaperModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const { addPaper } = usePaperStore();
  const { courses } = useCourseStore();
  const papers = Form.useWatch('papers', form);

  useEffect(() => {
    if (open) {
      const lastVocabulary = localStorage.getItem(LAST_VOCABULARY_KEY);
      if (lastVocabulary) {
        form.setFieldsValue({ vocabulary: lastVocabulary });
      }
    }
  }, [open, form]);

  const { runAsync: generateSinglePaper, loading } = useRequest(
    runDifyWorkflow,
    {
      manual: true,
    },
  );

  const handleFinish = async (values: FormValues) => {
    if (!values.papers || values.papers.length === 0) {
      message.warning('请至少添加一个要生成的试卷');
      return;
    }

    try {
      const paperChunks: FormValues['papers'][] = [];
      const concurrency = 3;
      for (let i = 0; i < values.papers.length; i += concurrency) {
        paperChunks.push(values.papers.slice(i, i + concurrency));
      }

      let successCount = 0;
      const errors: string[] = [];

      for (const chunk of paperChunks) {
        const promises = chunk.map(async (paperData) => {
          const payload = {
            words: values.vocabulary,
            unit: paperData.unit,
          };

          const result: GeneratedPaperData = await generateSinglePaper(payload);

          const validationErrors = validateGeneratedPaperData(result);
          if (validationErrors.length > 0) {
            throw new Error(
              `AI返回的数据校验失败: ${validationErrors.join('; ')}`,
            );
          }

          const newPaper: Paper = {
            id: crypto.randomUUID(),
            title: result.examPaper.title,
            preclass: result.preClassGuide,
            listeningMaterial: result.listeningMaterial,
            copyJson: result.copyExercise,
            examJson: result.examPaper,
            answerJson: result.examAnswers,
            updatedAt: dayjs().toISOString(),
            courseId: paperData.courseId,
          };
          addPaper(newPaper);
        });

        const results = await Promise.allSettled(promises);
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            successCount++;
          } else if (result.reason instanceof Error) {
            errors.push(result.reason.message);
          }
        });
      }

      if (errors.length > 0) {
        message.error(`部分试卷生成失败: ${errors.join('; ')}`);
      }
      if (successCount > 0) {
        message.success(`成功新增 ${successCount} 份试卷！`);
        localStorage.setItem(LAST_VOCABULARY_KEY, values.vocabulary);
        if (values.papers.length > 0) {
          const lastPaper = values.papers[values.papers.length - 1];
          if (lastPaper.courseId) {
            localStorage.setItem(LAST_COURSE_ID_KEY, lastPaper.courseId);
          }
        }
        handleClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(`新增失败: ${error.message}`);
      } else {
        message.error('新增过程中发生未知错误');
      }
    }
  };

  const handleClose = () => {
    if (loading) return;
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="批量新增试卷"
      width={800}
      closable={!loading}
      maskClosable={!loading}
      footer={[
        <Button key="back" onClick={handleClose} disabled={loading}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {loading ? '正在生成中...' : `确认生成 ${papers?.length || 0} 份试卷`}
        </Button>,
      ]}
      forceRender={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          name="vocabulary"
          label="词汇积累 (共享词库)"
          tooltip="输入本批次所有试卷共享的核心或过往单词，用逗号或空格分隔。此为生成题库的基础。"
          rules={[{ required: true, message: '请输入共享的词汇' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="例如: Spring, Summer, Autumn, Winter, hot, warm, cool, cold"
          />
        </Form.Item>

        <Divider>试卷列表</Divider>

        <Form.List name="papers">
          {(fields, { add, remove }) => (
            <>
              <div
                style={{
                  maxHeight: '40vh',
                  overflowY: 'auto',
                  padding: '1px 8px',
                }}
              >
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    styles={{ body: { padding: '16px' } }}
                    style={{ marginBottom: 16 }}
                  >
                    <Row gutter={16}>
                      <Col span={23}>
                        <Form.Item
                          {...restField}
                          name={[name, 'unit']}
                          label="单元内容"
                          rules={[
                            { required: true, message: '请输入单元内容' },
                          ]}
                        >
                          <Input.TextArea
                            rows={8}
                            placeholder="- 单元标题
[Unit 3 Seasons]

- 核心单词
[Spring, Summer, Autumn, Winter]

- 重点句型
[What's your favorite season?]"
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'courseId']}
                          label="所属课程"
                          rules={[
                            { required: true, message: '请选择所属课程' },
                          ]}
                        >
                          <Select
                            allowClear
                            placeholder="选择一个所属课程"
                            options={courses.map((c) => ({
                              label: c.title,
                              value: c.id,
                            }))}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'notes']}
                          label="备注"
                        >
                          <Input.TextArea
                            rows={2}
                            placeholder="输入备注信息（可选）"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          style={{ marginLeft: 'auto', display: 'block' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
              <Form.Item style={{ marginTop: 8 }}>
                <Button
                  type="dashed"
                  onClick={() => {
                    const lastCourseId =
                      localStorage.getItem(LAST_COURSE_ID_KEY);
                    add({ courseId: lastCourseId ?? undefined }, 0);
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  新增一个试卷
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default BatchNewPaperModal;
