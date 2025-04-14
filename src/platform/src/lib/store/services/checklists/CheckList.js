import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserChecklists, upsertUserChecklists } from '@/core/apis/Account';

const initialState = {
  checklist: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastUpdated: null,
};

// Fetch checklist data for a user
export const fetchUserChecklists = createAsyncThunk(
  'checklists/fetchUserChecklists',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) return rejectWithValue('User ID is required');

      const response = await getUserChecklists(userId);

      if (!response.success) {
        return rejectWithValue(
          response.message || 'Failed to fetch checklists',
        );
      }

      if (response.checklists && response.checklists.length > 0) {
        return response.checklists[0].items || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching checklists:', error);
      return rejectWithValue(
        error.message || 'An error occurred fetching checklists',
      );
    }
  },
);

// Update a checklist item
export const updateTaskProgress = createAsyncThunk(
  'checklists/updateTaskProgress',
  async (updateData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { checklist } = state.cardChecklist;

      // Get user ID from localStorage
      let userId = null;
      try {
        const storedUser = localStorage.getItem('loggedUser');
        if (storedUser && storedUser !== 'undefined') {
          userId = JSON.parse(storedUser)._id;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        return rejectWithValue('User ID not found');
      }

      if (!userId) return rejectWithValue('User ID is required');

      // Find item to update by _id
      const itemIndex = checklist.findIndex(
        (item) => item._id === updateData._id,
      );
      if (itemIndex === -1) return rejectWithValue('Checklist item not found');

      // Create updated copy of the checklist
      const updatedChecklist = [...checklist];

      // Apply updates to the specific item
      updatedChecklist[itemIndex] = {
        ...updatedChecklist[itemIndex],
        ...updateData,
      };

      // Always ensure status is set to inProgress if not completed
      if (
        !updatedChecklist[itemIndex].completed &&
        updatedChecklist[itemIndex].status === 'not started'
      ) {
        updatedChecklist[itemIndex].status = 'inProgress';
      }

      // If completing the item, ensure proper status
      if (updateData.completed) {
        updatedChecklist[itemIndex].status = 'completed';
        updatedChecklist[itemIndex].completionDate =
          updatedChecklist[itemIndex].completionDate ||
          new Date().toISOString();
      }

      // Prepare the payload for API
      const apiPayload = {
        user_id: userId,
        items: updatedChecklist,
      };

      // Send update to API
      await upsertUserChecklists(apiPayload);

      // Return updated checklist for Redux state
      return updatedChecklist;
    } catch (error) {
      console.error('Error updating checklist:', error);
      return rejectWithValue(error.message || 'Failed to update checklist');
    }
  },
);

// Redux slice definition
export const checklistSlice = createSlice({
  name: 'cardChecklist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchUserChecklists
      .addCase(fetchUserChecklists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserChecklists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.checklist = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchUserChecklists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch checklists';
      })

      // Handle updateTaskProgress
      .addCase(updateTaskProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.checklist = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateTaskProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update task progress';
      });
  },
});

// Selectors
export const selectAllChecklist = (state) => state.cardChecklist.checklist;
export const selectChecklistStatus = (state) => state.cardChecklist.status;
export const selectChecklistError = (state) => state.cardChecklist.error;
export const selectCompletedCount = (state) =>
  state.cardChecklist.checklist.filter((item) => item.completed).length;

export default checklistSlice.reducer;
