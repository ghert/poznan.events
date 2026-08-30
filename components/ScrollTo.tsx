'use client';
import { useEffect } from 'react';

export default function ScrollTo({ trigger }: { trigger: string | number }) {
  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [trigger]);

  return null;
}
