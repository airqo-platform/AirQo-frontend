import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  Network,
  UserDetails,
  CurrentRole,
  Group,
} from "@/app/types/users";

export type UserContext = 'personal' | 'airqo-internal' | 'external-org';

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
  isAirQoStaff: boolean;
  canSwitchContext: boolean;
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
  isAirQoStaff: false,
  canSwitchContext: false,
};

// Helper function to determine user context
const determineUserContext = (
  userDetails: UserDetails | null,
  activeGroup: Group | null,
  userGroups: Group[]
): { context: UserContext; isAirQoStaff: boolean; canSwitchContext: boolean } => {
  if (!userDetails || !activeGroup) {
    return { context: 'personal', isAirQoStaff: false, canSwitchContext: false };
  }

  const isAirQoStaff = userDetails.email?.endsWith('@airqo.net') || false;
  const isAirQoOrg = activeGroup.grp_title?.toLowerCase() === 'airqo';
  const hasMultipleOrgs = userGroups.length > 1;

  let context: UserContext;
  if (isAirQoOrg) {
    context = isAirQoStaff ? 'airqo-internal' : 'personal';
  } else {
    context = 'external-org';
  }

  const canSwitchContext = isAirQoStaff && hasMultipleOrgs;

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
      state.isAirQoStaff = false;
      state.canSwitchContext = false;
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
    setActiveGroup(state, action: PayloadAction<Group>) {
      state.activeGroup = action.payload;
      
      // Update context when active group changes
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
      state.userGroups = action.payload;
      
      // Update context when user groups change
      const { context, isAirQoStaff, canSwitchContext } = determineUserContext(
        state.userDetails,
        state.activeGroup,
        action.payload
      );
      state.userContext = context;
      state.isAirQoStaff = isAirQoStaff;
      state.canSwitchContext = canSwitchContext;
    },
    // New action to manually set context (for context switching)
    setUserContext(state, action: PayloadAction<UserContext>) {
      state.userContext = action.payload;
    },
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
} = userSlice.actions;
export default userSlice.reducer;
