'use client';
import { motion, useInView, Variants } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface OptimizedMotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

/**
 * Optimized motion component with performance enhancements:
 * - Reduced animation distance and duration
 * - Hardware acceleration via transform
 * - Intersection observer for viewport detection
 * - Will-change CSS optimization
 */
export const OptimizedMotion = ({
  children,
  className = '',
  delay = 0,
  duration = 0.3,
  y = 20,
}: OptimizedMotionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '0px 0px -50px 0px',
    amount: 0.1,
  });

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for smoother animation
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
      style={{ willChange: isInView ? 'transform, opacity' : 'auto' }}
    >
      {children}
    </motion.div>
  );
};

export default OptimizedMotion;
