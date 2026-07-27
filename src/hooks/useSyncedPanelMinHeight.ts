import { useEffect, useRef, useState } from 'react';

export function useSyncedPanelMinHeight<T extends HTMLElement>() {
  const sourceRef = useRef<T>(null);
  const [minHeight, setMinHeight] = useState<number>();

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) {
      return;
    }

    const updateMinHeight = () => {
      setMinHeight(source.getBoundingClientRect().height);
    };

    updateMinHeight();

    const resizeObserver = new ResizeObserver(updateMinHeight);
    resizeObserver.observe(source);
    window.addEventListener('resize', updateMinHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateMinHeight);
    };
  }, []);

  return { sourceRef, minHeight };
}
