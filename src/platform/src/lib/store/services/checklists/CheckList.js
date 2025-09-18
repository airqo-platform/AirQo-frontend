import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserChecklists, upsertUserChecklists } from '@/core/apis/Account';
import logger from '@/lib/logger';

const initialState = {
  checklist: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastUpdated: null,
};

// Fetch user checklist; initialize if none and refetch for _id
export const fetchUserChecklists = createAsyncThunk(
  'checklists/fetchUserChecklists',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) throw new Error('User ID is required');

      let response;
      try {
        // Try fetching existing checklists
        response = await getUserChecklists(userId);
      } catch (fetchError) {
        // If the request fails with 404 or other errors, we'll initialize
        logger.warn('Checklist fetch failed, will initialize:', {
          userId,
          error: fetchError.message,
        });
        response = { success: true, checklists: [] }; // Treat as empty
      }

      // Handle both explicit errors and "no checklists found" cases
      if (
        !response.success ||
        (response.message &&
          response.message.includes('no checklists found')) ||
        !response.checklists ||
        response.checklists.length === 0
      ) {
        logger.info(
          'No existing checklist found, initializing for user:',
          userId,
        );

        // Initialize four blank items with proper structure
        const initialItems = [1, 2, 3, 4].map((index) => ({
          title: '',
          completed: false,
          completionDate: '',
          videoProgress: 0,
          status: 'not started',
          position: index - 1, // 0-based position
        }));

        try {
          // Upsert to create in DB
          const upsertResponse = await upsertUserChecklists({
            user_id: userId,
            items: initialItems,
          });

          if (!upsertResponse.success) {
            logger.error('Failed to initialize checklist:', {
              userId,
              error: upsertResponse.message,
            });
            // Return basic items without _id as fallback
            return initialItems;
          }

          // Refetch to retrieve generated _id values
          try {
            const newResp = await getUserChecklists(userId);
            if (newResp.success && newResp.checklists?.length > 0) {
              const items = newResp.checklists[0].items || [];
              logger.info('Successfully initialized and fetched checklist:', {
                userId,
                itemCount: items.length,
              });
              return items;
            }
          } catch (refetchError) {
            logger.warn('Refetch after initialization failed:', {
              userId,
              error: refetchError.message,
            });
          }

          // If refetch fails, return the basic items
          return initialItems;
        } catch (initError) {
          logger.error('Failed to initialize checklist:', {
            userId,
            error: initError.message,
          });
          // Return basic items as final fallback
          return initialItems;
        }
      }

      // User has existing checklists
      const items = response.checklists[0].items || [];
      logger.info('Fetched existing checklist:', {
        userId,
        itemCount: items.length,
      });
      return items;
    } catch (error) {
      logger.error('Error in fetchUserChecklists:', error);
      return rejectWithValue(error.message || 'Error fetching checklists');
    }
  },
);

// Update a single checklist item
export const updateTaskProgress = createAsyncThunk(
  'checklists/updateTaskProgress',
  async (updateData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const existing = state.cardChecklist.checklist;

      if (!Array.isArray(existing) || existing.length === 0) {
        return rejectWithValue(
          'Checklist is empty or not properly initialized',
        );
      }

      // User ID should be passed in the updateData
      const userId = updateData.userId;
      if (!userId) return rejectWithValue('User ID is required');
      delete updateData.userId; // Remove userId from the update data before applying to items

      // Find and update item
      const index = existing.findIndex((item) => item._id === updateData._id);
      if (index === -1) return rejectWithValue('Checklist item not found');

      const updatedList = [...existing];
      updatedList[index] = { ...updatedList[index], ...updateData };

      // Enforce status logic
      if (
        !updatedList[index].completed &&
        updatedList[index].status === 'not started'
      ) {
        updatedList[index].status = 'inProgress';
      }
      if (updateData.completed) {
        updatedList[index].status = 'completed';
        updatedList[index].completionDate =
          updatedList[index].completionDate || new Date().toISOString();
      }

      // Upsert full list
      const response = await upsertUserChecklists({
        user_id: userId,
        items: updatedList,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update checklist');
      }

      return updatedList;
    } catch (error) {
      logger.error('Error in updateTaskProgress:', error);
      return rejectWithValue(error.message || 'Failed to update checklist');
    }
  },
);

export const checklistSlice = createSlice({
  name: 'cardChecklist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserChecklists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserChecklists.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.checklist = payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserChecklists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch checklists';
      })
      .addCase(updateTaskProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTaskProgress.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.checklist = payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateTaskProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update checklist';
      });
  },
});

export const selectAllChecklist = (state) => state.cardChecklist.checklist;
export const selectChecklistStatus = (state) => state.cardChecklist.status;
export const selectChecklistError = (state) => state.cardChecklist.error;
export const selectCompletedCount = (state) =>
  state.cardChecklist.checklist.filter((item) => item.completed).length;

export default checklistSlice.reducer;
