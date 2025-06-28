import { useEventListener } from 'ahooks';
import { useState } from 'react';

// 自定义 Hook
export default function useIsPrinting() {
  const [isPrinting, setIsPrinting] = useState(false);

  useEventListener('beforeprint', () => {
    setIsPrinting(true);
  });

  useEventListener('afterprint', () => {
    setIsPrinting(false);
  });

  return isPrinting;
}
