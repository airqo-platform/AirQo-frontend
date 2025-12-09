import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  Network,
  UserDetails,
  CurrentRole,
  Group,
} from "@/app/types/users";

export type UserContext = 'personal' | 'external-org';
export type UserScope = 'personal' | 'organisation';

interface ForbiddenState {
  isForbidden: boolean;
  message: string;
  timestamp: number | null;
  url: string | null;
}

interface UserState {
  isAuthenticated: boolean;
  userDetails: UserDetails | null;
  activeNetwork: Network | null;
  availableNetworks: Network[];
  currentRole: CurrentRole | null;
  userGroups: Group[];
  isInitialized: boolean;
  activeGroup: Group | null;
  userContext: UserContext | null;
  userScope: UserScope | null;
  canSwitchContext: boolean;
  forbidden: ForbiddenState;
  organizationSwitching: {
    isSwitching: boolean;
    switchingTo: string;
  };
  isLoggingOut: boolean;
}

const initialState: UserState = {
  isAuthenticated: false,
  userDetails: null,
  activeNetwork: null,
  availableNetworks: [],
  currentRole: null,
  userGroups: [],
  isInitialized: false,
  activeGroup: null,
  userContext: null,
  userScope: null,
  canSwitchContext: false,
  forbidden: {
    isForbidden: false,
    message: "",
    timestamp: null,
    url: null,
  },
  organizationSwitching: {
    isSwitching: false,
    switchingTo: "",
  },
  isLoggingOut: false,
};

// Helper function to determine user scope based on permissions
// NOTE: This requires permissions to be calculated, so it should be called 
// in components/hooks that have access to permission state, not in Redux reducers
const determineUserScope = (
  userContext: UserContext | null,
  permissions: {
    canViewSites?: boolean | null;
    canViewNetworks?: boolean | null;
    isSuperAdmin?: boolean | null;
    isSystemAdmin?: boolean | null;
  }
): UserScope => {
  // No special handling needed for personal context or permissions yet
  // This function might be deprecated or simplified if we rely solely on SidebarConfig logic
  return 'personal';
  
  // Determine if user has any organizational permissions
  const hasOrgPermissions = 
    permissions.canViewSites === true ||
    permissions.canViewNetworks === true ||
    permissions.isSuperAdmin === true ||
    permissions.isSystemAdmin === true;
  
  return hasOrgPermissions ? 'organisation' : 'personal';
};

