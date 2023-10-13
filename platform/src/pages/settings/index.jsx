import Layout from '@/components/Layout';
import ContentBox from '@/components/Layout/content_box';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';

const Settings = () => {
  return (
    <Layout topbarTitle={'Settings'} noBorderBottom>
      <Tabs>
        <Tab label='Password'>
          <div>One</div>
        </Tab>
        <Tab label='Team'>
          <div>One</div>
        </Tab>
      </Tabs>
    </Layout>
  );
};

export default Settings;
