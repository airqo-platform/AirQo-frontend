'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import Loading from '@/components/loading';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

let hasCompletedInitialHydration = false;

const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(hasCompletedInitialHydration);

  useEffect(() => {
    if (hasCompletedInitialHydration) return;

    const frameId = window.requestAnimationFrame(() => {
      hasCompletedInitialHydration = true;
      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  if (!isHydrated) {
    return <Loading fullScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0.96 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransitionWrapper;
