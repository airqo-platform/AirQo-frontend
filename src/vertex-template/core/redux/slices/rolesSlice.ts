import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Role } from "@/app/types/roles";

export interface RolesState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  isLoading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setRoles(state, action: PayloadAction<Role[]>) {
      state.roles = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setRoles, setLoading, setError } = rolesSlice.actions;
export default rolesSlice.reducer;
