/**
 * Hook for managing organization themes and authentication branding
 */

import { useState, useEffect } from 'react';
import { getOrganizationBySlugApi } from '../apis/Organizations';
import logger from '@/lib/logger';

/**
 * Custom hook for fetching organization theme data
 * @param {string} orgSlug - Organization slug from URL
 * @returns {Object} Theme data and loading state
 */
export const useOrganizationTheme = (orgSlug) => {
  const [theme, setTheme] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(!!orgSlug);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orgSlug) {
      setTheme(null);
      setOrganization(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTheme = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getOrganizationBySlugApi(orgSlug);

        if (result.success && result.data) {
          setOrganization(result.data);
          setTheme({
            name: result.data.name,
            logo: result.data.logo,
            primaryColor: result.data.primaryColor,
            secondaryColor: result.data.secondaryColor,
            font: result.data.font,
          });
        } else {
          setError(new Error(result.message || 'Organization not found'));
          setTheme(null);
          setOrganization(null);
        }
      } catch (err) {
        logger.error('Error fetching organization theme:', err);
        setError(err);
        setTheme(null);
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [orgSlug]);

  return {
    theme,
    organization,
    loading,
    error,
    // Convenience getters
    isLoaded: !loading && !error,
    hasOrganization: !!organization,
    primaryColor: theme?.primaryColor || '#135DFF',
    secondaryColor: theme?.secondaryColor || '#1B2559',
    logo: theme?.logo || '/icons/airqo_logo.svg',
    organizationName: theme?.name || 'AirQo',
    font: theme?.font || 'Inter',
    // Helper functions
    canUserRegister: () =>
      organization?.settings?.allowSelfRegistration ?? true,
    requiresApproval: () => organization?.settings?.requireApproval ?? false,
  };
};

/**
 * Hook for organization registration functionality
 * @param {string} orgSlug - Organization slug
 * @returns {Object} Registration functions and state
 */
export const useOrganizationRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const resetRegistrationState = () => {
    setRegistrationError(null);
    setRegistrationSuccess(false);
    setIsRegistering(false);
  };

  return {
    isRegistering,
    registrationError,
    registrationSuccess,
    resetRegistrationState,
    setIsRegistering,
    setRegistrationError,
    setRegistrationSuccess,
  };
};

export default useOrganizationTheme;
