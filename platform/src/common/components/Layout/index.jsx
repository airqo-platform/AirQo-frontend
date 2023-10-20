import React, { useState } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '@/components/TopBar';

const Layout = ({ children, topbarTitle, noBorderBottom }) => {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  return (
    <div className=' w-screen h-screen  overflow-x-hidden' data-testid='layout'>
      <div className=' lg:flex w-screen h-screen'>
        <div>
          <AuthenticatedSideBar toggleDrawer={toggleDrawer} setToggleDrawer={setToggleDrawer} />
        </div>
        <div className='w-full overflow-x-hidden'>
          <TopBar
            topbarTitle={topbarTitle}
            noBorderBottom={noBorderBottom}
            toggleDrawer={toggleDrawer}
            setToggleDrawer={setToggleDrawer}
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
