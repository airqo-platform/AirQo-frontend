// src/components/Layout.jsx

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Head from 'next/head';

import AuthenticatedSideBar from '@/components/SideBar/AuthenticatedSidebar';
import TopBar from '../TopBar';
import SideBarDrawer from '../SideBar/SideBarDrawer';
import Modal from '../Modal/dataDownload';

import { setOpenModal } from '@/lib/store/services/downloadModal';

import useUserPreferences from '@/core/hooks/useUserPreferences';
import useUserChecklists from '@/core/hooks/useUserChecklists';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';

const Layout = ({
  pageTitle = 'AirQo Analytics',
  children,
  topbarTitle,
  noBorderBottom,
  noTopNav = true,
  showSearch,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Custom Hooks
  useUserPreferences();
  useUserChecklists();
  const userInfo = useSelector((state) => state.login.userInfo);
  useInactivityLogout(userInfo?._id);

  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const isOpen = useSelector((state) => state.modal.openModal);

  // Handler to close the modal
  const handleCloseModal = () => {
    dispatch(setOpenModal(false));
  };

  return (
    <div className="flex min-h-screen bg-[#f6f6f7]" data-testid="layout">
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 text-[#1C1D20] transition-all duration-300 ease-in-out">
        <AuthenticatedSideBar />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          router.pathname === '/map' ? 'overflow-hidden' : 'overflow-y-auto'
        } ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div
          className={`${
            router.pathname === '/map'
              ? ''
              : 'max-w-[1200px] mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8'
          } overflow-hidden`}
        >
          {/* TopBar */}
          {noTopNav && (
            <TopBar
              topbarTitle={topbarTitle}
              noBorderBottom={noBorderBottom}
              showSearch={showSearch}
            />
          )}

          {/* Children */}
          <div className="text-[#1C1D20] transition-all duration-300 ease-in-out overflow-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* SideBar Drawer */}
      <SideBarDrawer />

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default React.memo(Layout);
