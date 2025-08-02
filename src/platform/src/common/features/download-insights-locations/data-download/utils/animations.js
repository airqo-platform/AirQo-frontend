/**
 * Animation variants for different components
 */

export const animations = {
  pageVariants: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  sidebarVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.07 },
    },
  },
  itemVariants: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
  modalVariants: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  },
  slideInVariants: {
    hidden: { x: -350 },
    visible: { x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { x: -350, transition: { duration: 0.2, ease: 'easeIn' } },
  },
  fadeInVariants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  },
};

// Spring configurations
export const springConfig = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

export const fastSpringConfig = {
  type: 'spring',
  damping: 30,
  stiffness: 400,
};
