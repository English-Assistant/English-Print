import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { Divider, Layout, Menu, theme, Typography } from 'antd';
import {
  FileTextOutlined,
  BookOutlined,
  SettingOutlined,
  DatabaseOutlined,
  ProfileOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

export const Route = createFileRoute('/_manage')({
  component: ManageLayout,
});

function ManageLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = (() => {
    const path = location.pathname.replace('/_manage', '');
    if (path.startsWith('/papers')) return '/papers';
    if (path.startsWith('/courses')) return '/courses';
    if (path.startsWith('/vocabulary')) return '/vocabulary';
    if (path.startsWith('/tasks')) return '/tasks';
    if (path.startsWith('/data')) return '/data';
    if (path.startsWith('/settings')) return '/settings';
    return '/papers';
  })();

  const defaultOpenKeys = (() => {
    if (['/papers', '/courses', '/vocabulary'].includes(selectedKey)) {
      return ['content'];
    }
    if (['/data', '/settings', '/tasks'].includes(selectedKey)) {
      return ['system'];
    }
    return ['content'];
  })();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: 'content',
      icon: <AppstoreOutlined />,
      label: '内容管理',
      children: [
        {
          key: '/papers',
          icon: <FileTextOutlined />,
          label: <Link to="/papers">试卷管理</Link>,
        },
        {
          key: '/courses',
          icon: <BookOutlined />,
          label: <Link to="/courses">课程管理</Link>,
        },
        {
          key: '/vocabulary',
          icon: <ProfileOutlined />,
          label: <Link to="/vocabulary">单词管理</Link>,
        },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统设置',
      children: [
        {
          key: '/tasks',
          icon: <ClockCircleOutlined />,
          label: <Link to="/tasks">任务管理</Link>,
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: <Link to="/settings">接口设置</Link>,
        },
        {
          key: '/data',
          icon: <DatabaseOutlined />,
          label: <Link to="/data">数据管理</Link>,
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        width={264}
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          backgroundColor: colorBgContainer,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        className="print:hidden"
      >
        <Link to="/papers">
          <Typography.Title
            level={1}
            className="p-4 m-0!"
            style={{
              color: theme.useToken().token.colorPrimary,
            }}
          >
            EnglishPrint
          </Typography.Title>
          <Divider className="m-0!" />
        </Link>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={defaultOpenKeys}
          style={{
            padding: '16px 0',
            border: 'none',
          }}
          items={menuItems}
          onClick={(info) => navigate({ to: `${info.key}` })}
        />
      </Layout.Sider>
      <Layout style={{ marginLeft: 264, minHeight: '100vh' }}>
        <Layout.Content
          style={{ padding: 24, backgroundColor: colorBgContainer }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
