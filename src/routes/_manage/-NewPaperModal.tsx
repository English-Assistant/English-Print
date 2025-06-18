import { Modal, Form, Input, Select, message } from 'antd';
import { useStore } from '@/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** 新建试卷弹窗 */
export default function NewPaperModal({ open, onClose }: Props) {
  const { courses, addPaper } = useStore();
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      addPaper(values);
      message.success('新建成功');
      onClose();
      form.resetFields();
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title="新建试卷"
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="所属课程"
          name="courseId"
          rules={[{ required: true, message: '请选择课程' }]}
        >
          <Select
            allowClear={false}
            placeholder="选择课程"
            options={courses.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
