'use client';

import { useEffect } from 'react';

import { initPerformanceMonitoring } from '@/lib/performance-monitor';

export default function PerformanceMonitorClient() {
  useEffect(() => {
    void initPerformanceMonitoring();
    return () => {};
  }, []);

  return null;
}
