import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_manage/')({
  beforeLoad: () => {
    throw redirect({
      to: '/papers',
    });
  },
});
