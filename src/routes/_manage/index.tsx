import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Input,
  Button,
  Card,
  Tag,
  Row,
  Col,
  message,
  Empty,
  theme,
  Typography,
  Space,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { usePaperStore, useCourseStore } from '@/stores';
import NewPaperModal from './-NewPaperModal';

export const Route = createFileRoute('/_manage/')({
  component: PaperManagement,
});

function PaperManagement() {
  const { papers, deletePaper } = usePaperStore();
  const { courses } = useCourseStore();
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const { token } = theme.useToken();

  const filtered = papers.filter((p) =>
    p.title.toLowerCase().includes(keyword.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    deletePaper(id);
    message.success('删除成功');
  };

  return (
    <div>
      <Card
        title="试卷管理"
        variant="outlined"
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
        }}
        extra={
          <Space size="middle">
            <Input.Search
              allowClear
              placeholder="搜索试卷"
              style={{ width: 240 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              新建试卷
            </Button>
          </Space>
        }
      >
        {filtered.length === 0 ? (
          <Empty
            description="暂无试卷，请点击右上角新建"
            style={{ padding: '32px 0' }}
          />
        ) : (
          <Row gutter={[24, 24]} style={{ marginTop: -8 }}>
            {filtered.map((paper) => (
              <Col key={paper.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  styles={{ body: { padding: 20 } }}
                  style={{ height: '100%' }}
                  actions={[
                    <Link
                      key="edit"
                      to="/paper-detail/$id"
                      params={{ id: paper.id }}
                      style={{ color: token.colorPrimary }}
                    >
                      <Space>
                        <EditOutlined />
                        编辑
                      </Space>
                    </Link>,
                    <Popconfirm
                      key="delete"
                      title="确认删除?"
                      description="删除后不可恢复，确定要删除吗？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(paper.id);
                      }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        danger
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%' }}
                      >
                        <Space>
                          <DeleteOutlined />
                          删除
                        </Space>
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Link
                    to="/paper-detail/$id"
                    params={{ id: paper.id }}
                    style={{ color: 'inherit' }}
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
                          <FileTextOutlined />
                          {paper.title}
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
                        {dayjs(paper.updatedAt).format('YYYY-MM-DD HH:mm')}
                      </Space>
                      {paper.remark && (
                        <Typography.Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 0 }}
                        >
                          {paper.remark}
                        </Typography.Paragraph>
                      )}
                      {paper.courseId && (
                        <Tag color="blue">
                          {courses.find((c) => c.id === paper.courseId)?.name ||
                            '未知课程'}
                        </Tag>
                      )}
                    </Space>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
      {open && <NewPaperModal open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}
