import useIsPrinting from '@/hooks/useIsPrinting';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ConfigProvider, theme } from 'antd';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import { useSystemTheme } from '@/hooks/useSystemTheme';

export const Route = createRootRoute({
  component: Root,
});

export function Root() {
  const isPrinting = useIsPrinting();
  const isDarkMode = useSystemTheme();
  return (
    <>
      <ConfigProvider
        theme={{
          cssVar: true,
          hashed: false,
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
        locale={zhCN}
      >
        <Outlet />
        {import.meta.env.DEV && !isPrinting && <TanStackRouterDevtools />}
      </ConfigProvider>
    </>
  );
}
