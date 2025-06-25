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
import VanillaJsonEditor from '@/components/VanillaJsonEditor';
import Ajv2020 from 'ajv/dist/2020';
import difySchema from '@/data/schema/dify.schema.json';

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

  // 创建并编译统一的校验器
  const ajv = new Ajv2020();
  const validateSchema = ajv.compile(difySchema);

  // 自定义校验规则
  const jsonValidator = (_: unknown, value: unknown) => {
    if (!value || Object.keys(value).length === 0) {
      // 由 required 规则处理空值，这里直接通过
      return Promise.resolve();
    }
    if (!validateSchema(value)) {
      const errorMessages =
        validateSchema.errors
          ?.map((e) => `  - ${e.instancePath || 'root'}: ${e.message}`)
          .join('\\n') ?? '未知校验错误';
      // 使用 pre-wrap 来处理换行，以便在 message.error 中正确显示
      const errorMessage = `JSON Schema 校验失败:\\n${errorMessages}`;
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.resolve();
  };

  const handleFinish = async (values: FormValues) => {
    if (!values.papers || values.papers.length === 0) {
      message.warning('请至少添加一个要导入的试卷');
      return;
    }
    setLoading(true);

    const newPapers: Paper[] = [];

    for (const item of values.papers) {
      // 此时的 jsonData 已经是经过表单校验的、有效的对象
      const generatedData = item.jsonData as unknown as GeneratedPaperData;

      const newPaper: Paper = {
        id: crypto.randomUUID(),
        title: generatedData.title!,
        coreWords: generatedData.coreWords,
        keySentences: generatedData.keySentences,
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
    }

    if (newPapers.length > 0) {
      newPapers.forEach(addPaper);
      message.success(`成功导入 ${newPapers.length} 份试卷！`);
    }

    handleClose();
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
                            { validator: jsonValidator },
                          ]}
                        >
                          <VanillaJsonEditor />
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
