import React from 'react';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';

const AuthenticatedHomePage = () => {
  return (
    <Layout topbarTitle={'Analytics'} noBorderBottom>
      <Tabs>
        <Tab label='Overview'>{/* content goes here */}</Tab>
        <Tab label='Explore'>{/* content goes here */}</Tab>
      </Tabs>
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
