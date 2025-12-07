import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  Network,
  UserDetails,
  CurrentRole,
  Group,
} from "@/app/types/users";

export type UserContext = 'personal' | 'airqo-internal' | 'external-org';
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
  isAirQoStaff: boolean;
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
  isAirQoStaff: false,
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
  // Only apply scope logic to AirQo internal context
  // External orgs and personal contexts don't use the scope concept
  if (userContext !== 'airqo-internal') {
    return 'personal';
  }
  
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
): { context: UserContext; isAirQoStaff: boolean; canSwitchContext: boolean } => {
  
  const isAirQoStaff = userDetails?.email?.endsWith('@airqo.net') || false;
  const hasMultipleOrgs = Array.isArray(userGroups) && userGroups.length > 1;
  const canSwitchContext = isAirQoStaff && hasMultipleOrgs;

  if (!userDetails || !activeGroup) {
    return { context: 'personal', isAirQoStaff, canSwitchContext };
  }

  const isAirQoOrg = activeGroup.grp_title?.toLowerCase() === 'airqo';

  let context: UserContext;
  if (isAirQoOrg) {
    context = isAirQoStaff ? 'airqo-internal' : 'personal';
  } else {
    context = 'external-org';
  }

  return { context, isAirQoStaff, canSwitchContext };
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
      const { context, isAirQoStaff, canSwitchContext } = determineUserContext(
        action.payload,
        state.activeGroup,
        action.payload.groups || []
      );
      state.userContext = context;
      state.isAirQoStaff = isAirQoStaff;
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
      state.isAirQoStaff = false;
      state.canSwitchContext = false;
      state.isInitialized = false;
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
    setActiveGroup(state, action: PayloadAction<Group | null>) {
      state.activeGroup = action.payload;
      
      if (!action.payload) {
        state.userContext = 'personal';
        state.canSwitchContext = false;
        // When activeGroup is null, activeNetwork should also be null
        state.activeNetwork = null;
        state.currentRole = null;
        return;
      }
      
      const { context, isAirQoStaff, canSwitchContext } = determineUserContext(
        state.userDetails,
        action.payload,
        state.userGroups
      );
      state.userContext = context;
      state.isAirQoStaff = isAirQoStaff;
      state.canSwitchContext = canSwitchContext;
    },
    setUserGroups(state, action: PayloadAction<Group[]>) {
      const groups = action.payload || [];
      state.userGroups = groups;
      
      // Update context when user groups change
      const { context, isAirQoStaff, canSwitchContext } = determineUserContext(
        state.userDetails,
        state.activeGroup,
        groups
      );
      state.userContext = context;
      state.isAirQoStaff = isAirQoStaff;
      state.canSwitchContext = canSwitchContext;
    },
    // New action to manually set context (for context switching)
    setUserContext(state, action: PayloadAction<UserContext>) {
      const { isAirQoStaff } = state;
      
      // Validate context change
      if (action.payload === 'airqo-internal' && !isAirQoStaff) {
        console.error('Unauthorized context change attempt: non-staff user trying to access airqo-internal');
        return; // Prevent the change
      }
      
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
