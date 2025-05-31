'use client';

import Tabs from '@/components/Tabs';
import Password from './Tabs/Password';
// Remove unused import since middleware handles auth
import Team from './Tabs/Team';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getAssignedGroupMembers } from '@/core/apis/Account';
import Profile from './Tabs/Profile';
import OrganizationProfile from './Tabs/OrganizationProfile';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setChartTab } from '@/lib/store/services/charts/ChartSlice';
import API from './Tabs/API';

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
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const { data: session } = useSession();

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
          checkAccess(
            'CREATE_UPDATE_AND_DELETE_NETWORK_USERS',
            userPermissions,
          ) && (
            <div label="Organisation">
              <OrganizationProfile />
            </div>
          )}
        {userGroup &&
          userPermissions &&
          checkAccess(
            'CREATE_UPDATE_AND_DELETE_NETWORK_USERS',
            userPermissions,
          ) && (
            <div label="Team">
              <Team users={teamMembers} loading={loading} />
            </div>
          )}
      </Tabs>
    </ErrorBoundary>
  );
};

export default Settings;
