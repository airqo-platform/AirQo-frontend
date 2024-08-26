import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Password from './Tabs/Password';
import withAuth from '@/core/utils/protectedRoute';
import Team from './Tabs/Team';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { getAssignedGroupMembers } from '@/core/apis/Account';
import Profile from './Tabs/Profile';
import OrganizationProfile from './Tabs/OrganizationProfile';

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
  const userInfo = useSelector((state) => state.login.userInfo);

  useEffect(() => {
    setLoading(true);
    const storedActiveGroup = localStorage.getItem('activeGroup');
    if (!storedActiveGroup) return setLoading(false);

    setUserGroup(JSON.parse(storedActiveGroup));
    const activeGroupId =
      storedActiveGroup && JSON.parse(storedActiveGroup)._id;
    const storedUserPermissions =
      storedActiveGroup && JSON.parse(storedActiveGroup).role.role_permissions;

    if (storedUserPermissions && storedUserPermissions.length > 0) {
      setUserPermissions(storedUserPermissions);
    } else {
      setUserPermissions([]);
      dispatch(setChartTab(0));
    }

    try {
      getAssignedGroupMembers(activeGroupId)
        .then((response) => {
          setTeamMembers(response.group_members);
        })
        .catch((error) => {
          console.error(`Error fetching user details: ${error}`);
        });
    } catch (error) {
      console.error(`Error fetching user details: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [userInfo, preferences]);

  return (
    <Layout topbarTitle={'Settings'} noBorderBottom pageTitle="Settings">
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
    </Layout>
  );
};

export default withAuth(Settings);
