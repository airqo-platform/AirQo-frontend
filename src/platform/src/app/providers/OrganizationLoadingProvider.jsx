'use client';

import React, { createContext, useContext } from 'react';

/**
 * Global logout state detection
 * This helps prevent organization switching modal during logout
 */
let _isGlobalLogout = false;

export const setGlobalLogoutState = (isLoggingOut) => {
  _isGlobalLogout = isLoggingOut;
};

/**
 * Context for managing organization loading states
 */
const OrganizationLoadingContext = createContext({
  isOrganizationLoading: false,
  isSwitchingOrganization: false,
  setIsSwitchingOrganization: () => {},
});

/**
 * Provider that manages loading states during organization switches
 * This is now simplified - organization switching loading is handled by Next.js loading.jsx files
 */
export function OrganizationLoadingProvider({ children }) {
  // Simplified provider - organization switching loading is now handled by Next.js loading.jsx files
  const value = {
    isOrganizationLoading: false,
    isSwitchingOrganization: false,
    setIsSwitchingOrganization: () => {},
  };

  return (
    <OrganizationLoadingContext.Provider value={value}>
      {children}
    </OrganizationLoadingContext.Provider>
  );
}

/**
 * Hook to access organization loading context
 */
export function useOrganizationLoading() {
  const context = useContext(OrganizationLoadingContext);
  if (!context) {
    throw new Error(
      'useOrganizationLoading must be used within an OrganizationLoadingProvider',
    );
  }
  return context;
}

export default OrganizationLoadingProvider;
