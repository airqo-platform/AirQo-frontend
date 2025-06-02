import { useState, useEffect, useContext, createContext } from 'react';
import { useParams, usePathname } from 'next/navigation';
import {
  getOrganizationBySlugApi,
  getOrganizationThemeApi,
} from '../apis/Organizations';

// Create context for organization data
const OrganizationContext = createContext();

/**
 * Hook to get organization from URL parameters
 * Supports both single org (/airqo/*) and hierarchical (/nuaqi/research-team/*)
 */
export function useOrganizationFromUrl() {
  const params = useParams();
  const pathname = usePathname();

  // Extract org slug from URL - handles both [orgSlug] and [...orgSlug] patterns
  const extractOrgSlug = () => {
    if (params?.orgSlug) {
      // Handle dynamic route parameters
      if (Array.isArray(params.orgSlug)) {
        return params.orgSlug.join('/');
      }
      return params.orgSlug;
    }

    // Fallback: extract from pathname
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length >= 1) {
      // Skip 'org' prefix if present
      const startIndex = pathParts[0] === 'org' ? 1 : 0;
      return pathParts.slice(startIndex, startIndex + 2).join('/');
    }

    return null;
  };

  return extractOrgSlug();
}

/**
 * Hook to fetch organization data by slug
 */
export function useOrganizationData(orgSlug) {
  const [organization, setOrganization] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(!!orgSlug);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orgSlug) {
      setOrganization(null);
      setTheme(null);
      setLoading(false);
      return;
    }

    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [orgData, themeData] = await Promise.all([
          getOrganizationBySlugApi(orgSlug),
          getOrganizationThemeApi(orgSlug),
        ]);

        setOrganization(orgData);
        setTheme(themeData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Error fetching organization data:', err);
        setError(err);
        setOrganization(null);
        setTheme(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [orgSlug]);

  return { organization, theme, loading, error };
}

/**
 * Hook to use organization context (used within OrganizationProvider)
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider',
    );
  }
  return context;
}

/**
 * Hook for organization context that combines organization data and theme
 */
export function useOrganizationContext() {
  const orgSlug = useOrganizationFromUrl();
  const { organization, theme, loading, error } = useOrganizationData(orgSlug);

  return {
    organization,
    orgSlug,
    theme,
    loading,
    error,
    hasOrganization: !!organization,
    // Convenience getters
    organizationName: organization?.name || theme?.name || 'AirQo',
    primaryColor:
      theme?.primaryColor || organization?.primaryColor || '#135DFF',
    secondaryColor:
      theme?.secondaryColor || organization?.secondaryColor || '#1B2559',
    logo: theme?.logo || organization?.logo || '/icons/airqo_logo.svg',
    getDisplayName: () => {
      if (organization?.parent) {
        return `${organization.parent.name} - ${organization.name}`;
      }
      return organization?.name || '';
    },
    getFullPath: () => {
      if (organization?.parent) {
        return `${organization.parent.slug}/${organization.slug}`;
      }
      return organization?.slug || '';
    },
    canUserRegister: () =>
      organization?.settings?.allowSelfRegistration || false,
    requiresApproval: () => organization?.settings?.requireApproval || false,
  };
}
