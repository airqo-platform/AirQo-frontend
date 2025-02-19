import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { UserDetails } from "@/app/types/users";

interface Groups {
    _id: string
    grp_status: "ACTIVE" | "INACTIVE"
    grp_profile_picture: string
    grp_title: string
    grp_description: string
    grp_website: string
    grp_industry: string
    grp_country: string
    grp_timezone: string
    createdAt: string
    numberOfGroupUsers: number
    grp_users: UserDetails[]
    grp_manager: UserDetails
  }

export interface GroupsDetailState {
  group: Groups[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsDetailState = {
    group: [],
    isLoading: false,
    error: null,
};

const groupDetailsSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setGroup(state, action: PayloadAction<Groups[]>) {
      state.group = action.payload;
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

export const { setGroup, setLoading, setError } = groupDetailsSlice.actions;
export default groupDetailsSlice.reducer;
