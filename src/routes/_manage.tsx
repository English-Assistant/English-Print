import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from '@tanstack/react-router';
import { Layout, Menu } from 'antd';
import { FileTextOutlined, BookOutlined } from '@ant-design/icons';

export const Route = createFileRoute('/_manage')({
  component: ManageLayout,
});

function ManageLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selectedKey = pathname.startsWith('/courses') ? '/courses' : '/';

  return (
    <Layout className="min-h-screen">
      <Layout.Sider
        width={200}
        className="bg-white border-r border-gray-200 !static print:hidden"
      >
        <div className="h-12 flex items-center justify-center font-semibold text-lg text-blue-600 border-b border-gray-200">
          EnglishPrint
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: '/',
              icon: <FileTextOutlined />,
              label: <Link to="/">试卷管理</Link>,
            },
            {
              key: '/courses',
              icon: <BookOutlined />,
              label: <Link to="/courses">课程管理</Link>,
            },
          ]}
          onClick={(info) => navigate({ to: info.key })}
          style={{ height: '100%' }}
        />
      </Layout.Sider>
      <Layout className="bg-gray-100">
        <Layout.Content>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
