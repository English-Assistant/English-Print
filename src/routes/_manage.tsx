import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from '@tanstack/react-router';
import { Divider, Layout, Menu, theme, Typography } from 'antd';
import {
  FileTextOutlined,
  BookOutlined,
  SettingOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

export const Route = createFileRoute('/_manage')({
  component: ManageLayout,
});

function ManageLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getCurrentKey = () => {
    if (pathname.startsWith('/courses')) return '/courses';
    if (pathname.startsWith('/data')) return '/data';
    if (pathname.startsWith('/settings')) return '/settings';
    return '/';
  };
  const selectedKey = getCurrentKey();

  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        width={264}
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          backgroundColor: token.colorBgContainer,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        className="print:hidden"
      >
        <Link to="/">
          <Typography.Title
            level={1}
            className="p-4 m-0!"
            style={{
              color: token.colorPrimary,
            }}
          >
            EnglishPrint
          </Typography.Title>
          <Divider className="m-0!" />
        </Link>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            padding: '16px 0',
            border: 'none',
          }}
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
            {
              key: '/data',
              icon: <DatabaseOutlined />,
              label: <Link to="/data">数据管理</Link>,
            },
            {
              key: '/settings',
              icon: <SettingOutlined />,
              label: <Link to="/settings">接口设置</Link>,
            },
          ]}
          onClick={(info) => navigate({ to: info.key })}
        />
      </Layout.Sider>
      <Layout style={{ marginLeft: 264, minHeight: '100vh' }}>
        <Layout.Content
          style={{ padding: 24, backgroundColor: token.colorBgLayout }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
