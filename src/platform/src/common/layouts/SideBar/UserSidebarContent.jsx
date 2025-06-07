import React, { useState } from 'react';
import SidebarItem, {
  SideBarDropdownItem,
} from '@/common/layouts/SideBar/SideBarItem';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import WorldIcon from '@/icons/SideBar/world_Icon';
import { checkAccess } from '@/core/HOC/withNextAuth';

const UserSidebarContent = ({ isCollapsed, styles }) => {
  const [collocationOpen, setCollocationOpen] = useState(false);

  const renderCollocationItem = () => {
    if (!checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES')) {
      return null;
    }

    return (
      <SidebarItem
        label="Collocation"
        Icon={CollocateIcon}
        dropdown
        toggleMethod={() => setCollocationOpen(!collocationOpen)}
        toggleState={collocationOpen}
        iconOnly={isCollapsed}
      >
        <SideBarDropdownItem
          itemLabel="Overview"
          itemPath="/user/collocation/overview"
        />
        <SideBarDropdownItem
          itemLabel="Collocate"
          itemPath="/user/collocation/collocate"
        />
      </SidebarItem>
    );
  };

  return (
    <>
      <SidebarItem
        label="Home"
        Icon={HomeIcon}
        navPath="/user/Home"
        iconOnly={isCollapsed}
      />
      <SidebarItem
        label="Analytics"
        Icon={BarChartIcon}
        navPath="/user/analytics"
        iconOnly={isCollapsed}
      />

      {/* Network Section */}
      {isCollapsed ? (
        <hr className={`my-3 border-t ${styles.divider}`} />
      ) : (
        <div
          className={`px-3 pt-5 pb-2 text-xs font-semibold ${styles.mutedText}`}
        >
          Network
        </div>
      )}

      {renderCollocationItem()}

      <SidebarItem
        label="Map"
        Icon={WorldIcon}
        navPath="/user/map"
        iconOnly={isCollapsed}
      />
      <SidebarItem
        label="Settings"
        Icon={SettingsIcon}
        navPath="/user/settings"
        iconOnly={isCollapsed}
      />
    </>
  );
};

export default UserSidebarContent;
