import { createFileRoute } from '@tanstack/react-router';
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  theme,
  Space,
  Tag,
  Popconfirm,
  message,
  Input,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useCourseStore } from '@/stores';
import { useState } from 'react';
import NewCourseModal from './-NewCourseModal';
import dayjs from 'dayjs';

export const Route = createFileRoute('/_manage/courses')({
  component: CoursesPage,
});

function CoursesPage() {
  const { token } = theme.useToken();
  const { courses, deleteCourse } = useCourseStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    deleteCourse(id);
    message.success('删除成功');
  };

  return (
    <div>
      <Card
        title="课程管理"
        variant="outlined"
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
        }}
        extra={
          <Space size="middle">
            <Input.Search
              allowClear
              placeholder="搜索课程"
              style={{ width: 240 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsNewModalOpen(true)}
            >
              新建课程
            </Button>
          </Space>
        }
      >
        {filtered.length === 0 ? (
          <Empty
            description="暂无课程，请点击右上角新建"
            style={{ padding: '32px 0' }}
          />
        ) : (
          <Row gutter={[24, 24]} style={{ marginTop: -8 }}>
            {filtered.map((course) => (
              <Col key={course.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  styles={{ body: { padding: 20 } }}
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      onClick={() => setEditingId(course.id)}
                      style={{ width: '100%', color: token.colorPrimary }}
                    >
                      <Space>
                        <EditOutlined />
                        编辑
                      </Space>
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="确认删除?"
                      description="删除后不可恢复，确定要删除吗？"
                      onConfirm={() => handleDelete(course.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="text" danger style={{ width: '100%' }}>
                        <Space>
                          <DeleteOutlined />
                          删除
                        </Space>
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size={12}
                  >
                    <Typography.Title
                      level={5}
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 0 }}
                    >
                      <Space>
                        <BookOutlined />
                        {course.name}
                      </Space>
                    </Typography.Title>
                    <Space
                      size={4}
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      <ClockCircleOutlined />
                      {dayjs().format('YYYY-MM-DD HH:mm')}
                    </Space>
                    {course.description && (
                      <Typography.Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 0 }}
                      >
                        {course.description}
                      </Typography.Paragraph>
                    )}
                    <Tag color="blue">{course.id}</Tag>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <NewCourseModal
        open={isNewModalOpen || editingId !== null}
        editingId={editingId}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingId(null);
        }}
      />
    </div>
  );
}
