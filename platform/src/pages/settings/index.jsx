import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import Password from './Tabs/Password';
import withAuth from '@/core/utils/protectedRoute';
import Team from './Tabs/Team';
import { useEffect } from 'react';
import { getUserDetails } from '@/core/apis/Account';
import { isEmpty } from 'underscore';

const Settings = () => {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    if (!isEmpty(user)) {
      getUserDetails(user._id)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(`Error fetching user details: ${error}`);
        });
    }
  }, []);

  return (
    <Layout topbarTitle={'Settings'} noBorderBottom>
      <Tabs>
        <Tab label='Password'>
          <Password />
        </Tab>
        <Tab label='Team'>
          <Team />
        </Tab>
      </Tabs>
    </Layout>
  );
};

export default withAuth(Settings);
