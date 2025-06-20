import { useSelector } from 'react-redux';

/**
 * Hook to access organization theme data from Redux store
 * This provides access to the organization's default theme that was fetched during login
 */
export const useOrganizationThemeData = () => {
  const organizationTheme = useSelector((state) => state.organizationTheme);

  return {
    // Organization theme data
    organizationTheme: organizationTheme.organizationTheme,

    // Loading and error states
    isLoading: organizationTheme.isLoading,
    error: organizationTheme.error,
    hasData: organizationTheme.hasData,

    // Helper functions
    hasOrganizationTheme: () => !!organizationTheme.organizationTheme,

    getOrganizationPrimaryColor: () => {
      return organizationTheme.organizationTheme?.primaryColor || '#3B82F6';
    },

    getOrganizationThemeMode: () => {
      return organizationTheme.organizationTheme?.mode || 'light';
    },

    getOrganizationInterfaceStyle: () => {
      return organizationTheme.organizationTheme?.interfaceStyle || 'bordered';
    },

    getOrganizationContentLayout: () => {
      return organizationTheme.organizationTheme?.contentLayout || 'compact';
    },

    // Get full organization theme with defaults
    getOrganizationThemeWithDefaults: () => {
      const defaultTheme = {
        primaryColor: '#3B82F6',
        mode: 'light',
        interfaceStyle: 'bordered',
        contentLayout: 'compact',
      };

      return organizationTheme.organizationTheme
        ? { ...defaultTheme, ...organizationTheme.organizationTheme }
        : defaultTheme;
    },
  };
};

export default useOrganizationThemeData;
