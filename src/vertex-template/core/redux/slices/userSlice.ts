import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  Network,
  UserDetails,
  CurrentRole,
  Group,
} from "@/app/types/users";
import { isSystemGroupTitle } from "@/core/config/system-group";

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

  const isSystemOrg = isSystemGroupTitle(activeGroup.grp_title);

  let context: UserContext;
  if (isSystemOrg) {
    // The system organization uses personal context with elevated permissions
    // The active system group allows RBAC checks to pass
    context = 'personal';
  } else {
    context = 'external-org';
  }

  return { context, canSwitchContext };
};

// Mirrors determineInitialUserSetup in authProvider: the active network follows
// the active group (matched by name, falling back to the first network), and
// the current role follows the network.
const applyNetworkForGroup = (state: UserState, group: Group | null) => {
  const groupTitle = group?.grp_title?.toLowerCase();
  const network = groupTitle
    ? state.availableNetworks.find(
        (n) => n.net_name.toLowerCase() === groupTitle,
      ) ?? state.availableNetworks[0] ?? null
    : null;

  state.activeNetwork = network;
  state.currentRole = network?.role
    ? {
        role_name: network.role.role_name,
        permissions: network.role.role_permissions.map((p) => p.permission),
      }
    : null;
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
        // For ALL users (staff or external), "Personal Mode" means using the system group with personal scope.
        // We find the system group from their userGroups and set it as active.
        const systemGroup = state.userGroups.find((g) => isSystemGroupTitle(g.grp_title));

        if (systemGroup) {
          state.activeGroup = systemGroup;
          applyNetworkForGroup(state, systemGroup);
          // Determine context immediately with the new group
          const { context, canSwitchContext } = determineUserContext(
            state.userDetails,
            systemGroup,
            state.userGroups
          );
          state.userContext = context;
          state.canSwitchContext = canSwitchContext;
          return;
        }

        // If no system group is found, fall back to null group (true Personal Mode)
        // This handles edge cases where a user might not belong to the system group
        state.activeGroup = null;
        state.userContext = 'personal';
        state.canSwitchContext = false;
        // When activeGroup is null, activeNetwork should also be null
        applyNetworkForGroup(state, null);
        return;
      }

      applyNetworkForGroup(state, action.payload);
      const { context, canSwitchContext } = determineUserContext(
        state.userDetails,
        action.payload,
        state.userGroups
      );
      state.userContext = context;
      state.canSwitchContext = canSwitchContext;
    },
    updateActiveGroupOnboarding(state, action: PayloadAction<Group['onboarding_checklist']>) {
      if (state.activeGroup) {
        state.activeGroup.onboarding_checklist = action.payload;
      }
      if (state.activeGroup?._id) {
        const groupIndex = state.userGroups.findIndex(g => g._id === state.activeGroup?._id);
        if (groupIndex !== -1) {
          state.userGroups[groupIndex].onboarding_checklist = action.payload;
        }
      }
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
    // Atomic initialization action to prevent UI flashes
    initializeUserData(state, action: PayloadAction<{
      userDetails: UserDetails;
      groups: Group[];
      availableNetworks: Network[];
      activeGroup: Group | null;
      activeNetwork?: Network;
      userContext: UserContext;
    }>) {
      const { userDetails, groups, availableNetworks, activeGroup, activeNetwork, userContext } = action.payload;
      
      state.userDetails = userDetails;
      state.userGroups = groups;
      state.availableNetworks = availableNetworks;
      state.activeGroup = activeGroup;
      state.userContext = userContext;
      
      if (activeNetwork) {
        state.activeNetwork = activeNetwork;
        const roleInNetwork = activeNetwork.role;
        state.currentRole = {
          role_name: roleInNetwork.role_name,
          permissions: roleInNetwork.role_permissions.map((p) => p.permission),
        };
      } else {
        state.activeNetwork = null;
        state.currentRole = null;
      }

      state.canSwitchContext = determineUserContext(userDetails, activeGroup, groups).canSwitchContext;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("persist/REHYDRATE", (state, action: {
      type: "persist/REHYDRATE";
      key?: string;
      payload?: Partial<UserState> & { user?: Partial<UserState> };
    }) => {
      if (action.key && action.key !== "user") return;

      // The user slice is persisted under its own key, so the payload is the
      // user state itself. The nested `payload.user` shape is also accepted in
      // case the slice is ever moved under a root-level persist config.
      const persisted = action.payload?.user ?? action.payload;

      // If we have userDetails from persistence, assume authenticated and initialized
      // This enables instant loading for existing users without waiting for a fresh session check
      if (persisted?.userDetails) {
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.userDetails = persisted.userDetails;

        // Also restore critical flags if they exist
        if (persisted.activeGroup) state.activeGroup = persisted.activeGroup;
        if (persisted.userContext) state.userContext = persisted.userContext;

        // availableNetworks and currentRole are derived state and not persisted;
        // rebuild them from the persisted user details and active network so a
        // rehydrated session matches a freshly initialized one.
        state.availableNetworks = persisted.userDetails.networks || [];
        const persistedNetwork = persisted.activeNetwork;
        if (persistedNetwork?.role) {
          state.currentRole = {
            role_name: persistedNetwork.role.role_name,
            permissions: persistedNetwork.role.role_permissions.map(
              (p) => p.permission,
            ),
          };
        }
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
  updateActiveGroupOnboarding,
  setUserGroups,
  setUserContext,
  setForbiddenState,
  clearForbiddenState,
  setOrganizationSwitching,
  setLoggingOut,
  initializeUserData,
} = userSlice.actions;
export default userSlice.reducer;
