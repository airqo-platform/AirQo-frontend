'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { toggleSidebar } from '@/shared/store/uiSlice';
import { Sidebar } from '@/shared/components/sidebar';

export const MobileSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      <motion.div
        className="fixed inset-0 z-[200] bg-black/50 md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => dispatch(toggleSidebar())}
      />

      {/* Mobile Sidebar */}
      <motion.aside
        className="fixed top-0 left-0 z-[210] h-full bg-background md:hidden"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        exit={{ x: -256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ width: 256 }}
      >
        <div className="h-full overflow-y-auto border-r">
          <Sidebar />
        </div>
      </motion.aside>
    </>
  );
};
