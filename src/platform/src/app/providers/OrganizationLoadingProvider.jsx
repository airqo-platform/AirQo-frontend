'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';

/**
 * Global logout state detection
 * This helps prevent organization switching modal during logout
 */
let isGlobalLogout = false;

export const setGlobalLogoutState = (isLoggingOut) => {
  isGlobalLogout = isLoggingOut;
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
 * Global loading overlay component for organization switches
 */
function OrganizationLoadingOverlay({ isVisible }) {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-48 h-48 flex flex-col items-center justify-center space-y-4 shadow-xl">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <div className="text-center px-4">
          <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
            Loading data...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Just a moment
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Provider that manages loading states during organization switches
 * This ensures all components show loading states until the organization data is ready
 */
export function OrganizationLoadingProvider({ children }) {
  const [isSwitchingOrganization, setIsSwitchingOrganization] = useState(false);
  const [lastActiveGroupId, setLastActiveGroupId] = useState(null);
  const [lastOrgName, setLastOrgName] = useState(null);
  const isInitialized = useRef(false);
  const isUserLoggedIn = useRef(false);
  const switchTimeoutRef = useRef(null);

  // Get relevant Redux state
  const activeGroup = useSelector((state) => state.groups?.activeGroup);
  const userGroupsLoading = useSelector(
    (state) => state.groups?.userGroupsLoading,
  );
  const { status } = useSession();
  const loginSuccess = useSelector((state) => state.login?.success);

  // Initialize on first mount - don't trigger loading on initial load
  useEffect(() => {
    if (!isInitialized.current && activeGroup?._id) {
      setLastActiveGroupId(activeGroup._id);
      setLastOrgName(activeGroup?.grp_title);
      isInitialized.current = true;

      // Delay before allowing organization switch detection
      // This prevents the modal from showing on initial login
      setTimeout(() => {
        isUserLoggedIn.current = true;
      }, 2000); // 2 second delay
    }
  }, [activeGroup?._id, activeGroup?.grp_title, status, loginSuccess]);
  // Track when organization switches occur (only when both ID and name change)
  // This prevents triggering on route changes within the same organization
  useEffect(() => {
    if (!isInitialized.current || !isUserLoggedIn.current) return;

    const currentGroupId = activeGroup?._id;
    const currentOrgName = activeGroup?.grp_title;

    // Don't trigger organization switch modal during logout
    // Check if active group is being cleared (going from value to null) which indicates logout
    // OR if global logout state is active
    const isLogout = lastActiveGroupId && !currentGroupId;
    const isGlobalLogoutActive = isGlobalLogout;

    if (isLogout || isGlobalLogoutActive) {
      // If this looks like logout (group ID going from value to null), don't show switch modal
      setLastActiveGroupId(null);
      setLastOrgName(null);
      return;
    }

    // Only trigger if BOTH the group ID changed AND it's a different organization
    // AND the user has been logged in for a while (not initial login)
    // AND it's not a logout scenario
    if (
      currentGroupId &&
      currentOrgName &&
      (currentGroupId !== lastActiveGroupId ||
        currentOrgName !== lastOrgName) &&
      // Additional safety: ensure it's actually a different group, not just a state refresh
      !(currentGroupId === lastActiveGroupId && currentOrgName === lastOrgName)
    ) {
      // Clear any existing timeout
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }

      // Start organization switching
      setIsSwitchingOrganization(true);
      setLastActiveGroupId(currentGroupId);
      setLastOrgName(currentOrgName);
    }
  }, [
    activeGroup?._id,
    activeGroup?.grp_title,
    lastActiveGroupId,
    lastOrgName,
  ]);
  // Auto-complete loading based on data availability or timeout
  useEffect(() => {
    if (!isSwitchingOrganization) return;

    // Clear any existing timeout
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
    }

    // Set maximum loading time regardless of data state (shorter timeout)
    switchTimeoutRef.current = setTimeout(() => {
      setIsSwitchingOrganization(false);
    }, 3000); // Maximum 3 seconds

    // Complete loading when we have the basic requirements
    if (activeGroup?._id && !userGroupsLoading) {
      // For any organization switch, complete loading quickly
      switchTimeoutRef.current = setTimeout(() => {
        setIsSwitchingOrganization(false);
      }, 1200); // Quick completion when basic data is ready
    }

    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, [isSwitchingOrganization, activeGroup?._id, userGroupsLoading]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  // Only show organization loading during actual switches, not on tab focus
  const isOrganizationLoading = isSwitchingOrganization;

  const value = {
    isOrganizationLoading,
    isSwitchingOrganization,
    setIsSwitchingOrganization,
  };

  return (
    <OrganizationLoadingContext.Provider value={value}>
      {children}
      <OrganizationLoadingOverlay isVisible={isSwitchingOrganization} />
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
