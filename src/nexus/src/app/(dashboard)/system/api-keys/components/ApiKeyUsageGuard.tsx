'use client';

import React from 'react';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';

const ACCESS_DENIED_TITLE = 'Access Denied';
const ACCESS_DENIED_MESSAGE =
  'You do not have the required permissions to view API key usage.';

/** 403 view for users who may not read API key usage. */
export const ApiKeyUsageAccessDenied: React.FC = () => (
  <AccessDenied title={ACCESS_DENIED_TITLE} message={ACCESS_DENIED_MESSAGE} />
);

export interface ApiKeyUsageGuardProps {
  /** Set when a request came back 403, e.g. a permission revoked mid-session. */
  forbidden?: boolean;
  children: React.ReactNode;
}

/**
 * Access gate shared by the API key usage list and detail views.
 *
 * The API scopes these endpoints to `AUDIT_VIEW` holders and AirQo super admins
 * (403 for everyone else). The guard hides the screens from users who could
 * never load them; `forbidden` additionally covers the case where a permission
 * is revoked while the page is open and the next request 403s.
 */
const ApiKeyUsageGuard: React.FC<ApiKeyUsageGuardProps> = ({
  forbidden = false,
  children,
}) => {
  if (forbidden) {
    return <ApiKeyUsageAccessDenied />;
  }

  return (
    <PermissionGuard
      requiredPermissions={['AUDIT_VIEW', 'SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle={ACCESS_DENIED_TITLE}
      accessDeniedMessage={ACCESS_DENIED_MESSAGE}
    >
      {children}
    </PermissionGuard>
  );
};

export default ApiKeyUsageGuard;
