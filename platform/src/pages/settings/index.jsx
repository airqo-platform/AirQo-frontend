import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import Password from './Tabs/Password';
import withAuth from '@/core/utils/protectedRoute';
import Team from './Tabs/Team';
import { useEffect, useState } from 'react';
import { getAssignedGroupMembers } from '@/core/apis/Account';
import Profile from './Tabs/Profile';
import OrganizationProfile from './Tabs/OrganizationProfile';

const Settings = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const activeGroupId = JSON.parse(localStorage.getItem('activeGroup'))._id;

    if (!activeGroupId) return setLoading(false);

    getAssignedGroupMembers(activeGroupId)
      .then((response) => {
        setTeamMembers(response.group_members);
        setLoading(false);
      })
      .catch((error) => {
        console.error(`Error fetching user details: ${error}`);
        setLoading(false);
      });
  }, []);

  return (
    <Layout topbarTitle={'Settings'} noBorderBottom>
      <Tabs>
        <Tab label='My profile'>
          <Profile />
        </Tab>
        <Tab label='Password'>
          <Password />
        </Tab>
        <Tab label='Organisation'>
          <OrganizationProfile />
        </Tab>
        <Tab label='Team'>
          <Team users={teamMembers} loading={loading} />
        </Tab>
      </Tabs>
    </Layout>
  );
};

export default withAuth(Settings);
