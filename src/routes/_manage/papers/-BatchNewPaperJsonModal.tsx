import {
  Modal,
  Form,
  Input,
  Button,
  App,
  Row,
  Col,
  Card,
  Select,
  Anchor,
  Typography,
} from 'antd';
import { usePaperStore, useCourseStore } from '@/stores';
import { useEffect, useState } from 'react';
import type { GeneratedPaperData } from '@/data/types/generation';
import type { Paper } from '@/data/types/paper';
import dayjs from 'dayjs';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import VanillaJsonEditor from '@/components/VanillaJsonEditor';
import Ajv2020 from 'ajv/dist/2020';
import difySchema from '@/data/schema/dify.schema.json';
import { LAST_COURSE_ID_KEY } from '@/utils/constants';

interface BatchNewPaperJsonModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  papers: {
    jsonData: GeneratedPaperData; // The component returns a parsed object
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
  const [activePaperIndex, setActivePaperIndex] = useState(0);

  useEffect(() => {
    if (open && (!papers || papers.length === 0)) {
      const lastUsedCourseId = localStorage.getItem(LAST_COURSE_ID_KEY);
      const isValidCourse = lastUsedCourseId
        ? courses.some((c) => c.id === lastUsedCourseId)
        : false;

      if (lastUsedCourseId && !isValidCourse) {
        localStorage.removeItem(LAST_COURSE_ID_KEY);
      }

      const defaultCourseId =
        isValidCourse && lastUsedCourseId
          ? lastUsedCourseId
          : courses.length > 0
            ? courses.at(-1)?.id
            : undefined;

      form.setFieldsValue({ papers: [{ courseId: defaultCourseId }] });
      setActivePaperIndex(0);
    }
  }, [open, papers, courses, form]);

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
      const generatedData = item.jsonData;
      const now = dayjs().toISOString();

      const newPaper: Paper = {
        id: crypto.randomUUID(),
        title: generatedData.title!,
        coreWords: generatedData.coreWords,
        keySentences: generatedData.story,
        preclass: generatedData.preClassGuide,
        listeningJson: generatedData.listeningMaterial,
        copyJson: generatedData.copyExercise,
        examJson: generatedData.examPaper,
        answerJson: generatedData.examAnswers,
        createdAt: now,
        updatedAt: now,
        courseId: item.courseId,
        remark: item.remark,
      };
      newPapers.push(newPaper);
    }

    if (newPapers.length > 0) {
      newPapers.forEach(addPaper);
      message.success(`成功导入 ${newPapers.length} 份试卷！`);
      const lastPaper = newPapers.at(-1);
      if (lastPaper?.courseId) {
        localStorage.setItem(LAST_COURSE_ID_KEY, lastPaper.courseId);
      }
    }

    handleClose();
    setLoading(false);
  };

  const handleClose = () => {
    if (loading) return;
    form.resetFields();
    setActivePaperIndex(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="批量新增 (JSON)"
      width={1200}
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
        autoComplete="off"
      >
        <Form.List name="papers">
          {(fields, { add, remove }) => (
            <Row gutter={24}>
              <Col span={6}>
                <Button
                  type="dashed"
                  onClick={() => {
                    const lastCourseId =
                      localStorage.getItem(LAST_COURSE_ID_KEY);
                    add({ courseId: lastCourseId ?? undefined });
                    setActivePaperIndex(fields.length);
                  }}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 16 }}
                >
                  新增导入项
                </Button>
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <Anchor
                    targetOffset={0}
                    affix={false}
                    onClick={(e, link) => {
                      e.preventDefault();
                      const index = parseInt(link.href.replace('#', ''), 10);
                      setActivePaperIndex(index);
                    }}
                    items={fields.map((field, index) => ({
                      key: field.key.toString(),
                      href: `#${index}`,
                      title: (
                        <Typography.Text
                          ellipsis
                          style={{
                            color: activePaperIndex === index ? '#1677ff' : '',
                          }}
                        >
                          {`${index + 1}. ${papers?.[index]?.jsonData?.title || '新导入项'}`}
                        </Typography.Text>
                      ),
                    }))}
                  />
                </div>
              </Col>
              <Col span={18}>
                <div
                  style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    padding: '1px 8px',
                  }}
                >
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      style={{
                        display: index === activePaperIndex ? 'block' : 'none',
                      }}
                    >
                      <Card
                        title={`导入项 ${index + 1}`}
                        style={{ marginBottom: 16 }}
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              remove(field.name);
                              if (index <= activePaperIndex) {
                                setActivePaperIndex(Math.max(0, index - 1));
                              }
                            }}
                          />
                        }
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, 'courseId']}
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
                          {...field}
                          name={[field.name, 'jsonData']}
                          label="单份试卷JSON数据"
                          rules={[
                            { required: true, message: '请输入JSON数据' },
                            { validator: jsonValidator },
                          ]}
                        >
                          <VanillaJsonEditor />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'remark']}
                          label="备注 (可选)"
                        >
                          <Input.TextArea rows={2} placeholder="输入备注信息" />
                        </Form.Item>
                      </Card>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default BatchNewPaperJsonModal;
