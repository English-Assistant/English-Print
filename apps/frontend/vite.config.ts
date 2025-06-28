import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { codeInspectorPlugin } from 'code-inspector-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/English-Print/' : '/',
    plugins: [
      UnoCSS(),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      svgr(),
      tsconfigPaths(),
      codeInspectorPlugin({
        bundler: 'vite',
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // 核心框架
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              // UI 库
              if (id.includes('antd') || id.includes('@ant-design')) {
                return 'vendor-antd';
              }
              // 路由
              if (id.includes('@tanstack')) {
                return 'vendor-tanstack';
              }
              // 数据状态管理
              if (
                id.includes('zustand') ||
                id.includes('dexie') ||
                id.includes('axios') ||
                id.includes('ahooks')
              ) {
                return 'vendor-data';
              }
              // 编辑器、PDF、Markdown 等重功能模块
              if (
                id.includes('vanilla-jsoneditor') ||
                id.includes('ajv') ||
                id.includes('html2pdf.js') ||
                id.includes('react-markdown')
              ) {
                return 'vendor-heavy';
              }
              // 其他第三方库
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
