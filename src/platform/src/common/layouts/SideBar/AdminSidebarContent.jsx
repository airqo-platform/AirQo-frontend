'use client';

import React from 'react';
import SideBarItem from '@/common/layouts/SideBar/SideBarItem';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import UsersIcon from '@/icons/SideBar/UsersIcon';
import {
  MdBusiness,
  MdSecurity,
  MdDescription,
  MdDashboard,
} from 'react-icons/md';
import PropTypes from 'prop-types';

/**
 * AdminSidebarContent component
 * Provides navigation items specifically for admin routes
 */
const AdminSidebarContent = ({ isCollapsed, styles }) => {
  return (
    <>
      {/* Main Admin Navigation */}
      <SideBarItem
        label="Dashboard"
        Icon={MdDashboard}
        navPath="/admin"
        iconOnly={isCollapsed}
      />
      {/* Organizations Section */}
      {isCollapsed ? (
        <hr
          className={`my-3 border-t ${styles?.divider || 'border-gray-200'}`}
        />
      ) : (
        <div
          className={`px-3 pt-5 pb-2 text-xs font-semibold ${
            styles?.mutedText || 'text-gray-500'
          }`}
        >
          Management
        </div>
      )}
      <SideBarItem
        label="Organizations"
        Icon={MdBusiness}
        navPath="/admin/organizations"
        iconOnly={isCollapsed}
      />
      <SideBarItem
        label="Users"
        Icon={UsersIcon}
        navPath="/admin/users"
        iconOnly={isCollapsed}
      />

      {/* Analytics & Monitoring Section */}
      {isCollapsed ? (
        <hr
          className={`my-3 border-t ${styles?.divider || 'border-gray-200'}`}
        />
      ) : (
        <div
          className={`px-3 pt-5 pb-2 text-xs font-semibold ${
            styles?.mutedText || 'text-gray-500'
          }`}
        >
          Analytics
        </div>
      )}
      <SideBarItem
        label="Analytics"
        Icon={BarChartIcon}
        navPath="/admin/analytics"
        iconOnly={isCollapsed}
      />
      <SideBarItem
        label="System Logs"
        Icon={MdDescription}
        navPath="/admin/logs"
        iconOnly={isCollapsed}
      />
      {/* System Section */}
      {isCollapsed ? (
        <hr
          className={`my-3 border-t ${styles?.divider || 'border-gray-200'}`}
        />
      ) : (
        <div
          className={`px-3 pt-5 pb-2 text-xs font-semibold ${
            styles?.mutedText || 'text-gray-500'
          }`}
        >
          System
        </div>
      )}
      <SideBarItem
        label="Roles & Permissions"
        Icon={MdSecurity}
        navPath="/admin/roles"
        iconOnly={isCollapsed}
      />
      <SideBarItem
        label="Settings"
        Icon={SettingsIcon}
        navPath="/admin/settings"
        iconOnly={isCollapsed}
      />
    </>
  );
};

AdminSidebarContent.propTypes = {
  isCollapsed: PropTypes.bool,
  styles: PropTypes.object,
};

AdminSidebarContent.defaultProps = {
  isCollapsed: false,
  styles: {},
};

export default AdminSidebarContent;
