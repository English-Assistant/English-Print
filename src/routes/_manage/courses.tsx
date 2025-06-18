import { createFileRoute } from '@tanstack/react-router';
import {
  Table,
  Button,
  Input,
  Space,
  message,
  Popconfirm,
  Modal,
  Form,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useCourseStore } from '@/stores';
import { useState } from 'react';

export const Route = createFileRoute('/_manage/courses')({
  component: CoursePage,
});

interface RowEditing {
  id: string;
  name: string;
}

function CoursePage() {
  const { courses, addCourse, updateCourse, deleteCourse } = useCourseStore();
  const [editing, setEditing] = useState<RowEditing | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = async () => {
    try {
      const { name } = await form.validateFields();
      addCourse(name.trim());
      message.success('新增成功');
      setOpen(false);
      form.resetFields();
    } catch {
      /* ignore */
    }
  };

  const columns = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: { id: string; name: string }) => {
        if (editing?.id === record.id) {
          return (
            <Input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          );
        }
        return record.name;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: { id: string; name: string }) => {
        const isEditing = editing?.id === record.id;
        return (
          <Space>
            {isEditing ? (
              <>
                <Button
                  icon={<CheckOutlined />}
                  type="primary"
                  size="small"
                  onClick={() => {
                    if (!editing?.name.trim()) {
                      message.warning('名称不能为空');
                      return;
                    }
                    updateCourse(record.id, editing.name.trim());
                    setEditing(null);
                  }}
                />
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => setEditing(null)}
                />
              </>
            ) : (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => setEditing({ id: record.id, name: record.name })}
              />
            )}
            <Popconfirm
              title="确认删除?"
              onConfirm={() => deleteCourse(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">课程管理</h2>
      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          新增课程
        </Button>
      </div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleAdd}
        title="新增课程"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名称' }]}
          >
            <Input autoFocus />
          </Form.Item>
        </Form>
      </Modal>
      <Table
        rowKey="id"
        dataSource={courses}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}
