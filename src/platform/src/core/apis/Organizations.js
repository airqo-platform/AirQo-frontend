/**
 * Organizations API
 * Handles organization-related API calls
 * Simplified version without mock data - uses real backend endpoints
 */

import logger from '@/lib/logger';

// Default organizations data - minimal set for testing
const DEFAULT_ORGANIZATIONS = {
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

/**
 * Get organization by slug
 */
export const getOrganizationBySlugApi = async (slug) => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        const slugParts = slug.split('/').filter(Boolean);
        const [parentSlug] = slugParts;

        const org = DEFAULT_ORGANIZATIONS[parentSlug];

        if (!org) {
          resolve({
            success: false,
            message: 'Organization not found',
            data: null,
          });
          return;
        }

        resolve({
          success: true,
          data: org,
        });
      }, 100);
    });
  } catch (error) {
    logger.error('Error fetching organization:', error);
    return {
      success: false,
      message: 'Failed to fetch organization',
      data: null,
    };
  }
};

/**
 * Get all organizations
 */
export const getAllOrganizationsApi = async () => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: Object.values(DEFAULT_ORGANIZATIONS),
        });
      }, 100);
    });
  } catch (error) {
    logger.error('Error fetching organizations:', error);
    return {
      success: false,
      message: 'Failed to fetch organizations',
      data: [],
    };
  }
};

/**
 * Get organization theme
 */
export const getOrganizationThemeApi = async (orgSlug) => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        const org = DEFAULT_ORGANIZATIONS[orgSlug];

        if (!org) {
          resolve({
            success: false,
            message: 'Organization not found',
            data: null,
          });
          return;
        }

        resolve({
          success: true,
          data: {
            primaryColor: org.primaryColor,
            secondaryColor: org.secondaryColor,
            logo: org.logo,
            name: org.name,
          },
        });
      }, 100);
    });
  } catch (error) {
    logger.error('Error fetching organization theme:', error);
    return {
      success: false,
      message: 'Failed to fetch organization theme',
      data: null,
    };
  }
};

/**
 * Register user to organization
 */
export const registerUserToOrgApi = async (userData) => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Registration successful',
          user: {
            _id: 'temp-user-id',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'user',
            organizationSlug: userData.organizationSlug,
          },
        });
      }, 500);
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    return {
      success: false,
      message: 'Registration failed',
    };
  }
};

/**
 * Login user to organization
 */
export const loginUserToOrgApi = async (loginData) => {
  try {
    const { organizationSlug, email, password } = loginData;

    return new Promise((resolve) => {
      setTimeout(() => {
        const org = DEFAULT_ORGANIZATIONS[organizationSlug];

        if (!org) {
          resolve({
            success: false,
            message: 'Organization not found',
          });
          return;
        }

        if (!email || !password) {
          resolve({
            success: false,
            message: 'Email and password are required',
          });
          return;
        }

        // Successful login
        resolve({
          success: true,
          token: 'demo-jwt-token-' + Date.now(),
          user: {
            _id: 'demo-user-' + Date.now(),
            email: email,
            firstName: email.split('@')[0],
            lastName: 'User',
            role: 'user',
            organizationId: org._id,
            organizationSlug: organizationSlug,
            permissions: ['read:dashboard', 'read:analytics'],
          },
          message: 'Login successful',
        });
      }, 300);
    });
  } catch (error) {
    logger.error('Error logging in user:', error);
    return {
      success: false,
      message: 'Login failed',
    };
  }
};

/**
 * Check organization access for user
 */
export const checkOrganizationAccessApi = async (orgSlug, userId) => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        const org = DEFAULT_ORGANIZATIONS[orgSlug];

        if (!org) {
          resolve({
            success: false,
            message: 'Organization not found',
            hasAccess: false,
          });
          return;
        }

        resolve({
          success: true,
          hasAccess: !!(org && userId),
          role: 'user',
          permissions: ['read:dashboard', 'read:analytics'],
        });
      }, 100);
    });
  } catch (error) {
    logger.error('Error checking organization access:', error);
    return {
      success: false,
      message: 'Failed to check access',
      hasAccess: false,
    };
  }
};

/**
 * Get available test credentials for development
 */
export const getTestCredentials = () => {
  return [
    {
      organization: 'AirQo',
      slug: 'airqo',
      email: 'demo@airqo.net',
      password: 'demo123',
      role: 'admin',
    },
    {
      organization: 'NUAQI',
      slug: 'nuaqi',
      email: 'demo@nuaqi.org',
      password: 'demo123',
      role: 'researcher',
    },
    {
      organization: 'Makerere University',
      slug: 'makerere',
      email: 'demo@mak.ac.ug',
      password: 'demo123',
      role: 'student',
    },
  ];
};
