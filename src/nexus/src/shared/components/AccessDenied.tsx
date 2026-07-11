'use client';

import React from 'react';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { Button } from '@/shared/components/ui/button';
import { AqShield01 } from '@airqo/icons-react';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  className?: string;
}

/**
 * Access Denied component for showing permission errors
 * Uses the ErrorBanner component for consistent styling
 */
export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Access Denied',
  message = 'You do not have the required permissions to view this page.',
  showBackButton = true,
  backButtonText = 'Go Back',
  onBackClick,
  className = '',
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const actions = showBackButton ? (
    <Button onClick={handleBackClick} variant="outlined" size="sm">
      {backButtonText}
    </Button>
  ) : undefined;

  return (
    <div className={`p-4 ${className}`}>
      <ErrorBanner
        title={title}
        message={message}
        icon={<AqShield01 className="w-5 h-5" />}
        actions={actions}
        // className="max-w-2xl mx-auto"
      />
    </div>
  );
};
