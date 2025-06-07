import {
  ORGANIZATIONS_URL,
  ORGANIZATION_BY_SLUG_URL,
  ORGANIZATION_THEME_URL,
  ORGANIZATION_REGISTER_URL,
  ORGANIZATION_LOGIN_URL,
  ORGANIZATION_ACCESS_URL,
} from '../urls/organizations';
import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';

// Mock test users for development testing
// Available test accounts:
// AirQo: admin@airqo.net/admin123, user@airqo.net/user123
// NUAQI: researcher@nuaqi.org/research123, viewer@nuaqi.org/viewer123
// Makerere: professor@mak.ac.ug/prof123, student@mak.ac.ug/student123
const MOCK_TEST_USERS = {
  'admin@airqo.net': {
    password: 'admin123',
    orgSlug: 'airqo',
    user: {
      _id: 'user-airqo-admin',
      email: 'admin@airqo.net',
      firstName: 'John',
      lastName: 'Admin',
      role: 'admin',
      permissions: [
        'read:dashboard',
        'write:dashboard',
        'read:analytics',
        'write:analytics',
        'manage:users',
      ],
    },
  },
  'user@airqo.net': {
    password: 'user123',
    orgSlug: 'airqo',
    user: {
      _id: 'user-airqo-user',
      email: 'user@airqo.net',
      firstName: 'Jane',
      lastName: 'User',
      role: 'user',
      permissions: ['read:dashboard', 'read:analytics'],
    },
  },
  'researcher@nuaqi.org': {
    password: 'research123',
    orgSlug: 'nuaqi',
    user: {
      _id: 'user-nuaqi-researcher',
      email: 'researcher@nuaqi.org',
      firstName: 'Michael',
      lastName: 'Researcher',
      role: 'researcher',
      permissions: [
        'read:dashboard',
        'read:analytics',
        'write:analytics',
        'manage:data',
      ],
    },
  },
  'viewer@nuaqi.org': {
    password: 'viewer123',
    orgSlug: 'nuaqi',
    user: {
      _id: 'user-nuaqi-viewer',
      email: 'viewer@nuaqi.org',
      firstName: 'Sarah',
      lastName: 'Viewer',
      role: 'viewer',
      permissions: ['read:dashboard'],
    },
  },
  'professor@mak.ac.ug': {
    password: 'prof123',
    orgSlug: 'makerere',
    user: {
      _id: 'user-makerere-prof',
      email: 'professor@mak.ac.ug',
      firstName: 'Dr. David',
      lastName: 'Professor',
      role: 'professor',
      permissions: [
        'read:dashboard',
        'read:analytics',
        'write:analytics',
        'manage:students',
      ],
    },
  },
  'student@mak.ac.ug': {
    password: 'student123',
    orgSlug: 'makerere',
    user: {
      _id: 'user-makerere-student',
      email: 'student@mak.ac.ug',
      firstName: 'Alice',
      lastName: 'Student',
      role: 'student',
      permissions: ['read:dashboard'],
    },
  },
};

