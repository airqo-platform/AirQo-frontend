// Main unified components
export { default as UnifiedSidebarContent } from './UnifiedSidebarContent';
export { default as UnifiedSideBarDrawer } from './UnifiedSideBarDrawer';
export { default as AuthenticatedSideBar } from './AuthenticatedSidebar';

// Configuration and utilities
export * from './sidebarConfig';

// Legacy components (for backward compatibility)
export { default as SideBarItem } from './SideBarItem';
export { SideBarDropdownItem } from './SideBarItem';
export { default as AnnouncementCard } from './AnnouncementCard';

// Legacy navigation config (for backward compatibility)
// Note: Import specific functions to avoid conflicts with sidebarConfig
export {
  getUserNavigationItems as legacyGetUserNavigationItems,
  getMobileNavigationItems as legacyGetMobileNavigationItems,
  shouldForceIconOnly as legacyShouldForceIconOnly,
} from './navigationConfig';
