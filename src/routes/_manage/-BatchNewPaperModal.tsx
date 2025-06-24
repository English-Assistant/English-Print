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

interface BatchNewPaperModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  vocabulary: string;
  papers: {
    title: string;
    coreWords: string;
    coreSentences: string;
    courseId?: string;
    notes?: string;
  }[];
}

function BatchNewPaperModal({ open, onClose }: BatchNewPaperModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const { addPaper } = usePaperStore();
  const { courses } = useCourseStore();

  const { runAsync: handleBatchCreate, loading } = useRequest(runDifyWorkflow, {
    manual: true,
    onSuccess: (result) => {
      const newPapers: Paper[] = result.output.map((data) => ({
        id: crypto.randomUUID(),
        title: data.examPaper.title,
        preclass: data.preClassGuide,
        listeningMaterial: data.listeningMaterial,
        copyJson: data.copyExercise,
        examJson: data.examPaper,
        answerJson: data.examAnswers,
        updatedAt: dayjs().toISOString(),
      }));

      newPapers.forEach(addPaper);
      message.success(`成功新增 ${newPapers.length} 份试卷！`);
      handleClose();
    },
    onError: (error) => {
      message.error(`新增失败: ${error.message}`);
    },
  });

  const handleFinish = async (values: FormValues) => {
    if (!values.papers || values.papers.length === 0) {
      message.warning('请至少添加一个要生成的试卷');
      return;
    }

    const payload = {
      vocabulary: values.vocabulary,
      papers: values.papers.map((p) => ({
        title: p.title,
        core_words: p.coreWords.split(/[,\\s]+/).filter(Boolean),
        core_sentences: p.coreSentences.split('\\n').filter(Boolean),
        course_id: p.courseId,
        notes: p.notes,
      })),
    };

    handleBatchCreate(payload);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="批量新增试卷"
      width={800}
      footer={[
        <Button key="back" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          保存
        </Button>,
      ]}
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
                    bodyStyle={{ padding: '16px' }}
                    style={{ marginBottom: 16 }}
                  >
                    <Row gutter={16}>
                      <Col span={23}>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          label="单元标题"
                          rules={[
                            { required: true, message: '请输入单元标题' },
                          ]}
                        >
                          <Input placeholder="例如: Unit 3 Seasons" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'coreWords']}
                          label="核心单词 (本单元)"
                          rules={[
                            { required: true, message: '请输入核心单词' },
                          ]}
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="例如: Spring, Summer, Autumn, Winter"
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'coreSentences']}
                          label="重点句型"
                          rules={[
                            { required: true, message: '请输入重点句型' },
                          ]}
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="每行一个句型，例如: What's your favorite season?"
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
                  onClick={() => add()}
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
