import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postUserCreationDetails, createOrganisation, updateOrganisationApi } from '@/core/apis/Account';

const initialState = {
  userData: { firstName: '', lastName: '', email: '', },
  orgData: {
    grp_title: '',
    grp_website: '',
    grp_description: '',
    user_id: ''
  },
  orgUpdate: {
    grp_industry: '',
    grp_country: '',
    grp_timezone: '',
    grp_locations: [],
    grp_id:''
  },
  password: '',
  errors: null,
  success: false,
  user_id: undefined,
  org_creation_response: [],
  org_update_response: []
};

export const createUser = createAsyncThunk('account/creation', async (postData, { rejectWithValue }) => {
  // const appendedData = {
  //   organization: 'airqo',
  //   long_organization: 'clean air for all African cities',
  //   privilege: 'admin',
  // };
  // const createUserData = { ...postData, ...appendedData };
  try {
    const response = await postUserCreationDetails(postData);
    return response
  } catch (error) {
    if (!error.response) {
      throw error
    }
    return rejectWithValue(error.response.data);
  }
});

export const postOrganisationCreationDetails = createAsyncThunk('/organisation/creation', async (postData, { rejectWithValue }) => {
  try {
    const response = await createOrganisation(postData);
    return response;
  }
  catch (error) {
    if (!error.response) {
      throw error
    }
    return rejectWithValue(error.response)
  }
})

export const updateOrganisationDetails = createAsyncThunk('/organisation/update', async (postData, id) => {
  const response = await updateOrganisationApi(postData, id);
  return response;


})

export const createAccountSlice = createSlice({
  name: 'creation',
  initialState,
  reducers: {
    setUserEmail: (state, action) => {
      state.userData.email = action.payload;
    },
    setUserFirstName: (state, action) => {
      state.userData.firstName = action.payload;
    },
    setUserLastName: (state, action) => {
      state.userData.lastName = action.payload;
    },
    setUserPassword: (state, action) => {
      state.password = action.payload;
    },
    setOrgDetails: (state, action) => {
      state.orgData = action.payload;
    },
    setOrgUpdateDetails: (state, action) => {
      state.orgUpdate = action.payload;
    },
    setUserId: (state, action) => {
      state.user_id = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.fulfilled, (state, action) => {
        state.userData = action.meta.arg;
        state.success = true;
      })
      .addCase(createUser.pending, (state, action) => {
        state.success = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.errors = action.payload.errors;
        state.success = action.payload.success;
      })
      .addCase(postOrganisationCreationDetails.fulfilled, (state, action) => {
        state.org_creation_response = action.payload.created_group;
        state.success = action.payload.success;
      })
      .addCase(postOrganisationCreationDetails.pending, (state, action) => {
        state.success = false;
      })
      .addCase(postOrganisationCreationDetails.rejected, (state, action) => {
        state.errors = action.payload.errors;
        state.success = action.payload.success;
      })
      .addCase(updateOrganisationDetails.fulfilled, (state, action) => {
        state.org_update_response = action.payload;
        state.success = true;
      })
      .addCase(updateOrganisationDetails.pending, (state) => {
        state.success = false;
      })
      .addCase(updateOrganisationDetails.rejected, (state, action) => {
        state.errors = action.payload;
        state.success = false;
      });
  },
});

export const { setUserEmail, setUserFirstName, setUserLastName, setUserPassword, setOrgDetails, setUserId, setOrgUpdateDetails } =
  createAccountSlice.actions;

export default createAccountSlice.reducer;
