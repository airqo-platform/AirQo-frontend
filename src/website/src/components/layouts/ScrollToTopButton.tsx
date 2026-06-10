'use client';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FaArrowUpLong } from 'react-icons/fa6';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user reaches near the bottom of the page
  useEffect(() => {
    const toggleVisibility = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const footer = document.getElementById('WebsiteFooter');

      // Only proceed if footer exists
      if (footer) {
        const footerPosition =
          footer.getBoundingClientRect().top + window.scrollY;

        // Check if the user has reached the bottom or near the footer
        if (scrollPosition >= footerPosition - 100) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed right-8 top-8 lg:bottom-auto lg:-top-[30px] md:right-0 xl:-right-28 h-12 bg-blue-700 text-white p-2 shadow-md"
          style={{ position: 'absolute' }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaArrowUpLong className="w-6 h-6 relative top-2" />
          </motion.div>
        </motion.button>
      )}
    </>
  );
};

export default ScrollToTopButton;
