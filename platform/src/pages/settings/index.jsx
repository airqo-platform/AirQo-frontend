import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import Password from './Tabs/Password';
import withAuth from '@/core/utils/protectedRoute';

const Settings = () => {
  return (
    <Layout topbarTitle={'Settings'} noBorderBottom>
      <Tabs>
        <Tab label='Password'>
          <Password />
        </Tab>
        <Tab label='Team'>
          <div data-testid='tab-content'>Two</div>
        </Tab>
      </Tabs>
    </Layout>
  );
};

export default withAuth(Settings);
