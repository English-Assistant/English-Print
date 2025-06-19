import useIsPrinting from '@/hooks/useIsPrinting';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const isPrinting = useIsPrinting();
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && !isPrinting && <TanStackRouterDevtools />}
    </>
  );
}
