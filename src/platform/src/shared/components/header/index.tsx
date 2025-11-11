'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  ProfileDropdown,
  AppDropdown,
  OrganizationSelector,
  LogoComponent,
} from './components';
import { useScrollVisibility, usePageTitle } from './hooks';
import { HeaderProps } from './types';
import { useMediaQuery } from 'react-responsive';
import { toggleGlobalSidebar } from '@/shared/store/uiSlice';
import { AqMenu03 } from '@airqo/icons-react';

export const Header: React.FC<HeaderProps> = ({
  className,
  hideOnScroll = false,
}) => {
  const dispatch = useDispatch();
  const isVisible = useScrollVisibility(hideOnScroll);
  const pageTitle = usePageTitle();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <motion.header
      className={cn('sticky top-0 z-50 w-full', className)}
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <Card className="w-full p-0">
        <div className="flex items-center justify-between w-full h-12 px-4">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mr-2"
            onClick={() => dispatch(toggleGlobalSidebar())}
          >
            <AqMenu03 />
          </Button>
          {/* Logo */}
          <LogoComponent />

          {/* Page Title */}
          <div className="flex-1 ml-4">
            <h1 className="text-xl text-foreground truncate">{pageTitle}</h1>
          </div>

          {/* App Dropdown and Profile Dropdown */}
          <div className="flex items-center space-x-2">
            {!isMobile && <OrganizationSelector />}
            <AppDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </Card>
    </motion.header>
  );
};
