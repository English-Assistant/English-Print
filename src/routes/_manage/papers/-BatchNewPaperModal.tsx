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
  Anchor,
  Typography,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePaperStore, useCourseStore } from '@/stores';
import type { Paper } from '@/data/types/paper';
import { useEffect, useState } from 'react';
import { LAST_COURSE_ID_KEY } from '@/utils/constants';

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
  const [activePaperIndex, setActivePaperIndex] = useState(0);

  useEffect(() => {
    if (open && (!papers || papers.length === 0)) {
      const lastUsedCourseId = localStorage.getItem(LAST_COURSE_ID_KEY);

      // 验证从 localStorage 获取的课程 ID 是否仍然有效
      const isValidCourse = lastUsedCourseId
        ? courses.some((c) => c.id === lastUsedCourseId)
        : false;

      // 如果记忆的课程ID无效，则从localStorage中移除
      if (lastUsedCourseId && !isValidCourse) {
        localStorage.removeItem(LAST_COURSE_ID_KEY);
      }

      const defaultCourseId =
        isValidCourse && lastUsedCourseId
          ? lastUsedCourseId
          : courses.length > 0
            ? courses.at(-1)?.id
            : undefined;

      form.setFieldsValue({
        papers: [{ courseId: defaultCourseId }],
      });
      setActivePaperIndex(0);
    }
  }, [open, papers, courses, form]);

  const handleFinish = async (values: FormValues) => {
    if (!values.papers || values.papers.length === 0) {
      message.warning('请至少添加一个要新增的试卷');
      return;
    }

    try {
      values.papers.forEach((paperData) => {
        const newPaper: Partial<Paper> = {
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
    setActivePaperIndex(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="批量新增试卷"
      width={1200}
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
            <Row gutter={24}>
              <Col span={6}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Button
                    type="dashed"
                    onClick={() => {
                      const lastCourseId =
                        localStorage.getItem(LAST_COURSE_ID_KEY);
                      add({ courseId: lastCourseId ?? undefined });
                      setActivePaperIndex(fields.length); // 激活新添加的最后一项
                    }}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                  >
                    新增试卷
                  </Button>
                  <div
                    style={{
                      maxHeight: '60vh',
                      overflowY: 'auto',
                    }}
                  >
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
                              color:
                                activePaperIndex === index ? '#1677ff' : '',
                            }}
                          >
                            {`${index + 1}. ${papers?.[index]?.title || '新试卷'}`}
                          </Typography.Text>
                        ),
                      }))}
                    />
                  </div>
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
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      style={{
                        display: index === activePaperIndex ? 'block' : 'none',
                      }}
                    >
                      <Card
                        title={`试卷 ${index + 1}`}
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              remove(name);
                              // 如果删除的是当前激活的，或者比当前激活的更靠前
                              if (index <= activePaperIndex) {
                                setActivePaperIndex(Math.max(0, index - 1));
                              }
                            }}
                          />
                        }
                      >
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

export default BatchNewPaperModal;
