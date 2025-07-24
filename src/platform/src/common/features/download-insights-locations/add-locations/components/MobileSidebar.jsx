import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SidebarContent } from './SidebarContent';
import Close from '@/icons/close_icon';

export const MobileSidebar = ({ isVisible, close, ...sidebarContentProps }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="absolute inset-0 z-50 flex h-full overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-[240px] h-full bg-white dark:bg-[#1d1f20] overflow-x-hidden overflow-y-auto shadow-lg"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
        >
          <div className="p-2 flex justify-end">
            <button onClick={close} aria-label="Close sidebar menu">
              <Close />
            </button>
          </div>
          <div className="px-2">
            <SidebarContent {...sidebarContentProps} />
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
