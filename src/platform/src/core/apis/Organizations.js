/**
 * Organizations API
 * Handles organization-related API calls using real backend endpoints
 */

import axios from 'axios';
import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import logger from '@/lib/logger';
import {
  ORGANIZATION_THEME_URL,
  ORGANIZATION_THEME_PREFERENCES_URL,
  ORGANIZATION_REGISTER_URL,
  ORGANIZATION_FORGOT_PASSWORD_URL,
  ORGANIZATION_RESET_PASSWORD_URL,
} from '../urls/organizations';

/**
 * Get organization theme and branding data by slug
 * @param {string} orgSlug - Organization slug from URL
 * @returns {Promise} Organization data including theme settings
 */
export const getOrganizationBySlugApi = async (orgSlug) => {
  try {
    const response = await axios.get(ORGANIZATION_THEME_URL(orgSlug));

    if (response.data.success) {
      return {
        success: true,
        data: {
          _id: response.data.data._id || null,
          slug: response.data.data.slug,
          name: response.data.data.name,
          logo: response.data.data.logo,
          primaryColor: response.data.data.theme?.primaryColor || '#135DFF',
          secondaryColor: response.data.data.theme?.secondaryColor || '#1B2559',
          font: response.data.data.theme?.font || 'Inter',
          status: 'ACTIVE',
          // Set default settings for auth pages
          settings: {
            allowSelfRegistration: true,
            requireApproval: false,
            defaultRole: 'user',
          },
        },
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to fetch organization',
      data: null,
    };
  } catch (error) {
    logger.error('Error fetching organization:', error);

    // Handle 404 specifically
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Organization not found',
        data: null,
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch organization',
      data: null,
    };
  }
};

/**
 * Register user to organization
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.phoneNumber - User's phone number
 * @param {string} userData.jobTitle - User's job title
 * @param {string} userData.recaptchaToken - reCAPTCHA verification token
 * @param {string} userData.organizationSlug - Organization slug
 * @returns {Promise} Registration result
 */
export const registerUserToOrgApi = async (userData) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      jobTitle,
      recaptchaToken,
      organizationSlug,
    } = userData;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !jobTitle ||
      !recaptchaToken
    ) {
      throw new Error(
        'All fields are required, including reCAPTCHA verification',
      );
    }

    const registrationData = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      jobTitle,
      recaptchaToken,
    };

    const response = await axios.post(
      ORGANIZATION_REGISTER_URL(organizationSlug),
      registrationData,
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Registration successful',
        user: response.data.data,
      };
    }

    return {
      success: false,
      message: response.data.message || 'Registration failed',
      errors: response.data.errors || {},
    };
  } catch (error) {
    logger.error('Error registering user:', error);

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // Validation errors or reCAPTCHA failure
          return {
            success: false,
            message: data.message || 'Validation failed',
            errors: data.errors || {},
          };

        case 404:
          return {
            success: false,
            message: 'Organization not found',
            errors: { organization: 'Invalid organization' },
          };

        case 429:
          // Rate limiting
          return {
            success: false,
            message:
              data.message || 'Too many attempts, please try again later',
            errors: data.errors || {},
          };

        default:
          return {
            success: false,
            message: data.message || 'Registration failed',
            errors: data.errors || {},
          };
      }
    } // Network or other errors
    return {
      success: false,
      message: error.message || 'Registration failed. Please try again.',
      errors: { network: 'Unable to connect to server' },
    };
  }
};

/**
 * Send password reset email to user in organization
 * @param {Object} data - Password reset request data
 * @param {string} data.email - User's email address
 * @param {string} data.organizationSlug - Organization slug
 * @param {string} data.recaptchaToken - reCAPTCHA verification token
 * @returns {Promise} Password reset request result
 */
export const forgotPasswordApi = async (data) => {
  try {
    const { email, organizationSlug, recaptchaToken } = data;

    // Validate required fields
    if (!email || !recaptchaToken) {
      throw new Error('Email and reCAPTCHA verification are required');
    }

    const requestData = {
      email,
      recaptchaToken,
    };

    const response = await axios.post(
      ORGANIZATION_FORGOT_PASSWORD_URL(organizationSlug),
      requestData,
    );

    if (response.data.success) {
      return {
        success: true,
        message:
          response.data.message ||
          'Password reset instructions sent to your email',
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to send reset email',
      errors: response.data.errors || {},
    };
  } catch (error) {
    logger.error('Error sending password reset email:', error);

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // Validation errors or reCAPTCHA failure
          return {
            success: false,
            message: data.message || 'Invalid request',
            errors: data.errors || {},
          };

        case 404:
          return {
            success: false,
            message:
              data.message || 'Email address not found in this organization',
            errors: { email: 'Email not found' },
          };

        case 429:
          // Rate limiting
          return {
            success: false,
            message:
              data.message || 'Too many requests, please try again later',
            errors: data.errors || {},
          };

        default:
          return {
            success: false,
            message: data.message || 'Failed to send reset email',
            errors: data.errors || {},
          };
      }
    }

    // Network or other errors
    return {
      success: false,
      message: error.message || 'Failed to send reset email. Please try again.',
      errors: { network: 'Unable to connect to server' },
    };
  }
};

/**
 * Reset user password with token
 * @param {Object} data - Password reset data
 * @param {string} data.token - Password reset token from email
 * @param {string} data.password - New password
 * @param {string} data.confirmPassword - Password confirmation
 * @param {string} data.organizationSlug - Organization slug
 * @param {string} data.recaptchaToken - reCAPTCHA verification token
 * @returns {Promise} Password reset result
 */
