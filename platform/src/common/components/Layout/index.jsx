import React, { useState, useEffect } from 'react';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '@/components/TopBar';

const Layout = ({ children, topbarTitle, noBorderBottom }) => {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const handleMediaQueryChange = (e) => {
      setToggleDrawer(false);
      setCollapsed(false);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return (
    <div className=' w-screen h-screen  overflow-x-hidden' data-testid='layout'>
      <div className=' lg:flex w-screen h-screen'>
        <div>
          <AuthenticatedSideBar
            toggleDrawer={toggleDrawer}
            setToggleDrawer={setToggleDrawer}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>
        <div className='w-full overflow-x-hidden'>
          <TopBar
            topbarTitle={topbarTitle}
            noBorderBottom={noBorderBottom}
            toggleDrawer={toggleDrawer}
            setToggleDrawer={setToggleDrawer}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
