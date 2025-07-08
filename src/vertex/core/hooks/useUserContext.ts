import { useAppSelector } from "@/core/redux/hooks";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useMemo } from "react";

export interface SidebarConfig {
  title: string;
  showContextSwitcher: boolean;
  showNetworkMap: boolean;
  showSites: boolean;
  showUserManagement: boolean;
  showAccessControl: boolean;
  showOrganizations: boolean;
  showMyDevices: boolean;
  showDeviceOverview: boolean;
  showClaimDevice: boolean;
}

export interface UserContextState {
  // Core context data
  userContext: 'personal' | 'airqo-internal' | 'external-org' | null;
  isAirQoStaff: boolean;
  canSwitchContext: boolean;
  activeGroup: any;
  userDetails: any;
  
  // Loading states
  isLoading: boolean;
  isContextLoading: boolean;
  isPermissionsLoading: boolean;
  
  // Error states
  hasError: boolean;
  error: string | null;
  
  // Computed values
  isPersonalContext: boolean;
  isAirQoInternal: boolean;
  isExternalOrg: boolean;
  
  // Methods
  getSidebarConfig: () => SidebarConfig;
  getContextPermissions: () => any;
}

export const useUserContext = (): UserContextState => {
  const userContext = useAppSelector((state) => state.user.userContext);
  const isAirQoStaff = useAppSelector((state) => state.user.isAirQoStaff);
  const canSwitchContext = useAppSelector((state) => state.user.canSwitchContext);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const userDetails = useAppSelector((state) => state.user.userDetails);
  const isInitialized = useAppSelector((state) => state.user.isInitialized);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  // Permission checks with loading states
  const canViewDevices = usePermission(PERMISSIONS.DEVICE.VIEW);
  const canViewSites = usePermission(PERMISSIONS.SITE.VIEW);
  const canViewUserManagement = usePermission(PERMISSIONS.USER.VIEW);
  const canViewAccessControl = usePermission(PERMISSIONS.ROLE.VIEW);
  const canViewOrganizations = usePermission(PERMISSIONS.ORGANIZATION.VIEW);

  // Determine loading states
  const isLoading = useMemo(() => {
    // Loading if not initialized or not authenticated
    if (!isInitialized || !isAuthenticated) {
      return true;
    }
    
    // Loading if we don't have user details yet
    if (!userDetails) {
      return true;
    }
    
    // Loading if we don't have a context determined yet
    if (!userContext) {
      return true;
    }
    
    return false;
  }, [isInitialized, isAuthenticated, userDetails, userContext]);

  const isContextLoading = useMemo(() => {
    // Context is loading if we have user details but no context
    return !isLoading && userDetails && !userContext;
  }, [isLoading, userDetails, userContext]);

  const isPermissionsLoading = useMemo(() => {
    // Permissions are loading if we have context but permissions aren't ready
    return !isLoading && userContext && (!canViewDevices || !canViewSites);
  }, [isLoading, userContext, canViewDevices, canViewSites]);

  // Error state
  const hasError = useMemo(() => {
    // Error if initialized but not authenticated
    if (isInitialized && !isAuthenticated) {
      return true;
    }
    
    // Error if we have user details but can't determine context
    if (userDetails && !userContext && !isContextLoading) {
      return true;
    }
    
    return false;
  }, [isInitialized, isAuthenticated, userDetails, userContext, isContextLoading]);

  const error = useMemo(() => {
    if (isInitialized && !isAuthenticated) {
      return "Authentication required";
    }
    
    if (userDetails && !userContext && !isContextLoading) {
      return "Unable to determine user context";
    }
    
    return null;
  }, [isInitialized, isAuthenticated, userDetails, userContext, isContextLoading]);

  // Computed context values
  const isPersonalContext = userContext === 'personal';
  const isAirQoInternal = userContext === 'airqo-internal';
  const isExternalOrg = userContext === 'external-org';

  const getSidebarConfig = (): SidebarConfig => {
    // Return safe defaults if still loading
    if (isLoading || !userContext) {
      return {
        title: 'Loading...',
        showContextSwitcher: false,
        showNetworkMap: true,
        showSites: false,
        showUserManagement: false,
        showAccessControl: false,
        showOrganizations: false,
        showMyDevices: true,
        showDeviceOverview: false,
        showClaimDevice: true,
      };
    }

    switch (userContext) {
      case 'personal':
        return {
          title: 'My Monitors',
          showContextSwitcher: false,
          showNetworkMap: true,
          showSites: false,
          showUserManagement: false,
          showAccessControl: false,
          showOrganizations: false,
          showMyDevices: true,
          showDeviceOverview: false,
          showClaimDevice: true,
        };

      case 'airqo-internal':
        return {
          title: 'AirQo Organization',
          showContextSwitcher: canSwitchContext,
          showNetworkMap: true,
          showSites: canViewSites,
          showUserManagement: canViewUserManagement,
          showAccessControl: canViewAccessControl,
          showOrganizations: canViewOrganizations,
          showMyDevices: false,
          showDeviceOverview: canViewDevices,
          showClaimDevice: false,
        };

      case 'external-org':
        return {
          title: activeGroup?.grp_title || 'Organization',
          showContextSwitcher: false,
          showNetworkMap: false,
          showSites: canViewSites,
          showUserManagement: canViewUserManagement,
          showAccessControl: canViewAccessControl,
          showOrganizations: false, // External orgs don't see org management
          showMyDevices: false,
          showDeviceOverview: canViewDevices,
          showClaimDevice: false,
        };

      default:
        return {
          title: 'My Monitors',
          showContextSwitcher: false,
          showNetworkMap: true,
          showSites: false,
          showUserManagement: false,
          showAccessControl: false,
          showOrganizations: false,
          showMyDevices: true,
          showDeviceOverview: false,
          showClaimDevice: true,
        };
    }
  };

  const getContextPermissions = () => {
    if (userContext === 'personal') {
      return {
        canViewDevices: true, // But only claimed devices
        canViewSites: false,
        canViewUserManagement: false,
        canViewAccessControl: false,
        canViewOrganizations: false,
      };
    }

    return {
      canViewDevices,
      canViewSites,
      canViewUserManagement,
      canViewAccessControl,
      canViewOrganizations,
    };
  };

  return {
    // Core context data
    userContext,
    isAirQoStaff,
    canSwitchContext,
    activeGroup,
    userDetails,
    
    // Loading states
    isLoading,
    isContextLoading,
    isPermissionsLoading,
    
    // Error states
    hasError,
    error,
    
    // Computed values
    isPersonalContext,
    isAirQoInternal,
    isExternalOrg,
    
    // Methods
    getSidebarConfig,
    getContextPermissions,
  };
}; 