import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
  createRouter,
  createBrowserHistory,
  createHashHistory,
} from '@tanstack/react-router';
import 'virtual:uno.css';
import { routeTree } from './routeTree.gen';
import '@unocss/reset/tailwind-compat.css';
import './styles/editor.css';

const history =
  import.meta.env.MODE === 'production'
    ? createHashHistory()
    : createBrowserHistory();

const router = createRouter({ routeTree, history });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
