'use client';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FaArrowUpLong } from 'react-icons/fa6';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Show the button once the user has scrolled past a short threshold
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Honor the OS-level reduced motion preference for the infinite bounce
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-4 right-4 z-[9999] inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand text-white shadow-md focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
        >
          <motion.div
            animate={prefersReducedMotion ? { y: 0 } : { y: [0, -6, 0] }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <FaArrowUpLong className="h-5 w-5" aria-hidden="true" />
          </motion.div>
        </motion.button>
      )}
    </>
  );
};

export default ScrollToTopButton;
