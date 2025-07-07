import { useAppSelector } from "@/core/redux/hooks";
import { UserContext } from "@/core/redux/slices/userSlice";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";

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

export const useUserContext = () => {
  const userContext = useAppSelector((state) => state.user.userContext);
  const isAirQoStaff = useAppSelector((state) => state.user.isAirQoStaff);
  const canSwitchContext = useAppSelector((state) => state.user.canSwitchContext);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const userDetails = useAppSelector((state) => state.user.userDetails);

  // Permission checks
  const canViewDevices = usePermission(PERMISSIONS.DEVICE.VIEW);
  const canViewSites = usePermission(PERMISSIONS.SITE.VIEW);
  const canViewUserManagement = usePermission(PERMISSIONS.USER.VIEW);
  const canViewAccessControl = usePermission(PERMISSIONS.ROLE.VIEW);
  const canViewOrganizations = usePermission(PERMISSIONS.ORGANIZATION.VIEW);

  const getSidebarConfig = (): SidebarConfig => {
    switch (userContext) {
      case 'personal':
        return {
          title: 'My Monitors',
          showContextSwitcher: false,
          showNetworkMap: false,
          showSites: false,
          showUserManagement: false,
          showAccessControl: false,
          showOrganizations: false,
          showMyDevices: true,
          showDeviceOverview: true,
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
          showMyDevices: true,
          showDeviceOverview: canViewDevices,
          showClaimDevice: true,
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
          showNetworkMap: false,
          showSites: false,
          showUserManagement: false,
          showAccessControl: false,
          showOrganizations: false,
          showMyDevices: true,
          showDeviceOverview: true,
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

  const isPersonalContext = userContext === 'personal';
  const isAirQoInternal = userContext === 'airqo-internal';
  const isExternalOrg = userContext === 'external-org';

  return {
    userContext,
    isAirQoStaff,
    canSwitchContext,
    activeGroup,
    userDetails,
    getSidebarConfig,
    getContextPermissions,
    isPersonalContext,
    isAirQoInternal,
    isExternalOrg,
  };
}; 