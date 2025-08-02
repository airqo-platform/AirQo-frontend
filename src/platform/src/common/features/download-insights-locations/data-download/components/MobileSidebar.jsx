import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { AqXClose } from '@airqo/icons-react';
import { animations } from '../utils/animations';

const MobileSidebar = ({ isVisible, onClose, children, className = '' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-50 flex h-full overflow-hidden"
          variants={animations.fadeInVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className={`w-[240px] h-full relative bg-white dark:bg-[#1d1f20] overflow-x-hidden overflow-y-auto shadow-lg ${className}`}
            variants={animations.slideInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-2 absolute z-50 top-0 right-0">
              <button
                onClick={onClose}
                aria-label="Close sidebar menu"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <AqXClose size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

MobileSidebar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default MobileSidebar;
