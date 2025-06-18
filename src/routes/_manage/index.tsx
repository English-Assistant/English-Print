import { createFileRoute, Link } from '@tanstack/react-router';
import { Input, Button, Card, Tag, Row, Col, message, Empty } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useStore } from '@/store';
import NewPaperModal from './-NewPaperModal';

export const Route = createFileRoute('/_manage/')({
  component: PaperManagement,
});

function PaperManagement() {
  const { papers, deletePaper, courses } = useStore();
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = papers.filter((p) =>
    p.title.toLowerCase().includes(keyword.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    deletePaper(id);
    message.success('删除成功');
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-gray-800">试卷管理</h2>
      <div className="flex justify-between flex-wrap gap-4">
        <Input
          allowClear
          placeholder="搜索试卷"
          prefix={<SearchOutlined className="text-gray-400" />}
          style={{ width: 300 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          新建
        </Button>
      </div>
      {filtered.length === 0 ? (
        <Empty description="暂无试卷，请点击右上角新建" />
      ) : (
        <Row gutter={[24, 24]}>
          {filtered.map((paper) => (
            <Col key={paper.id} xs={24} sm={12} lg={8}>
              <Link
                to="/paper-detail/[id]"
                params={{ id: paper.id }}
                className="block"
              >
                <Card
                  bordered
                  hoverable
                  bodyStyle={{ padding: 17 }}
                  className="h-full hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-base font-medium text-gray-800 one-line">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    最后修改时间:{' '}
                    {dayjs(paper.updatedAt).format('YYYY-MM-DD HH:mm')}
                  </p>
                  {paper.remark && (
                    <p className="text-gray-600 text-sm mt-1 multi-line-2">
                      {paper.remark}
                    </p>
                  )}
                  {paper.courseId && (
                    <Tag
                      color="#FEF3C7"
                      className="text-yellow-700 border-none rounded-full px-2 mt-1"
                    >
                      {courses.find((c) => c.id === paper.courseId)?.name ||
                        '未知课程'}
                    </Tag>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className="text-red-500 flex items-center gap-1 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault(); // prevent link navigation
                        handleDelete(paper.id);
                      }}
                    >
                      <DeleteOutlined /> 删除
                    </span>
                    <span className="text-blue-500 flex items-center gap-1">
                      <EditOutlined /> 编辑
                    </span>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
      {open && <NewPaperModal open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}
