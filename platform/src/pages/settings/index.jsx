import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import Password from './Tabs/Password';

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

export default Settings;