// Helper function to determine user context
const determineUserContext = (
  userDetails: UserDetails | null,
  activeGroup: Group | null,
  userGroups: Group[] | null | undefined
): { context: UserContext; canSwitchContext: boolean } => {
  
  const hasMultipleOrgs = Array.isArray(userGroups) && userGroups.length > 1;
  // Allow context switching for any user with multiple organizations
  const canSwitchContext = hasMultipleOrgs;

  if (!userDetails || !activeGroup) {
    return { context: 'personal', canSwitchContext };
  }

  const isAirQoOrg = activeGroup.grp_title?.toLowerCase() === 'airqo';

  let context: UserContext;
  if (isAirQoOrg) {
    // AirQo organization now uses personal context with elevated permissions
    // The active airqo group allows RBAC checks to pass
    context = 'personal';
  } else {
    context = 'external-org';
  }

  return { context, canSwitchContext };
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails(state: UserState, action: PayloadAction<UserDetails>) {
      // Ensure we have a valid payload
      if (!action.payload) {
        return;
      }
      
      state.userDetails = action.payload;
      state.isAuthenticated = true;
      state.availableNetworks = action.payload.networks || [];
      state.userGroups = action.payload.groups || [];
      
      // Update context when user details change
      const { context, canSwitchContext } = determineUserContext(
        action.payload,
        state.activeGroup,
        action.payload.groups || []
      );
      state.userContext = context;
      state.canSwitchContext = canSwitchContext;
    },
    setActiveNetwork(state: UserState, action: PayloadAction<Network>) {
      state.activeNetwork = action.payload;
      // Set current role based on active network
      const roleInNetwork = action.payload.role;
      state.currentRole = {
        role_name: roleInNetwork.role_name,
        permissions: roleInNetwork.role_permissions.map((p) => p.permission),
      };
    },
    setAvailableNetworks(state: UserState, action: PayloadAction<Network[]>) {
      state.availableNetworks = action.payload;
    },
    logout(state: UserState) {
      state.isAuthenticated = false;
      state.userDetails = null;
      state.activeNetwork = null;
      state.availableNetworks = [];
      state.currentRole = null;
      state.userContext = null;
      state.userScope = null;
      state.canSwitchContext = false;
      state.isInitialized = false;
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
    setActiveGroup(state, action: PayloadAction<Group | null>) {
      state.activeGroup = action.payload;
      
      if (!action.payload) {
        // For ALL users (staff or external), "Personal Mode" means using the AirQo group with personal scope.
        // We find the AirQo group from their userGroups and set it as active.
        const airqoGroup = state.userGroups.find((g) => g.grp_title.toLowerCase() === 'airqo');

        if (airqoGroup) {
          state.activeGroup = airqoGroup;
          // Determine context immediately with the new group
          const { context, canSwitchContext } = determineUserContext(
            state.userDetails,
            airqoGroup,
            state.userGroups
          );
          state.userContext = context;
          state.canSwitchContext = canSwitchContext;
          return;
        }

        // If no AirQo group is found, fall back to null group (true Personal Mode)
        // This handles edge cases where a user might not belong to AirQo
        state.activeGroup = null;
        state.userContext = 'personal';
        state.canSwitchContext = false;
        // When activeGroup is null, activeNetwork should also be null
        state.activeNetwork = null;
        state.currentRole = null;
        return;
      }
      
      const { context, canSwitchContext } = determineUserContext(
        state.userDetails,
        action.payload,
        state.userGroups
      );
      state.userContext = context;
      state.canSwitchContext = canSwitchContext;
    },
    setUserGroups(state, action: PayloadAction<Group[]>) {
      const groups = action.payload || [];
      state.userGroups = groups;
      
      // Update context when user groups change
      const { context, canSwitchContext } = determineUserContext(
        state.userDetails,
        state.activeGroup,
        groups
      );
      state.userContext = context;
      state.canSwitchContext = canSwitchContext;
    },
    // New action to manually set context (for context switching)
    setUserContext(state, action: PayloadAction<UserContext>) {
      state.userContext = action.payload;
    },
    // Forbidden state actions
    setForbiddenState(state, action: PayloadAction<{ message: string; timestamp: number; url: string }>) {
      state.forbidden = {
        isForbidden: true,
        message: action.payload.message,
        timestamp: action.payload.timestamp,
        url: action.payload.url,
      };
    },
    clearForbiddenState(state) {
      state.forbidden = {
        isForbidden: false,
        message: "",
        timestamp: null,
        url: null,
      };
    },
    setOrganizationSwitching: (state, action: PayloadAction<{ isSwitching: boolean; switchingTo: string }>) => {
      state.organizationSwitching = action.payload;
    },
    setLoggingOut(state, action: PayloadAction<boolean>) {
      state.isLoggingOut = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("persist/REHYDRATE", (state, action: any) => {
      // If we have userDetails from persistence, assume authenticated and initialized
      // This enables instant loading for existing users without waiting for a fresh session check
      if (action.payload?.user?.userDetails) {
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.userDetails = action.payload.user.userDetails;
        
        // Also restore critical flags if they exist
        if (action.payload.user.activeGroup) state.activeGroup = action.payload.user.activeGroup;
        if (action.payload.user.userContext) state.userContext = action.payload.user.userContext;
      }
    });
  },
});

export const {
  setUserDetails,
  setActiveNetwork,
  logout,
  setAvailableNetworks,
  setInitialized,
  setActiveGroup,
  setUserGroups,
  setUserContext,
  setForbiddenState,
  clearForbiddenState,
  setOrganizationSwitching,
  setLoggingOut,
} = userSlice.actions;
export default userSlice.reducer;
