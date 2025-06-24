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
import { usePaperStore, useCourseStore } from '@/stores';
import { useState } from 'react';
import type { GeneratedPaperData } from '@/data/types/generation';
import type { Paper } from '@/data/types/paper';
import dayjs from 'dayjs';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { validateGeneratedPaperData } from '@/utils/schemaValidators';

interface BatchNewPaperJsonModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  papers: {
    jsonData: string;
    courseId?: string;
    remark?: string;
  }[];
}

function BatchNewPaperJsonModal({
  open,
  onClose,
}: BatchNewPaperJsonModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const { addPaper } = usePaperStore();
  const { courses } = useCourseStore();
  const [loading, setLoading] = useState(false);
  const papers = Form.useWatch('papers', form);

  const handleFinish = async (values: FormValues) => {
    if (!values.papers || values.papers.length === 0) {
      message.warning('请至少添加一个要导入的试卷');
      return;
    }
    setLoading(true);

    const newPapers: Paper[] = [];
    const errors: string[] = [];

    for (const [index, item] of values.papers.entries()) {
      try {
        if (!item.jsonData) {
          throw new Error('JSON数据不能为空');
        }
        const generatedData: GeneratedPaperData = JSON.parse(item.jsonData);

        const validationErrors = validateGeneratedPaperData(generatedData);
        if (validationErrors.length > 0) {
          throw new Error(
            `JSON Schema 校验失败: ${validationErrors.join('; ')}`,
          );
        }

        if (!generatedData.examPaper?.title) {
          throw new Error('JSON数据中缺少试卷标题 (examPaper.title)');
        }

        const newPaper: Paper = {
          id: crypto.randomUUID(),
          title: generatedData.examPaper.title,
          preclass: generatedData.preClassGuide,
          listeningMaterial: generatedData.listeningMaterial,
          copyJson: generatedData.copyExercise,
          examJson: generatedData.examPaper,
          answerJson: generatedData.examAnswers,
          updatedAt: dayjs().toISOString(),
          courseId: item.courseId,
          remark: item.remark,
        };
        newPapers.push(newPaper);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知解析错误';
        errors.push(`第 ${index + 1} 项导入失败: ${errorMessage}`);
      }
    }

    if (newPapers.length > 0) {
      newPapers.forEach(addPaper);
      message.success(`成功导入 ${newPapers.length} 份试卷！`);
    }

    if (errors.length > 0) {
      // 使用 pre-wrap 来处理换行
      message.error(<pre style={{ margin: 0 }}>{errors.join('\n')}</pre>, 5);
    }

    if (errors.length === 0) {
      handleClose();
    }

    setLoading(false);
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
      title="批量新增 (JSON)"
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
          {`确认导入 ${papers?.length || 0} 份试卷`}
        </Button>,
      ]}
      forceRender={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ papers: [{}] }}
      >
        <Divider>待导入试卷列表</Divider>
        <Form.List name="papers">
          {(fields, { add, remove }) => (
            <>
              <div
                style={{
                  maxHeight: '50vh',
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
                          name={[name, 'jsonData']}
                          label="单份试卷JSON数据"
                          rules={[
                            { required: true, message: '请输入JSON数据' },
                          ]}
                        >
                          <Input.TextArea
                            rows={10}
                            placeholder="请在此处粘贴单份试卷的JSON数据..."
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
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  新增一个待导入项
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default BatchNewPaperJsonModal;
