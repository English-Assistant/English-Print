import {
  Modal,
  Form,
  Input,
  Select,
  message,
  theme,
  Typography,
  Space,
  Alert,
} from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { usePaperStore, useCourseStore } from '@/stores';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** 新建试卷弹窗 */
export default function NewPaperModal({ open, onClose }: Props) {
  const { addPaper } = usePaperStore();
  const { courses } = useCourseStore();
  const [form] = Form.useForm();
  const { token } = theme.useToken();

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
      title={
        <Space>
          <FileTextOutlined />
          <Typography.Text strong>新建试卷</Typography.Text>
        </Space>
      }
      width={640}
      style={{ top: 20 }}
      styles={{ body: { padding: '24px 24px 8px' } }}
      onOk={handleOk}
      onCancel={onClose}
      okText="确定"
      cancelText="取消"
    >
      <Alert
        message="创建试卷后，您可以在试卷详情页配置导读、抄写练习、试卷内容和答案。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{ remark: '' }}
      >
        <Form.Item
          name="title"
          label="试卷标题"
          rules={[{ required: true, message: '请输入试卷标题' }]}
        >
          <Input
            placeholder="请输入试卷标题"
            autoFocus
            showCount
            maxLength={50}
          />
        </Form.Item>
        <Form.Item
          label="所属课程"
          name="courseId"
          rules={[{ required: true, message: '请选择所属课程' }]}
        >
          <Select
            placeholder="请选择所属课程"
            options={courses.map((c) => ({ value: c.id, label: c.name }))}
            showSearch
            optionFilterProp="label"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          name="remark"
          label="备注"
          help="可选填，用于记录试卷的补充信息"
        >
          <Input.TextArea
            placeholder="请输入备注信息..."
            rows={3}
            showCount
            maxLength={200}
            style={{ backgroundColor: token.colorFillTertiary }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
