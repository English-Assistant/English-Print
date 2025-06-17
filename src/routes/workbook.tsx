import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/workbook')({
  component: Workbook,
});

function Workbook() {
  return <div></div>;
}
