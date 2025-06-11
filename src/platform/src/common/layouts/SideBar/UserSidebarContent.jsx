import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import SidebarItem, {
  SideBarDropdownItem,
} from '@/common/layouts/SideBar/SideBarItem';
import {
  getUserNavigationItems,
  shouldForceIconOnly,
} from './navigationConfig';

const UserSidebarContent = ({ isCollapsed, styles }) => {
  const [collocationOpen, setCollocationOpen] = useState(false);
  const pathname = usePathname();
  const navigationItems = getUserNavigationItems();

  // Check if current route should force icons only (like map route)
  const forceIconOnly = shouldForceIconOnly(pathname);
  const shouldShowIconsOnly = isCollapsed || forceIconOnly;

  return (
    <>
      {navigationItems.map((item, index) => {
        if (item.type === 'divider') {
          return shouldShowIconsOnly ? (
            <hr key={index} className={`my-3 border-t ${styles.divider}`} />
          ) : (
            <div
              key={index}
              className={`px-3 pt-5 pb-2 text-xs font-semibold ${styles.mutedText}`}
            >
              {item.label}
            </div>
          );
        }

        if (item.type === 'dropdown') {
          return (
            <SidebarItem
              key={index}
              label={item.label}
              Icon={item.icon}
              dropdown
              toggleMethod={() => setCollocationOpen(!collocationOpen)}
              toggleState={collocationOpen}
              iconOnly={shouldShowIconsOnly}
            >
              {item.children?.map((child, childIndex) => (
                <SideBarDropdownItem
                  key={childIndex}
                  itemLabel={child.label}
                  itemPath={child.path}
                />
              ))}
            </SidebarItem>
          );
        }

        return (
          <SidebarItem
            key={index}
            label={item.label}
            Icon={item.icon}
            navPath={item.path}
            iconOnly={shouldShowIconsOnly}
          />
        );
      })}
    </>
  );
};

export default UserSidebarContent;
