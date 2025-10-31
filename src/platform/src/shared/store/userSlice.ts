import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NormalizedUser, NormalizedGroup } from '../utils/userUtils';

interface UserState {
  user: NormalizedUser | null;
  groups: NormalizedGroup[];
  activeGroup: NormalizedGroup | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  groups: [],
  activeGroup: null,
  isLoading: false,
  isLoggingOut: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<NormalizedUser>) => {
      state.user = action.payload;
      state.error = null;
    },
    setGroups: (state, action: PayloadAction<NormalizedGroup[]>) => {
      state.groups = action.payload;

      // Preserve existing active group if it exists in the new groups
      if (state.activeGroup) {
        const existingGroup = action.payload.find(
          g => g.id === state.activeGroup!.id
        );
        if (existingGroup) {
          state.activeGroup = existingGroup;
          return;
        }
      }

      // Set default AIRQO group if no valid active group
      const defaultGroup =
        action.payload.find(group => group.organizationSlug === 'airqo') ||
        action.payload[0];

      if (defaultGroup) {
        state.activeGroup = defaultGroup;
      }
    },
    setActiveGroup: (state, action: PayloadAction<NormalizedGroup>) => {
      state.activeGroup = action.payload;
    },
    setActiveGroupById: (state, action: PayloadAction<string>) => {
      const group = state.groups.find(g => g.id === action.payload);
      if (group) {
        state.activeGroup = group;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setLoggingOut: (state, action: PayloadAction<boolean>) => {
      state.isLoggingOut = action.payload;
    },
    clearUser: state => {
      state.user = null;
      state.groups = [];
      state.activeGroup = null;
      state.error = null;
      // Don't reset isLoggingOut here - it should be managed separately
    },
  },
});

export const {
  setUser,
  setGroups,
  setActiveGroup,
  setActiveGroupById,
  setLoading,
  setError,
  setLoggingOut,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
