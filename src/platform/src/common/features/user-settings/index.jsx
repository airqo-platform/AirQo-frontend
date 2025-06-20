'use client';

import Tabs from '@/components/Tabs';
import Password from './tabs/Password';
// Remove unused import since middleware handles auth
import Team from './tabs/Team';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getAssignedGroupMembers } from '@/core/apis/Account';
import Profile from './tabs/Profile';
import OrganizationProfile from './tabs/OrganizationProfile';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setChartTab } from '@/lib/store/services/charts/ChartSlice';
import API from './tabs/API';
import { useSessionAwarePermissions } from '@/core/HOC';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';
import { THEME_MODES } from '@/common/features/theme-customizer/constants/themeConstants';

export const checkAccess = (requiredPermission, rolePermissions) => {
  const permissions =
    rolePermissions && rolePermissions.map((item) => item.permission);

  return permissions.includes(requiredPermission);
};

const Settings = () => {
  const dispatch = useDispatch();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userGroup, setUserGroup] = useState({});
  const { theme, primaryColor, systemTheme } = useThemeSafe();
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  const { data: session } = useSession();
  const { hasPermission, isLoading: permissionsLoading } =
    useSessionAwarePermissions();

  // Determine if we're in dark mode
  const isDarkMode =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemTheme === 'dark');

  useEffect(() => {
    setLoading(true);

    if (!session?.user?.activeGroup) {
      setLoading(false);
      return;
    }

    // Get active group from the session
    const activeGroup = session.user.activeGroup;

    // Set user group state
    setUserGroup(activeGroup);

    const activeGroupId = activeGroup?._id;
    const activeGroupPermissions = activeGroup?.role?.role_permissions || [];

    if (activeGroupPermissions.length > 0) {
      setUserPermissions(activeGroupPermissions);
    } else {
      setUserPermissions([]);
      dispatch(setChartTab(0));
    }

    getAssignedGroupMembers(activeGroupId)
      .then((response) => {
        setTeamMembers(response.group_members);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session, preferences, dispatch]);
  // Show loading state while checking permissions
  if (permissionsLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen space-y-4"
        style={{
          backgroundColor: isDarkMode ? '#1d1f20f0' : '#ffffff',
        }}
      >
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
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary name="Settings" feature="User Account Settings">
      <Tabs>
        <div label="My profile">
          <Profile />
        </div>
        <div label="Password">
          <Password />
        </div>
        <div label="API">
          <API userPermissions={userPermissions} />
        </div>
        {userPermissions &&
          hasPermission('CREATE_UPDATE_AND_DELETE_NETWORK_USERS') && (
            <div label="Organisation">
              <OrganizationProfile />
            </div>
          )}
        {userGroup &&
          userPermissions &&
          hasPermission('CREATE_UPDATE_AND_DELETE_NETWORK_USERS') && (
            <div label="Team">
              <Team users={teamMembers} loading={loading} />
            </div>
          )}
      </Tabs>
    </ErrorBoundary>
  );
};

export default Settings;
