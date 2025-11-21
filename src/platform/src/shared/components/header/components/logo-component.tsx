'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useUserActions } from '@/shared/hooks';

interface LogoComponentProps {
  className?: string;
}

export const LogoComponent: React.FC<LogoComponentProps> = ({ className }) => {
  const { activeGroup } = useUserActions();
  const [imageError, setImageError] = React.useState(false);

  // Determine navigation target and logo based on active group
  const { href, logoSrc, logoAlt, showFallback } = React.useMemo(() => {
    if (!activeGroup) {
      return {
        href: '/user/home',
        logoSrc: '/images/airqo_logo.svg',
        logoAlt: 'AirQo Logo',
        showFallback: false,
      };
    }

    // AIRQO group detection: check multiple conditions for robustness
    const isAirQoGroup =
      // Check if title matches AIRQO (case insensitive)
      activeGroup.title?.toLowerCase() === 'airqo' ||
      // Check if organization slug is airqo
      activeGroup.organizationSlug?.toLowerCase() === 'airqo' ||
      // Check if no organization slug (default user flow)
      !activeGroup.organizationSlug ||
      // Fallback: check if title contains airqo
      activeGroup.title?.toLowerCase().includes('airqo');

    if (isAirQoGroup) {
      return {
        href: '/user/home',
        logoSrc: '/images/airqo_logo.svg',
        logoAlt: 'AirQo Logo',
        showFallback: false,
      };
    } else {
      const hasValidProfilePicture =
        activeGroup.profilePicture && activeGroup.profilePicture.trim() !== '';
      return {
        href: `/org/${activeGroup.organizationSlug}/dashboard`,
        logoSrc: hasValidProfilePicture
          ? activeGroup.profilePicture
          : '/images/airqo_logo.svg',
        logoAlt: `${activeGroup.title} Logo`,
        showFallback: !hasValidProfilePicture,
      };
    }
  }, [activeGroup]);

  const handleImageError = () => {
    setImageError(true);
  };

  const shouldShowFallback = showFallback || imageError;

  return (
    <Link href={href} className={cn('flex items-center space-x-2', className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {shouldShowFallback ? (
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
            {activeGroup?.title?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        ) : (
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={120}
            height={32}
            className="w-auto h-6"
            priority
            onError={handleImageError}
          />
        )}
      </motion.div>
    </Link>
  );
};
