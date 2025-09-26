'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { AqUser02, AqKey01, AqLock02 } from '@airqo/icons-react';
import { SettingsTabNavigation } from '@/common/components/Tabs';
import { getAssignedGroupMembers } from '@/core/apis/Account';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';
import { THEME_MODES } from '@/common/features/theme-customizer/constants/themeConstants';
import ErrorBoundary from '@/common/components/ErrorBoundary';

// Tab Components
import Profile from './tabs/Profile';
import Password from './tabs/Password';
import API from './tabs/API';

export const checkAccess = (requiredPermission, rolePermissions) => {
  const permissions =
    rolePermissions && rolePermissions.map((item) => item.permission);

  return permissions.includes(requiredPermission);
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userPermissions, setUserPermissions] = useState([]);

  const { theme, primaryColor, systemTheme } = useThemeSafe();
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  const { data: session } = useSession();
  const [permissionsLoading] = useState(false); // Simplified - no longer using complex permissions

  // Determine if we're in dark mode
  const isDarkMode =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemTheme === 'dark');

  // Define user settings tabs
  const getUserTabs = () => {
    const baseTabs = [
      {
        id: 'profile',
        name: 'My Profile',
        icon: AqUser02,
        description: 'Manage your personal information and preferences',
      },
      {
        id: 'password',
        name: 'Password',
        icon: AqLock02,
        description: 'Change your account password',
      },
      {
        id: 'api',
        name: 'API',
        icon: AqKey01,
        description: 'Manage API keys and access tokens',
      },
    ];

    return baseTabs;
  };

  useEffect(() => {
    if (!session?.user?.activeGroup) {
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

    getAssignedGroupMembers(activeGroupId).then((response) => {
      setTeamMembers(response.group_members);
    });
  }, [session, preferences]);

  // Function to render active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'password':
        return <Password />;
      case 'api':
        return <API userPermissions={userPermissions} />;
      default:
        return <Profile />;
    }
  };
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Account Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <SettingsTabNavigation
          tabs={getUserTabs()}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="min-h-96">{renderActiveTabContent()}</div>
      </div>
    </ErrorBoundary>
  );
};

export default Settings;
