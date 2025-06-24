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
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('antd') || id.includes('@ant-design')) {
                return 'vendor-antd';
              }
              if (id.includes('@tanstack/react-router')) {
                return 'vendor-router';
              }
              if (id.includes('vanilla-jsoneditor') || id.includes('ajv')) {
                return 'vendor-editor';
              }
              if (id.includes('dexie') || id.includes('zustand')) {
                return 'vendor-db';
              }
              if (id.includes('react-markdown') || id.includes('remark')) {
                return 'vendor-markdown';
              }
              return 'vendor-core';
            }
          },
        },
      },
    },
  };
});
