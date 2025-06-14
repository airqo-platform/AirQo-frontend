'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/common/components/Button';
import GroupLogo from '@/common/components/GroupLogo';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

/**
 * Content-less TopBar Component
 * Minimal topbar with just logo and basic navigation
 */
const ContentLessTopBar = () => {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();

  const isDarkMode =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const styles = {
    background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
    border: isDarkMode ? 'border-b-gray-700' : 'border-b-gray-200',
  };

  const handleLogoClick = () => {
    router.push('/user/Home');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[999]">
      <div
        className={`w-full ${styles.background} ${styles.border} border-b px-4 py-3`}
      >
        <div className="flex justify-between items-center">
          <Button
            paddingStyles="p-0 m-0"
            onClick={handleLogoClick}
            variant="text"
          >
            <GroupLogo />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentLessTopBar;
