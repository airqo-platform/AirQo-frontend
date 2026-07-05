import { useAppSelector } from "@/core/redux/hooks";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useMemo } from "react";
import type { Group, UserDetails } from "@/app/types/users";

export interface SidebarConfig {
  title: string;
  showNetworkMap: boolean;
  showSites: boolean;
  showCohorts: boolean;
  showUserManagement: boolean;
  showAccessControl: boolean;
  showMyDevices: boolean;
  showDeviceOverview: boolean;
  showClaimDevice: boolean;
  showDeployDevice: boolean;
  showNetworks: boolean;
}

export interface UserContextState {
  // Core context data
  userContext: 'personal' | 'external-org' | null;
  userScope: 'personal' | 'organisation' | null;
  canSwitchContext: boolean;
  activeGroup: Group | null;
  userDetails: UserDetails | null;
  
  // Loading states
  isLoading: boolean;
  isPermissionsLoading: boolean;
  
  // Error states
  hasError: boolean;
  error: string | null;
  
  // Computed values
  isPersonalContext: boolean;

  isExternalOrg: boolean;
  isPersonalScope: boolean;
  isOrganisationScope: boolean;
  
  // Methods
  getSidebarConfig: () => SidebarConfig;
  getContextPermissions: () => Record<string, boolean | undefined>;
}

export const useUserContext = (): UserContextState => {
  const userContext = useAppSelector((state) => state.user.userContext);
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
  const canViewNetworks = usePermission(PERMISSIONS.NETWORK.VIEW);

  // Determine loading states
  const isLoading = useMemo(() => {
    if (!isInitialized || !isAuthenticated) {
      return true;
    }
    
    if (!userDetails) {
      return true;
    }
    
    if (!userContext) {
      return true;
    }
    
    return false;
  }, [isInitialized, isAuthenticated, userDetails, userContext]);

  const isPermissionsLoading = useMemo(() => {
    return !isLoading && userContext && (canViewDevices === null || canViewSites === null);
  }, [isLoading, userContext, canViewDevices, canViewSites]);

  // Error state
  const hasError = useMemo(() => {
    if (isInitialized && !isAuthenticated) {
      return true;
    }
    
    if (userDetails && !userContext) {
      return true;
    }
    
    return false;
  }, [isInitialized, isAuthenticated, userDetails, userContext]);

  const error = useMemo(() => {
    if (isInitialized && !isAuthenticated) {
      return "Authentication required";
    }
    
    if (userDetails && !userContext) {
      return "Unable to determine user context";
    }
    
    return null;
  }, [isInitialized, isAuthenticated, userDetails, userContext]);

  // Computed context values
  const isPersonalContext = userContext === 'personal';
  const isExternalOrg = userContext === 'external-org';

  // Determine user scope based on permissions
  // External orgs ALWAYS use organisation scope
  // Only the system group uses permission-based personal vs organisation scope
  const userScope = useMemo(() => {
    // External organisations ALWAYS use organisation scope
    if (userContext === 'external-org') {
      return 'organisation';
    }
    
    // System-group internal context and Personal context use personal scope
    // We treat 'personal' context as personal scope regardless of permissions for now
    // Permissions just toggle sidebar visibility
    return 'personal';
  }, [userContext]);

  const isPersonalScope = userScope === 'personal';
  const isOrganisationScope = userScope === 'organisation';

  const getSidebarConfig = (): SidebarConfig => {
    if (isLoading || !userContext) {
      return {
        title: 'Loading...',
        showNetworkMap: false,
        showSites: false,
        showCohorts: false,
        showUserManagement: false,
        showAccessControl: false,
        showMyDevices: true,
        showDeviceOverview: false,
        showClaimDevice: true,
        showDeployDevice: true,
        showNetworks: false,
      };
    }

    switch (userContext) {
      case 'personal':
        return {
          title: 'My Monitors',
          showNetworkMap: false,
          showSites: canViewSites, // Permission based
          showCohorts: canViewDevices,
          showUserManagement: canViewUserManagement,
          showAccessControl: canViewAccessControl,
          showMyDevices: true,
          showDeviceOverview: canViewDevices,
          showClaimDevice: true,
          showDeployDevice: true,
          showNetworks: canViewNetworks,
        };

      case 'external-org':
        return {
          title: activeGroup?.grp_title || 'Organization',
          showNetworkMap: false,
          showSites: canViewSites,
          showCohorts: false,
          showUserManagement: canViewUserManagement,
          showAccessControl: canViewAccessControl,
          // External orgs always use organisation scope, so no My Devices
          showMyDevices: false,
          showDeviceOverview: canViewDevices,
          showClaimDevice: true,
          showDeployDevice: true,
          showNetworks: false,
        };

      default:
        return {
          title: 'My Monitors',
          showNetworkMap: true,
          showSites: false,
          showCohorts: false,
          showUserManagement: false,
          showAccessControl: false,
          showMyDevices: true,
          showDeviceOverview: false,
          showClaimDevice: true,
          showDeployDevice: true,
          showNetworks: false,
        };
    }
  };

  const getContextPermissions = () => {
    if (isLoading) {
      return {
        canViewDevices: false,
        canViewSites: false,
        canViewUserManagement: false,
        canViewAccessControl: false,
        canViewOrganizations: false,
        canViewNetworks: false,
      };
    }

    if (userContext === 'personal') {
      return {
        // Return full permissions object for personal context
        // This allows RBAC to control visibility of specific features
        canViewDevices: true, // Always true for personal context (implicit ownership)
        canViewSites: canViewSites || false,
        canViewUserManagement: canViewUserManagement || false,
        canViewAccessControl: canViewAccessControl || false,
        canViewOrganizations: false,
        canViewNetworks: canViewNetworks || false,
      };
    }

    return {
      canViewDevices,
      canViewSites,
      canViewUserManagement,
      canViewAccessControl,
      canViewNetworks,
    };
  };

  return {
    // Core context data
    userContext,
    userScope,
    canSwitchContext,
    activeGroup,
    userDetails,
    
    // Loading states
    isLoading,
    isPermissionsLoading: isPermissionsLoading || false,
    
    // Error states
    hasError,
    error,
    
    // Computed values
    isPersonalContext,
    
    isExternalOrg,
    isPersonalScope,
    isOrganisationScope,
    
    // Methods
    getSidebarConfig,
    getContextPermissions,
  };
};