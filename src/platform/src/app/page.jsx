'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';
import { THEME_MODES } from '@/common/features/theme-customizer/constants/themeConstants';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { theme, primaryColor, systemTheme } = useThemeSafe();

  // Determine if we're in dark mode
  const isDarkMode =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemTheme === 'dark');

  useEffect(() => {
    const handleRootRedirect = async () => {
      if (status === 'loading' || isRedirecting) {
        return;
      }

      try {
        setIsRedirecting(true);

        if (status === 'authenticated' && session?.user) {
          // Only redirect to /user/Home if user is accessing the root "/" path directly
          // This prevents interference with protected route navigation
          if (
            typeof window !== 'undefined' &&
            window.location.pathname === '/'
          ) {
            router.replace('/user/Home');
          }
        } else {
          // Not authenticated - redirect to user login
          router.replace('/user/login');
        }
      } catch {
        router.replace('/user/login');
      }
    };

    // Add a small delay to avoid immediate redirect conflicts
    const timeoutId = setTimeout(handleRootRedirect, 100);
    return () => clearTimeout(timeoutId);
  }, [session, status, router, isRedirecting]);
  return (
    <div
      className={`w-full h-screen flex flex-grow justify-center items-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="SecondaryMainloader"
          aria-label="Loading"
          style={{
            '--color-primary': primaryColor,
          }}
        ></div>
        <p
          className={`text-sm animate-pulse transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Loading...
        </p>
      </div>
    </div>
  );
};

export default HomePage;
