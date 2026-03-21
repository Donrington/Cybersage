'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true when the viewport is below the lg breakpoint (< 1024px).
 * Used to gate expensive desktop-only effects (parallax, magnetic cursors,
 * velocity-driven filters) so they never run on mobile devices.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsMobile(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}
