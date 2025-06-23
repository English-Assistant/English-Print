import { Modal, Form, Input, theme, message } from 'antd';
import { useCourseStore } from '@/stores';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  editingId: string | null;
  onClose: () => void;
}

export default function NewCourseModal({ open, editingId, onClose }: Props) {
  const { token } = theme.useToken();
  const { courses, addCourse, updateCourse } = useCourseStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingId) {
      const course = courses.find((c) => c.id === editingId);
      if (course) {
        form.setFieldsValue(course);
      }
    } else {
      form.resetFields();
    }
  }, [open, editingId, courses, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        updateCourse(editingId, values);
        message.success('更新成功');
      } else {
        addCourse(values);
        message.success('添加成功');
      }
      onClose();
    } catch {
      // Form validation will handle the error display
    }
  };

  return (
    <Modal
      open={open}
      title={editingId ? '编辑课程' : '新建课程'}
      onCancel={onClose}
      onOk={handleSave}
      okText="确定"
      cancelText="取消"
      forceRender={true}
    >
      <Form form={form} layout="vertical" style={{ marginTop: token.marginMD }}>
        <Form.Item
          name="name"
          label="课程名称"
          rules={[{ required: true, message: '请输入课程名称' }]}
        >
          <Input
            autoFocus
            placeholder="请输入课程名称"
            showCount
            maxLength={50}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="课程描述"
          rules={[{ required: true, message: '请输入课程描述' }]}
        >
          <Input.TextArea
            placeholder="请输入课程描述"
            showCount
            maxLength={200}
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
