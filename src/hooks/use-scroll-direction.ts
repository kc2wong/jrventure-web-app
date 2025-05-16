import { useEffect, useState } from 'react';
import { useIsMobile } from './use-mobile';

export const useScrollDirection = (containerRef: React.RefObject<HTMLElement>) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const isMobile = useIsMobile();
  useEffect(() => {
    if (!isMobile) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const onScroll = () => {
      const currentScrollTop = container.scrollTop;

      if (currentScrollTop > lastScrollTop + 10) {
        setScrollDirection('down');
        setLastScrollTop(currentScrollTop);
      } else if (currentScrollTop < lastScrollTop - 10) {
        setScrollDirection('up');
        setLastScrollTop(currentScrollTop);
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [lastScrollTop, containerRef]);

  return scrollDirection;
};
