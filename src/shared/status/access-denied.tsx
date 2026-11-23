'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AqShield01 } from '@airqo/icons-react';
import { ErrorBanner } from '../page/banner';
import { Button } from '../ui/button';

/*
 * In-page "Access Denied" banner with a Go Back button, for a section the user's
 * role can't see. Copied from nexus/src/shared/components/AccessDenied.tsx (used on
 * Nexus's system admin pages).
 *
 * Vertex shows the full-page 403 instead (./forbidden-page); Beacon has no
 * generic one.
 *
 * Change from Nexus's file: Nexus's Button (outlined, sm) is swapped for the
 * shared one (outline, sm), and Nexus's banner for the shared ../page/banner,
 * which has the same API.
 */
interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  className?: string;
}

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
    <Button onClick={handleBackClick} variant="outline" size="sm">
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
      />
    </div>
  );
};

export default AccessDenied;
