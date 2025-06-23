import { useEffect, useState } from 'react';

export function useSystemTheme() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    // 添加监听器
    mediaQuery.addEventListener('change', handler);

    // 清理监听器
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDarkMode;
}
