'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  getOrganizationBySlugApi,
  getOrganizationThemeApi,
} from '@/core/apis/Organizations';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrganizationNotFound from '../../common/components/Organization/OrganizationNotFound';

const OrganizationContext = createContext();

export function OrganizationProvider({
  children,
  orgSlug,
  organization,
  theme,
}) {
  const [currentOrganization, setCurrentOrganization] = useState(organization);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isLoading, setIsLoading] = useState(!!orgSlug && !organization);
  const [error, setError] = useState(null);
  // Fetch organization data if orgSlug is provided but organization is not
  useEffect(() => {
    if (orgSlug && !organization) {
      setIsLoading(true);
      setError(null);
      getOrganizationBySlugApi(orgSlug)
        .then((response) => {
          const orgData = response?.data || response;
          setCurrentOrganization(orgData);
          // Fetch theme data separately
          return getOrganizationThemeApi(orgSlug);
        })
        .then((response) => {
          const themeData = response?.data || response;
          setCurrentTheme(themeData);
          setError(null);
        })
        .catch((err) => {
          setError(err);
          setCurrentOrganization(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (organization) {
      setCurrentOrganization(organization);
      setCurrentTheme(theme);
      setIsLoading(false);
    }
  }, [orgSlug, organization, theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading organization..." />
      </div>
    );
  }
  if (error || (orgSlug && !currentOrganization)) {
    return <OrganizationNotFound orgSlug={orgSlug || ''} />;
  }

  const value = {
    organization: currentOrganization,
    theme: currentTheme,
    // Helper functions
    getDisplayName: () => {
      if (currentOrganization?.parent) {
        return `${currentOrganization.parent.name} - ${currentOrganization.name}`;
      }
      return currentOrganization?.name || '';
    },
    getFullPath: () => {
      if (currentOrganization?.parent) {
        return `${currentOrganization.parent.slug}/${currentOrganization.slug}`;
      }
      return currentOrganization?.slug || '';
    },
    canUserRegister: () =>
      currentOrganization?.settings?.allowSelfRegistration || false,
    requiresApproval: () =>
      currentOrganization?.settings?.requireApproval || false,
    primaryColor:
      currentTheme?.primaryColor ||
      currentOrganization?.primaryColor ||
      '#135DFF',
    secondaryColor:
      currentTheme?.secondaryColor ||
      currentOrganization?.secondaryColor ||
      '#1B2559',
    logo:
      currentTheme?.logo ||
      currentOrganization?.logo ||
      '/icons/airqo_logo.svg',
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

OrganizationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  orgSlug: PropTypes.string,
  organization: PropTypes.object,
  theme: PropTypes.object,
};

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider',
    );
  }
  return context;
}
