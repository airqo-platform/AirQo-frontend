import { createSlice } from '@reduxjs/toolkit';

const currentAirqloudSlice = createSlice({
  name: 'currentAirqloud',
  initialState: {
    _id: '',
    name: '',
    long_name: '',
    sites: [],
  },
  reducers: {
    setCurrentAirqloud: (state, action) => {
      const { _id, long_name, name, sites } = action.payload;

      state._id = _id;
      state.name = name;
      state.long_name = long_name;
      state.sites = sites;
    },
  },
});

export const { setCurrentAirqloud } = currentAirqloudSlice.actions;
export default currentAirqloudSlice.reducer;