// Mock organizations data for development - replace with actual API calls later
const MOCK_ORGANIZATIONS = {
  airqo: {
    _id: '1',
    slug: 'airqo',
    name: 'AirQo',
    description: 'Air Quality Monitoring Network',
    logo: '/icons/airqo_logo.svg',
    primaryColor: '#135DFF',
    secondaryColor: '#1B2559',
    domain: 'airqo.net',
    status: 'ACTIVE',
    settings: {
      allowSelfRegistration: true,
      requireApproval: false,
      defaultRole: 'user',
    },
  },
  nuaqi: {
    _id: '2',
    slug: 'nuaqi',
    name: 'NUAQI',
    description: 'Northern Uganda Air Quality Initiative',
    logo: 'https://img.freepik.com/free-vector/bird-colorful-gradient-design-vector_343694-2506.jpg?semt=ais_hybrid&w=740',
    primaryColor: '#28A745',
    secondaryColor: '#155724',
    domain: 'nuaqi.org',
    status: 'ACTIVE',
    settings: {
      allowSelfRegistration: true,
      requireApproval: true,
      defaultRole: 'viewer',
    },
    children: {
      'research-team': {
        _id: '2a',
        slug: 'research-team',
        parent: 'nuaqi',
        name: 'NUAQI Research Team',
        description: 'Research Division',
        primaryColor: '#007BFF',
        secondaryColor: '#004085',
        status: 'ACTIVE',
      },
    },
  },
  makerere: {
    _id: '3',
    slug: 'makerere',
    name: 'Makerere University',
    description: 'Academic Air Quality Research',
    logo: 'https://www.vhv.rs/dpng/d/412-4127322_cool-logo-png-transparent-svg-vector-cool-logo.png',
    primaryColor: '#DC3545',
    secondaryColor: '#721C24',
    domain: 'mak.ac.ug',
    status: 'ACTIVE',
    settings: {
      allowSelfRegistration: false,
      requireApproval: true,
      defaultRole: 'student',
    },
  },
};

// Organization API calls
export const getOrganizationBySlugApi = async (slug) => {
  // For development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const slugParts = slug.split('/').filter(Boolean);
        const [parentSlug, childSlug] = slugParts;

        const parentOrg = MOCK_ORGANIZATIONS[parentSlug];
        if (!parentOrg) {
          resolve({ data: null });
          return;
        }

        if (!childSlug) {
          resolve({ data: parentOrg });
          return;
        }

        if (parentOrg.children && parentOrg.children[childSlug]) {
          resolve({
            data: {
              ...parentOrg.children[childSlug],
              parent: parentOrg,
            },
          });
          return;
        }

        resolve({ data: null });
      }, 100);
    });
  }

  // Production API call
  return secureApiProxy({
    method: 'GET',
    url: ORGANIZATION_BY_SLUG_URL(slug),
    auth: AUTH_TYPES.JWT,
  });
};

export const getAllOrganizationsApi = () => {
  // For development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: Object.values(MOCK_ORGANIZATIONS) });
      }, 100);
    });
  }

  return secureApiProxy({
    method: 'GET',
    url: ORGANIZATIONS_URL,
    auth: AUTH_TYPES.JWT,
  });
};

export const validateUserOrgAccessApi = (userId, orgId) => {
  // For development, always return true
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { hasAccess: true } });
      }, 50);
    });
  }

  return secureApiProxy({
    method: 'GET',
    url: ORGANIZATION_ACCESS_URL(orgId, userId),
    auth: AUTH_TYPES.JWT,
  });
};

export const registerUserToOrgApi = (orgSlug, userData) => {
  // For development, simulate registration success
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const org = MOCK_ORGANIZATIONS[orgSlug];
        if (org) {
          // Check if registration is allowed
          if (!org.settings.allowSelfRegistration) {
            resolve({
              success: false,
              message: 'Registration is not allowed for this organization',
            });
            return;
          }

          // Simulate successful registration
          resolve({
            success: true,
            user: {
              _id: 'user-' + Date.now(),
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              organizationId: org._id,
              organizationSlug: orgSlug,
              status: org.settings.requireApproval ? 'pending' : 'active',
            },
            message: org.settings.requireApproval
              ? 'Registration submitted. Awaiting approval.'
              : 'Registration successful',
            requiresApproval: org.settings.requireApproval,
          });
        } else {
          resolve({
            success: false,
            message: 'Organization not found',
          });
        }
      }, 1000); // Simulate network delay
    });
  }

  // Production API call
  return secureApiProxy({
    method: 'POST',
    url: ORGANIZATION_REGISTER_URL(orgSlug),
    data: userData,
    auth: AUTH_TYPES.NONE, // Registration doesn't require authentication
  });
};

