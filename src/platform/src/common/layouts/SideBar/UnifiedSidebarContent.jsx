'use client';

import React, { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import SideBarItem, { SideBarDropdownItem } from './SideBarItem';
import {
  getNavigationItems,
  getUserTypeFromPath,
  getOrgSlugFromPath,
  shouldForceIconOnly,
  getSidebarStyles,
} from './sidebarConfig';

/**
 * Unified sidebar content component that works for all user types
 * This replaces the separate AdminSidebarContent, OrganizationSidebarContent, and UserSidebarContent components
 */
const UnifiedSidebarContent = ({
  isCollapsed = false,
  userType,
  isDarkMode = false,
  customNavigationItems = null,
  onDropdownToggle = null,
}) => {
  const params = useParams();
  const pathname = usePathname();

  // State for dropdown toggles
  const [dropdownStates, setDropdownStates] = useState({});

  // Determine user type and options from current route if not provided
  const resolvedUserType = userType || getUserTypeFromPath(pathname);
  const orgSlug = params?.org_slug || getOrgSlugFromPath(pathname);

  // Get navigation items
  const navigationItems =
    customNavigationItems || getNavigationItems(resolvedUserType, { orgSlug });

  // Check if current route should force icons only
  const forceIconOnly = shouldForceIconOnly(pathname);
  const shouldShowIconsOnly = isCollapsed || forceIconOnly;

  // Get theme-based styles
  const styles = getSidebarStyles(isDarkMode);

  // Handle dropdown toggle
  const handleDropdownToggle = (index) => {
    setDropdownStates((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    // Call custom toggle handler if provided
    if (onDropdownToggle) {
      onDropdownToggle(index, !dropdownStates[index]);
    }
  };

  return (
    <>
      {navigationItems.map((item, index) => {
        // Render divider
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

        // Render dropdown item
        if (item.type === 'dropdown') {
          const isOpen = dropdownStates[index] || false;

          return (
            <SideBarItem
              key={index}
              label={item.label}
              Icon={item.icon}
              dropdown
              toggleMethod={() => handleDropdownToggle(index)}
              toggleState={isOpen}
              iconOnly={shouldShowIconsOnly}
            >
              {item.children?.map((child, childIndex) => (
                <SideBarDropdownItem
                  key={childIndex}
                  itemLabel={child.label}
                  itemPath={child.path}
                />
              ))}
            </SideBarItem>
          );
        }

        // Render regular item
        return (
          <SideBarItem
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

UnifiedSidebarContent.propTypes = {
  isCollapsed: PropTypes.bool,
  userType: PropTypes.oneOf(['user', 'admin', 'organization']),
  isDarkMode: PropTypes.bool,
  customNavigationItems: PropTypes.array,
  onDropdownToggle: PropTypes.func,
};

export default UnifiedSidebarContent;
