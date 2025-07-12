// Permission constants for AirQo RBAC system
export const PERMISSIONS = {
  // System-level permissions
  SYSTEM: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    DATABASE_ADMIN: 'DATABASE_ADMIN',
  },
  
  // Organization management
  ORGANIZATION: {
    CREATE: 'ORG_CREATE',
    VIEW: 'ORG_VIEW',
    UPDATE: 'ORG_UPDATE',
    DELETE: 'ORG_DELETE',
    APPROVE: 'ORG_APPROVE',
    REJECT: 'ORG_REJECT',
  },
  
  // Group management
  GROUP: {
    VIEW: 'GROUP_VIEW',
    CREATE: 'GROUP_CREATE',
    EDIT: 'GROUP_EDIT',
    DELETE: 'GROUP_DELETE',
    MANAGEMENT: 'GROUP_MANAGEMENT',
  },
  
  // User management
  USER: {
    VIEW: 'USER_VIEW',
    CREATE: 'USER_CREATE',
    EDIT: 'USER_EDIT',
    DELETE: 'USER_DELETE',
    MANAGEMENT: 'USER_MANAGEMENT',
    INVITE: 'USER_INVITE',
  },
  
  // Member management
  MEMBER: {
    VIEW: 'MEMBER_VIEW',
    INVITE: 'MEMBER_INVITE',
    REMOVE: 'MEMBER_REMOVE',
    SEARCH: 'MEMBER_SEARCH',
    EXPORT: 'MEMBER_EXPORT',
  },
  
  // Role & permission management
  ROLE: {
    VIEW: 'ROLE_VIEW',
    CREATE: 'ROLE_CREATE',
    EDIT: 'ROLE_EDIT',
    DELETE: 'ROLE_DELETE',
    ASSIGNMENT: 'ROLE_ASSIGNMENT',
  },
  
  // Device permissions
  DEVICE: {
    VIEW: 'DEVICE_VIEW',
    DEPLOY: 'DEVICE_DEPLOY',
    RECALL: 'DEVICE_RECALL',
    MAINTAIN: 'DEVICE_MAINTAIN',
    UPDATE: 'DEVICE_UPDATE',
    DELETE: 'DEVICE_DELETE',
  },
  
  // Site permissions
  SITE: {
    VIEW: 'SITE_VIEW',
    CREATE: 'SITE_CREATE',
    UPDATE: 'SITE_UPDATE',
    DELETE: 'SITE_DELETE',
  },
  
  // Analytics & data permissions
  ANALYTICS: {
    DASHBOARD_VIEW: 'DASHBOARD_VIEW',
    ANALYTICS_VIEW: 'ANALYTICS_VIEW',
    ANALYTICS_EXPORT: 'ANALYTICS_EXPORT',
    DATA_VIEW: 'DATA_VIEW',
    DATA_EXPORT: 'DATA_EXPORT',
    DATA_COMPARE: 'DATA_COMPARE',
  },
  
  // Settings & configuration
  SETTINGS: {
    VIEW: 'SETTINGS_VIEW',
    EDIT: 'SETTINGS_EDIT',
    GROUP_SETTINGS: 'GROUP_SETTINGS',
  },
} as const;

