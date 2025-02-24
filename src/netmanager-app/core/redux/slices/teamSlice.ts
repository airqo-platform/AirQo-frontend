import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { GroupMember } from "@/app/types/groups";

export interface TeamState {
  team: GroupMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  team: [],
  isLoading: false,
  error: null,
};

const teamMembersSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setTeamMember(state, action: PayloadAction<GroupMember[]>) {
      state.team = action.payload;
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

export const { setTeamMember, setLoading, setError } = teamMembersSlice.actions;
export default teamMembersSlice.reducer;