export const resetPasswordApi = async (data) => {
  try {
    const {
      token,
      password,
      confirmPassword,
      organizationSlug,
      recaptchaToken,
    } = data;

    // Validate required fields
    if (!token || !password || !confirmPassword || !recaptchaToken) {
      throw new Error(
        'All fields are required, including reCAPTCHA verification',
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
        errors: { confirmPassword: 'Passwords must match' },
      };
    }

    const requestData = {
      token,
      password,
      confirmPassword,
      recaptchaToken,
    };

    const response = await axios.post(
      ORGANIZATION_RESET_PASSWORD_URL(organizationSlug),
      requestData,
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Password reset successfully',
        user: response.data.data,
      };
    }

    return {
      success: false,
      message: response.data.message || 'Password reset failed',
      errors: response.data.errors || {},
    };
  } catch (error) {
    logger.error('Error resetting password:', error);

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // Validation errors, expired token, or reCAPTCHA failure
          return {
            success: false,
            message: data.message || 'Invalid or expired reset token',
            errors: data.errors || {},
          };

        case 404:
          return {
            success: false,
            message: data.message || 'Invalid reset token or organization',
            errors: { token: 'Invalid reset token' },
          };

        case 429:
          // Rate limiting
          return {
            success: false,
            message:
              data.message || 'Too many attempts, please try again later',
            errors: data.errors || {},
          };

        default:
          return {
            success: false,
            message: data.message || 'Password reset failed',
            errors: data.errors || {},
          };
      }
    }

    // Network or other errors
    return {
      success: false,
      message: error.message || 'Password reset failed. Please try again.',
      errors: { network: 'Unable to connect to server' },
    };
  }
};

/**
 * Get organization theme preferences
 * @param {string} groupId - Organization group ID
 * @returns {Promise} Organization theme preferences
 */
export const getOrganizationThemePreferencesApi = (groupId) => {
  // Validate group ID
  if (!groupId || typeof groupId !== 'string') {
    return Promise.reject(new Error('Valid group ID is required'));
  }

  return secureApiProxy
    .get(ORGANIZATION_THEME_PREFERENCES_URL(groupId), {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Enhanced error handling
      const errorMessage =
        error.response?.data?.message ||
        'Failed to fetch organization theme preferences';
      logger.error('Error fetching organization theme preferences:', error);
      throw new Error(errorMessage);
    });
};

/**
 * Update organization theme preferences
 * @param {string} groupId - Organization group ID
 * @param {Object} currentTheme - Current organization theme state
 * @param {Object} newTheme - New theme settings object
 * @returns {Promise} Update response
 */
export const updateOrganizationThemePreferencesApi = (
  groupId,
  currentTheme,
  newTheme,
) => {
  // Validate group ID
  if (!groupId || typeof groupId !== 'string') {
    return Promise.reject(new Error('Valid group ID is required'));
  }

  // Validate theme data
  if (!newTheme || typeof newTheme !== 'object') {
    return Promise.reject(new Error('Valid theme data is required'));
  }

  if (!currentTheme || typeof currentTheme !== 'object') {
    return Promise.reject(new Error('Valid current theme data is required'));
  }

  // Build complete theme object with all four properties
  const validThemeKeys = [
    'primaryColor',
    'mode',
    'interfaceStyle',
    'contentLayout',
  ];
  const completeTheme = {};
  validThemeKeys.forEach((key) => {
    // Use new value if provided, otherwise use current value
    completeTheme[key] =
      newTheme[key] !== undefined ? newTheme[key] : currentTheme[key];
  });

  // Check if there are any actual changes for early return optimization
  const hasChanges = validThemeKeys.some(
    (key) => newTheme[key] !== undefined && newTheme[key] !== currentTheme[key],
  );

  // If no changes, return success without making API call
  if (!hasChanges) {
    return Promise.resolve({
      success: true,
      message: 'No changes to update',
      data: currentTheme,
    });
  }

  // Validate complete theme properties
  if (completeTheme.primaryColor) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(completeTheme.primaryColor)) {
      return Promise.reject(
        new Error('Primary color must be in valid hex format'),
      );
    }
  }

  if (completeTheme.mode) {
    const validModes = ['light', 'dark', 'system'];
    if (!validModes.includes(completeTheme.mode)) {
      return Promise.reject(
        new Error('Mode must be one of: light, dark, system'),
      );
    }
  }

  if (completeTheme.interfaceStyle) {
    const validStyles = ['default', 'bordered'];
    if (!validStyles.includes(completeTheme.interfaceStyle)) {
      return Promise.reject(
        new Error('Interface style must be one of: default, bordered'),
      );
    }
  }

  if (completeTheme.contentLayout) {
    const validLayouts = ['compact', 'wide'];
    if (!validLayouts.includes(completeTheme.contentLayout)) {
      return Promise.reject(
        new Error('Content layout must be one of: compact, wide'),
      );
    }
  }

  // Wrap complete theme in theme object as required by backend
  const requestBody = {
    theme: completeTheme,
  };

  return secureApiProxy
    .put(ORGANIZATION_THEME_PREFERENCES_URL(groupId), requestBody, {
      authType: AUTH_TYPES.JWT,
    })
    .then((response) => response.data)
    .catch((error) => {
      // Enhanced error handling
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update organization theme preferences';
      logger.error('Error updating organization theme preferences:', error);
      throw new Error(errorMessage);
    });
};
