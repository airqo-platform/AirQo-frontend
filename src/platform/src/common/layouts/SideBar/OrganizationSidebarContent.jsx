import React from 'react';
import { useParams } from 'next/navigation';
import SideBarItem from '@/common/layouts/SideBar/SideBarItem';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import UsersIcon from '@/icons/SideBar/UsersIcon';
import PersonIcon from '@/icons/Settings/PersonIcon';
import PropTypes from 'prop-types';

const OrganizationSidebarContent = ({ isCollapsed }) => {
  const params = useParams();
  const orgSlug = params?.org_slug || '';
  return (
    <>
      <SideBarItem
        label="Dashboard"
        Icon={HomeIcon}
        navPath={`/org/${orgSlug}/dashboard`}
        iconOnly={isCollapsed}
      />
      <SideBarItem
        label="Data Insights"
        Icon={BarChartIcon}
        navPath={`/org/${orgSlug}/insights`}
        iconOnly={isCollapsed}
      />
      <SideBarItem
        label="Members"
        Icon={UsersIcon}
        navPath={`/org/${orgSlug}/members`}
        iconOnly={isCollapsed}
      />
      <SideBarItem
        label="My Profile"
        Icon={PersonIcon}
        navPath={`/org/${orgSlug}/profile`}
        iconOnly={isCollapsed}
      />
      <SideBarItem
        label="Settings"
        Icon={SettingsIcon}
        navPath={`/org/${orgSlug}/settings`}
        iconOnly={isCollapsed}
      />
    </>
  );
};

OrganizationSidebarContent.propTypes = {
  isCollapsed: PropTypes.bool,
};

OrganizationSidebarContent.defaultProps = {
  isCollapsed: false,
};

export default OrganizationSidebarContent;