export const loginUserToOrgApi = async (loginData) => {
  const { organizationSlug, email, password } = loginData;

  // For development, validate against test users
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const testUser = MOCK_TEST_USERS[email];
        const org = MOCK_ORGANIZATIONS[organizationSlug];

        if (!org) {
          resolve({
            success: false,
            message: 'Organization not found',
          });
          return;
        }

        if (!testUser) {
          resolve({
            success: false,
            message: 'Invalid email or password',
          });
          return;
        }

        if (
          testUser.password !== password ||
          testUser.orgSlug !== organizationSlug
        ) {
          resolve({
            success: false,
            message: 'Invalid email or password',
          });
          return;
        }

        // Successful login
        resolve({
          success: true,
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            ...testUser.user,
            organizationId: org._id,
            organizationSlug: organizationSlug,
          },
          message: 'Login successful',
        });
      }, 500); // Simulate network delay
    });
  }

  // Production API call
  return secureApiProxy({
    method: 'POST',
    url: ORGANIZATION_LOGIN_URL(organizationSlug),
    data: { email, password },
    auth: AUTH_TYPES.NONE, // Login doesn't require prior authentication
  });
};

export const getOrganizationThemeApi = (orgSlug) => {
  // For development, return theme from mock data
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const org = MOCK_ORGANIZATIONS[orgSlug];
        if (org) {
          resolve({
            data: {
              primaryColor: org.primaryColor,
              secondaryColor: org.secondaryColor,
              logo: org.logo,
              name: org.name,
            },
          });
        } else {
          resolve({ data: null });
        }
      }, 50);
    });
  }

  return secureApiProxy({
    method: 'GET',
    url: ORGANIZATION_THEME_URL(orgSlug),
    auth: AUTH_TYPES.NONE, // Theme is public data
  });
};

export const forgotPasswordOrgApi = async (orgSlug, email) => {
  // For development, simulate forgot password success
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const org = MOCK_ORGANIZATIONS[orgSlug];
        if (org) {
          resolve({
            success: true,
            message: `Password reset instructions have been sent to ${email} for ${org.name}.`,
          });
        } else {
          resolve({
            success: false,
            message: 'Organization not found',
          });
        }
      }, 1000); // Simulate network delay
    });
  }

  // Production API call
  return secureApiProxy({
    method: 'POST',
    url: `${ORGANIZATION_BY_SLUG_URL(orgSlug)}/forgot-password`,
    data: { email },
    auth: AUTH_TYPES.NONE, // Forgot password doesn't require authentication
  });
};

// Helper functions for organization logic
export const OrganizationService = {
  // Get organization theme
  getTheme(organization) {
    if (!organization) return null;

    return {
      primaryColor: organization.primaryColor,
      secondaryColor: organization.secondaryColor,
      logo: organization.logo,
      name: organization.name,
    };
  },

  // Check if user can register to organization
  canUserRegister(organization) {
    return organization?.settings?.allowSelfRegistration || false;
  },

  // Check if registration requires approval
  requiresApproval(organization) {
    return organization?.settings?.requireApproval || false;
  },

  // Get organization display name (handles hierarchical names)
  getDisplayName(organization) {
    if (organization?.parent) {
      return `${organization.parent.name} - ${organization.name}`;
    }
    return organization?.name || '';
  },
  // Get full organization path
  getFullPath(organization) {
    if (organization?.parent) {
      return `${organization.parent.slug}/${organization.slug}`;
    }
    return organization?.slug || '';
  },

  // Get test credentials for organization (development only)
  getTestCredentials(orgSlug) {
    if (process.env.NODE_ENV !== 'development') return null;

    const credentials = Object.entries(MOCK_TEST_USERS)
      .filter(([, userData]) => userData.orgSlug === orgSlug)
      .map(([email, userData]) => ({
        email,
        password: userData.password,
        role: userData.user.role,
        name: `${userData.user.firstName} ${userData.user.lastName}`,
      }));

    return credentials;
  },
};
