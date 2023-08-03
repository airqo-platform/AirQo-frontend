import React from 'react';
import TopBar from '@/components/TopBar';
import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';

const AuthenticatedLayout = ({children}) => {
  return (
    <div className=' w-screen h-screen  overflow-x-hidden'>
      <div className=' lg:flex w-screen h-screen'>
        <div>
          <AuthenticatedSideBar />
        </div>
        <div className='w-full overflow-x-hidden'>
          <TopBar />
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthenticatedLayout