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

const LAST_COURSE_ID_KEY = 'english-print-last-course-id';

interface BatchNewPaperModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  papers: {
    title: string;
    coreWords: string;
    story: string;
    courseId?: string;
    remark?: string;
  }[];
}

function BatchNewPaperModal({ open, onClose }: BatchNewPaperModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const { addPaper } = usePaperStore();
  const { courses } = useCourseStore();
  const papers = Form.useWatch('papers', form);

  const handleFinish = async (values: FormValues) => {
    if (!values.papers || values.papers.length === 0) {
      message.warning('请至少添加一个要新增的试卷');
      return;
    }

    try {
      values.papers.forEach((paperData) => {
        const newPaper: Omit<Paper, 'id' | 'updatedAt'> = {
          title: paperData.title,
          coreWords: paperData.coreWords,
          keySentences: paperData.story, // 将 story 映射到 keySentences
          courseId: paperData.courseId,
          remark: paperData.remark,
        };
        addPaper(newPaper);
      });

      message.success(`成功新增 ${values.papers.length} 份试卷！`);
      if (values.papers.length > 0) {
        const lastPaper = values.papers[values.papers.length - 1];
        if (lastPaper.courseId) {
          localStorage.setItem(LAST_COURSE_ID_KEY, lastPaper.courseId);
        }
      }
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`新增失败: ${error.message}`);
      } else {
        message.error('新增过程中发生未知错误');
      }
    }
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
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          {`确认新增 ${papers?.length || 0} 份试卷`}
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
        <Divider>试卷列表</Divider>

        <Form.List name="papers">
          {(fields, { add, remove }) => (
            <>
              <div
                style={{
                  maxHeight: '55vh',
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
                          label="核心单词"
                          rules={[
                            { required: true, message: '请输入核心单词' },
                          ]}
                        >
                          <Input.TextArea
                            rows={2}
                            placeholder="例如: Spring, Summer, Autumn, Winter"
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'story']}
                          label="本节小故事"
                          rules={[
                            { required: true, message: '请输入本节小故事' },
                          ]}
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="请输入一个小故事，AI将根据故事内容和核心单词生成教学材料。"
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
                          name={[name, 'remark']}
                          label="备注 (可选)"
                        >
                          <Input.TextArea rows={2} placeholder="输入备注信息" />
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
