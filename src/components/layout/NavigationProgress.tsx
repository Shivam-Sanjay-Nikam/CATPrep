'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const NavigationProgress: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When pathname or searchParams change, it means navigation completed
    // Small timeout to avoid synchronous setState warning
    const startTimer = setTimeout(() => {
      setLoading(true);
      setProgress(30);
    }, 0);

    const finishTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400);
    }, 200);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '3px',
      background: 'linear-gradient(to right, var(--primary), var(--primary-container))',
      zIndex: 99999,
      width: `${progress}%`,
      transition: 'width 0.4s ease, opacity 0.4s ease',
      opacity: progress === 100 ? 0 : 1,
      boxShadow: '0 0 10px var(--primary)',
    }} />
  );
};
