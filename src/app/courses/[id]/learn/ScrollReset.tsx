'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const ScrollReset: React.FC = () => {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lesson');

  useEffect(() => {
    // We target the main scrolling container of the Learner Portal
    const mainContent = document.querySelector('section[class*="mainContent"]');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [lessonId]);

  return null;
};
