import { motion } from 'framer-motion';

import Logo from '@/icons/airqo_logo.svg';

const OverlayLoading = ({ showOverlay }) => {
  if (!showOverlay) return null;

  return (
    <>
      <div className="bg-white opacity-30 z-0 w-full h-full flex justify-center items-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Logo />
        </motion.div>
      </div>
    </>
  );
};

export default OverlayLoading;