// Role definitions with inheritance and capabilities
export const ROLES = {
  AIRQO_SUPER_ADMIN: {
    name: 'AIRQO_SUPER_ADMIN',
    displayName: 'AirQo Super Administrator',
    permissions: Object.values(PERMISSIONS).flat(),
    canOverrideOrganization: true,
    systemWide: true,
    canManageAllOrganizations: true,
    description: 'Complete system access with ability to manage all organizations and override any restrictions',
  },
  
  AIRQO_ADMIN: {
    name: 'AIRQO_ADMIN',
    displayName: 'AirQo Administrator',
    permissions: [
      ...Object.values(PERMISSIONS.ORGANIZATION),
      ...Object.values(PERMISSIONS.GROUP),
      ...Object.values(PERMISSIONS.USER),
      ...Object.values(PERMISSIONS.MEMBER),
      ...Object.values(PERMISSIONS.ROLE),
      ...Object.values(PERMISSIONS.DEVICE),
      ...Object.values(PERMISSIONS.SITE),
      ...Object.values(PERMISSIONS.ANALYTICS),
      ...Object.values(PERMISSIONS.SETTINGS),
    ],
    canOverrideOrganization: false,
    systemWide: true,
    canManageAllOrganizations: true,
    description: 'System-wide administrative access for organization management',
  },
  
  ORG_SUPER_ADMIN: {
    name: 'ORG_SUPER_ADMIN',
    displayName: 'Organization Super Administrator',
    permissions: [
      ...Object.values(PERMISSIONS.GROUP),
      ...Object.values(PERMISSIONS.USER),
      ...Object.values(PERMISSIONS.MEMBER),
      ...Object.values(PERMISSIONS.ROLE),
      ...Object.values(PERMISSIONS.DEVICE),
      ...Object.values(PERMISSIONS.SITE),
      ...Object.values(PERMISSIONS.ANALYTICS),
      ...Object.values(PERMISSIONS.SETTINGS),
    ],
    canOverrideOrganization: false,
    systemWide: false,
    canManageAllOrganizations: false,
    description: 'Full organization control within assigned organization',
  },
  
  ORG_ADMIN: {
    name: 'ORG_ADMIN',
    displayName: 'Organization Administrator',
    permissions: [
      PERMISSIONS.GROUP.VIEW,
      PERMISSIONS.GROUP.EDIT,
      PERMISSIONS.USER.VIEW,
      PERMISSIONS.USER.EDIT,
      PERMISSIONS.MEMBER.VIEW,
      PERMISSIONS.MEMBER.INVITE,
      PERMISSIONS.MEMBER.REMOVE,
      ...Object.values(PERMISSIONS.DEVICE),
      ...Object.values(PERMISSIONS.SITE),
      ...Object.values(PERMISSIONS.ANALYTICS),
      PERMISSIONS.SETTINGS.VIEW,
      PERMISSIONS.SETTINGS.GROUP_SETTINGS,
    ],
    canOverrideOrganization: false,
    systemWide: false,
    canManageAllOrganizations: false,
    description: 'Organization administration with device and site management',
  },
  
  ORG_TECHNICIAN: {
    name: 'ORG_TECHNICIAN',
    displayName: 'Organization Technician',
    permissions: [
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.DEVICE.DEPLOY,
      PERMISSIONS.DEVICE.MAINTAIN,
      PERMISSIONS.DEVICE.UPDATE,
      PERMISSIONS.SITE.VIEW,
      PERMISSIONS.SITE.CREATE,
      PERMISSIONS.ANALYTICS.DASHBOARD_VIEW,
      PERMISSIONS.ANALYTICS.DATA_VIEW,
    ],
    canOverrideOrganization: false,
    systemWide: false,
    canManageAllOrganizations: false,
    description: 'Field operations with device deployment and maintenance capabilities',
  },
  
  ORG_ANALYST: {
    name: 'ORG_ANALYST',
    displayName: 'Organization Analyst',
    permissions: [
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.SITE.VIEW,
      ...Object.values(PERMISSIONS.ANALYTICS),
    ],
    canOverrideOrganization: false,
    systemWide: false,
    canManageAllOrganizations: false,
    description: 'Data analysis with full analytics access',
  },
  
  ORG_DEVELOPER: {
    name: 'ORG_DEVELOPER',
    displayName: 'Organization Developer',
    permissions: [
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.SITE.VIEW,
      PERMISSIONS.ANALYTICS.DATA_VIEW,
      PERMISSIONS.ANALYTICS.DATA_EXPORT,
      PERMISSIONS.SETTINGS.VIEW,
    ],
    canOverrideOrganization: false,
    systemWide: false,
    canManageAllOrganizations: false,
    description: 'API and integration access with data export capabilities',
  },
  
  ORG_VIEWER: {
    name: 'ORG_VIEWER',
    displayName: 'Organization Viewer',
    permissions: [
      PERMISSIONS.DEVICE.VIEW,
      PERMISSIONS.SITE.VIEW,
      PERMISSIONS.ANALYTICS.DASHBOARD_VIEW,
      PERMISSIONS.ANALYTICS.DATA_VIEW,
    ],
    canOverrideOrganization: false,
    systemWide: false,
    canManageAllOrganizations: false,
    description: 'Read-only access to organization data and analytics',
  },
} as const;

// Permission categories for UI grouping
export const PERMISSION_CATEGORIES = {
  SYSTEM_ADMINISTRATION: [
    PERMISSIONS.SYSTEM.SUPER_ADMIN,
    PERMISSIONS.SYSTEM.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM.DATABASE_ADMIN,
  ],
  
  ORGANIZATION_MANAGEMENT: Object.values(PERMISSIONS.ORGANIZATION),
  
  GROUP_MANAGEMENT: Object.values(PERMISSIONS.GROUP),
  
  USER_MANAGEMENT: Object.values(PERMISSIONS.USER),
  
  MEMBER_MANAGEMENT: Object.values(PERMISSIONS.MEMBER),
  
  ROLE_MANAGEMENT: Object.values(PERMISSIONS.ROLE),
  
  DEVICE_MANAGEMENT: Object.values(PERMISSIONS.DEVICE),
  
  SITE_MANAGEMENT: Object.values(PERMISSIONS.SITE),
  
  ANALYTICS_AND_DATA: Object.values(PERMISSIONS.ANALYTICS),
  
  SETTINGS_AND_CONFIGURATION: Object.values(PERMISSIONS.SETTINGS),
} as const;

// Type definitions
export type Permission = 
  | typeof PERMISSIONS.SYSTEM[keyof typeof PERMISSIONS.SYSTEM]
  | typeof PERMISSIONS.ORGANIZATION[keyof typeof PERMISSIONS.ORGANIZATION]
  | typeof PERMISSIONS.GROUP[keyof typeof PERMISSIONS.GROUP]
  | typeof PERMISSIONS.USER[keyof typeof PERMISSIONS.USER]
  | typeof PERMISSIONS.MEMBER[keyof typeof PERMISSIONS.MEMBER]
  | typeof PERMISSIONS.ROLE[keyof typeof PERMISSIONS.ROLE]
  | typeof PERMISSIONS.DEVICE[keyof typeof PERMISSIONS.DEVICE]
  | typeof PERMISSIONS.SITE[keyof typeof PERMISSIONS.SITE]
  | typeof PERMISSIONS.ANALYTICS[keyof typeof PERMISSIONS.ANALYTICS]
  | typeof PERMISSIONS.SETTINGS[keyof typeof PERMISSIONS.SETTINGS];

export type RoleName = keyof typeof ROLES;
export type PermissionCategory = keyof typeof PERMISSION_CATEGORIES; 