import Layout from '@/components/Layout';
import ContentBox from '@/components/Layout/content_box';
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tabs/Tab';
import TeamsTable from '@/components/Settings/Teams/table';
import Button from '@/components/Button';
import AddIcon from '@/icons/Actions/plus.svg';
import TeamInviteForm from '@/components/Settings/Teams/InviteForm';
import { useState } from 'react';
import Password from './Tabs/Password';

const Settings = () => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Layout topbarTitle={'Settings'} noBorderBottom>
      <Tabs>
        <Tab label='Password'>
          <Password />
        </Tab>
        <Tab label='Team'>
          <div data-testid='tab-content'>
            <ContentBox>
              <div className='flex justify-between items-center px-6 py-5'>
                <h3 className='text-secondary-neutral-light-800 font-medium text-lg'>
                  Team members
                </h3>
                <Button
                  onClick={() => setOpen(!open)}
                  className='flex justify-center items-center gap-2 rounded py-3 px-4 bg-blue-600 text-white text-sm font-medium'
                >
                  <AddIcon /> Invite member
                </Button>
              </div>
              <TeamsTable
                users={[
                  {
                    firstName: 'John',
                    lastName: 'Doe',
                    createdAt: '2022-01-01',
                    lastSeen: '2022-02-01',
                    role: {
                      role_name: 'Admin',
                    },
                    organisation: 'ABC Company',
                    email: 'johndoe@gmail.com',
                    status: 'Active',
                  },
                  {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    createdAt: '2022-03-01',
                    lastSeen: '2022-04-01',
                    role: {
                      role_name: 'User',
                    },
                    organisation: 'XYZ Corporation',
                    email: 'johndoe@gmail.com',
                    status: 'Active',
                  },
                  {
                    firstName: 'Mike',
                    lastName: 'Johnson',
                    createdAt: '2022-05-01',
                    lastSeen: '2022-06-01',
                    role: {
                      role_name: 'Can view',
                    },
                    organisation: 'ABC Company',
                    email: 'johndoe@gmail.com',
                    status: 'Pending',
                  },
                ]}
                isLoading={false}
              />
            </ContentBox>
          </div>
        </Tab>
      </Tabs>
      <TeamInviteForm open={open} closeModal={handleClose} />
    </Layout>
  );
};

export default Settings;
