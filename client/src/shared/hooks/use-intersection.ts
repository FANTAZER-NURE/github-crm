import { useEffect } from 'react';

import { useState } from 'react';

export function useIntersectionOnce(
  element: React.RefObject<HTMLElement | null>,
  rootMargin = '0px'
) {
  const [isVisible, setState] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(true);
          observer.unobserve(element.current!);
        }
      },
      { rootMargin }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    element.current && observer.observe(element.current);

    return () => {
      if (element.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(element.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isVisible;
}
