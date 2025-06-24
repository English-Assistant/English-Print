import { Modal, Form, Input, Select, theme, Alert, App } from 'antd';
import { usePaperStore, useCourseStore } from '@/stores';
import { useEffect } from 'react';
import type { Paper } from '@/data/types/paper';
import type { Course } from '@/data/types/course';

interface Props {
  open: boolean;
  editingId: string | null;
  onClose: () => void;
}

type FormValues = Omit<Paper, 'id' | 'updatedAt'>;

/** 新建/编辑试卷弹窗 */
export default function NewPaperModal({ open, editingId, onClose }: Props) {
  const { papers, addPaper, updatePaper } = usePaperStore();
  const { courses } = useCourseStore();
  const [form] = Form.useForm<FormValues>();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  useEffect(() => {
    if (open && editingId) {
      const paper = papers.find((p) => p.id === editingId);
      if (paper) {
        form.setFieldsValue(paper);
      }
    } else {
      form.resetFields();
    }
  }, [open, editingId, papers, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        updatePaper(editingId, values);
        message.success('更新成功');
      } else {
        addPaper(values);
        message.success('新建成功');
      }
      onClose();
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal
      open={open}
      title={editingId ? '编辑试卷' : '新建试卷'}
      width={640}
      style={{ top: 20 }}
      // styles={{ body: { padding: '24px 24px 8px' } }}
      onOk={handleOk}
      onCancel={onClose}
      okText="确定"
      cancelText="取消"
      forceRender={true}
    >
      <Alert
        message={
          editingId
            ? '您正在编辑试卷的基本信息。'
            : '创建试卷后，您可以在试卷详情页配置导读、抄写练习、试卷内容和答案。'
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <Form form={form} layout="vertical" initialValues={{ remark: '' }}>
        <Form.Item<FormValues>
          name="title"
          label="试卷标题"
          rules={[{ required: true, message: '请输入试卷标题' }]}
        >
          <Input placeholder="请输入试卷标题" autoFocus />
        </Form.Item>
        <Form.Item<FormValues>
          label="所属课程"
          name="courseId"
          rules={[{ required: true, message: '请选择所属课程' }]}
        >
          <Select
            placeholder="请选择所属课程"
            options={courses.map((c: Course) => ({
              value: c.id,
              label: c.title,
            }))}
            showSearch
            optionFilterProp="label"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item<FormValues> name="remark" label="备注">
          <Input.TextArea
            placeholder="请输入备注信息..."
            rows={3}
            style={{ backgroundColor: token.colorFillTertiary }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
