'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  getOrganizationBySlugApi,
  getOrganizationThemeApi,
} from '@/core/apis/Organizations';
import { setOrganizationName } from '@/lib/store/services/charts/ChartSlice';
import { setActiveGroup } from '@/lib/store/services/groups';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrganizationNotFound from '@/components/Organization/OrganizationNotFound';
import logger from '@/lib/logger';

const OrganizationContext = createContext();

export function OrganizationProvider({
  children,
  orgSlug,
  organization,
  theme,
}) {
  const dispatch = useDispatch();
  const [currentOrganization, setCurrentOrganization] = useState(organization);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isLoading, setIsLoading] = useState(!!orgSlug && !organization);
  const [error, setError] = useState(null);

  // Get user groups to find matching group
  const { groupList } = useGetActiveGroup();

  // Helper function to find group by organization name/slug
  const findGroupByOrganization = (groups, orgName, orgSlug) => {
    if (!groups || groups.length === 0) return null;

    // Try to match by exact name first
    let matchedGroup = groups.find(
      (group) => group.grp_title?.toLowerCase() === orgName?.toLowerCase(),
    );

    // If no exact match, try to match by slug-like comparison
    if (!matchedGroup && orgSlug) {
      const normalizedSlug = orgSlug.replace(/-/g, ' ').toLowerCase();
      matchedGroup = groups.find(
        (group) =>
          group.grp_title?.replace(/[-_\s]/g, ' ').toLowerCase() ===
          normalizedSlug,
      );
    }

    return matchedGroup;
  };

  // Set active group when organization changes
  useEffect(() => {
    if (currentOrganization && groupList && groupList.length > 0) {
      const matchedGroup = findGroupByOrganization(
        groupList,
        currentOrganization.name,
        orgSlug,
      );

      if (matchedGroup) {
        // Set the active group in Redux
        dispatch(setActiveGroup(matchedGroup));
        // Set organization name for charts
        dispatch(setOrganizationName(matchedGroup.grp_title));
      }
    }
  }, [currentOrganization, groupList, orgSlug, dispatch]); // Fetch organization data if orgSlug is provided but organization is not
  useEffect(() => {
    if (orgSlug && !organization) {
      setIsLoading(true);
      setError(null);

      getOrganizationBySlugApi(orgSlug)
        .then((response) => {
          if (response.success && response.data) {
            const orgData = response.data;
            setCurrentOrganization(orgData);

            // Fetch theme data separately
            return getOrganizationThemeApi(orgSlug);
          } else {
            // Handle organization not found
            throw new Error(response.message || 'Organization not found');
          }
        })
        .then((response) => {
          if (response.success && response.data) {
            const themeData = response.data;
            setCurrentTheme(themeData);
            setError(null);
          } else {
            // Theme is optional, so we don't fail if it's not found
            setCurrentTheme(null);
            setError(null);
          }
        })
        .catch((err) => {
          logger.error('Error loading organization:', err);
          setError(err);
          setCurrentOrganization(null);
          setCurrentTheme(null);
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

// Add the useOrganization hook
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider',
    );
  }
  return context;
}

OrganizationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  orgSlug: PropTypes.string,
  organization: PropTypes.object,
  theme: PropTypes.object,
};
