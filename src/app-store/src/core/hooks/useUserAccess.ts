'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { users } from '@/core/apis/users';
import logger from '@/lib/logger';
import type { UserDetails } from '@/app/types/users';
import { PERMISSIONS } from '@/core/permissions/constants';

const ADMIN_ROLES = ['AIRQO_SUPER_ADMIN', 'AIRQO_SYSTEM_ADMIN'];
const ADMIN_PERMISSIONS = [PERMISSIONS.SYSTEM.SUPER_ADMIN, PERMISSIONS.SYSTEM.SYSTEM_ADMIN];

export function useUserAccess() {
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      if (!session?.user) return;
      const userId = (session.user as { id?: string }).id;
      if (!userId) return;

      setLoading(true);
      try {
        const response = await users.getUserDetails(userId);
        if (!isMounted) return;
        const detail = response?.users?.[0] ?? null;
        setUserDetails(detail);
      } catch (error) {
        if (!isMounted) return;
        logger.error('Failed to load user details', { error });
        setUserDetails(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [session?.user]);

  const email = useMemo(() => {
    if (!session?.user) return '';
    const user = session.user as { email?: string };
    return user.email || '';
  }, [session?.user]);

  const isAirqoEmail = useMemo(
    () => typeof email === 'string' && email.toLowerCase().endsWith('@airqo.net'),
    [email]
  );

  const isAdmin = useMemo(() => {
    if (!isAirqoEmail || !userDetails) return false;

    const groupRoles =
      userDetails.groups?.map(group => group.role?.role_name).filter(Boolean) ?? [];
    const networkRoles =
      userDetails.networks?.map(network => network.role?.role_name).filter(Boolean) ?? [];
    const allRoles = [...groupRoles, ...networkRoles] as string[];

    const groupPermissions =
      userDetails.groups
        ?.flatMap(group => group.role?.role_permissions ?? [])
        .map(permission => permission.permission)
        .filter(Boolean) ?? [];
    const networkPermissions =
      userDetails.networks
        ?.flatMap(network => network.role?.role_permissions ?? [])
        .map(permission => permission.permission)
        .filter(Boolean) ?? [];
    const allPermissions = [...groupPermissions, ...networkPermissions] as string[];

    return (
      allRoles.some(role => ADMIN_ROLES.includes(role)) ||
      allPermissions.some(permission => ADMIN_PERMISSIONS.includes(permission))
    );
  }, [userDetails, isAirqoEmail]);

  return { userDetails, isAdmin, loading };
}
