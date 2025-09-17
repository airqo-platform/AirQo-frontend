/**
 * Test script to verify checklist initialization and error handling
 * This script simulates the checklist initialization flow for debugging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import checklistReducer, {
  fetchUserChecklists,
  updateTaskProgress,
} from '../lib/store/services/checklists/CheckList';
import { getUserChecklists, upsertUserChecklists } from '../core/apis/Account';

// Mock the API functions
vi.mock('../core/apis/Account', () => ({
  getUserChecklists: vi.fn(),
  upsertUserChecklists: vi.fn(),
}));

// Mock logger
vi.mock('../lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Checklist Initialization', () => {
  let store;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cardChecklist: checklistReducer,
      },
    });
    vi.clearAllMocks();
  });

  it('should handle new user with no checklist (404 case)', async () => {
    // Simulate 404 error from API (no checklists found)
    getUserChecklists.mockRejectedValueOnce(
      new Error('404: No checklists found'),
    );

    // Mock successful upsert
    upsertUserChecklists.mockResolvedValueOnce({
      success: true,
      message: 'Checklist created successfully',
    });

    // Mock successful refetch with _id values
    getUserChecklists.mockResolvedValueOnce({
      success: true,
      checklists: [
        {
          items: [
            {
              _id: 'item1',
              title: '',
              completed: false,
              status: 'not started',
              position: 0,
            },
            {
              _id: 'item2',
              title: '',
              completed: false,
              status: 'not started',
              position: 1,
            },
            {
              _id: 'item3',
              title: '',
              completed: false,
              status: 'not started',
              position: 2,
            },
            {
              _id: 'item4',
              title: '',
              completed: false,
              status: 'not started',
              position: 3,
            },
          ],
        },
      ],
    });

    const action = await store.dispatch(fetchUserChecklists(testUserId));

    expect(action.type).toBe(fetchUserChecklists.fulfilled.type);
    expect(action.payload).toHaveLength(4);
    expect(action.payload[0]._id).toBe('item1');

    const state = store.getState().cardChecklist;
    expect(state.status).toBe('succeeded');
    expect(state.checklist).toHaveLength(4);
  });

  it('should handle empty checklist response', async () => {
    // Mock API returning success but empty checklists
    getUserChecklists.mockResolvedValueOnce({
      success: true,
      message: 'no checklists found for this search',
      checklists: [],
    });

    // Mock successful upsert
    upsertUserChecklists.mockResolvedValueOnce({
      success: true,
      message: 'Checklist created successfully',
    });

    // Mock successful refetch
    getUserChecklists.mockResolvedValueOnce({
      success: true,
      checklists: [
        {
          items: [
            {
              _id: 'item1',
              title: '',
              completed: false,
              status: 'not started',
              position: 0,
            },
            {
              _id: 'item2',
              title: '',
              completed: false,
              status: 'not started',
              position: 1,
            },
            {
              _id: 'item3',
              title: '',
              completed: false,
              status: 'not started',
              position: 2,
            },
            {
              _id: 'item4',
              title: '',
              completed: false,
              status: 'not started',
              position: 3,
            },
          ],
        },
      ],
    });

    const action = await store.dispatch(fetchUserChecklists(testUserId));

    expect(action.type).toBe(fetchUserChecklists.fulfilled.type);
    expect(action.payload).toHaveLength(4);

    // Verify initialization was called
    expect(upsertUserChecklists).toHaveBeenCalledWith({
      user_id: testUserId,
      items: expect.arrayContaining([
        expect.objectContaining({
          title: '',
          completed: false,
          status: 'not started',
          position: 0,
        }),
      ]),
    });
  });

  it('should handle existing checklist successfully', async () => {
    const existingChecklist = {
      success: true,
      checklists: [
        {
          items: [
            {
              _id: 'existing1',
              title: 'Step 1',
              completed: true,
              status: 'completed',
              position: 0,
            },
            {
              _id: 'existing2',
              title: 'Step 2',
              completed: false,
              status: 'not started',
              position: 1,
            },
            {
              _id: 'existing3',
              title: 'Step 3',
              completed: false,
              status: 'not started',
              position: 2,
            },
            {
              _id: 'existing4',
              title: 'Step 4',
              completed: false,
              status: 'not started',
              position: 3,
            },
          ],
        },
      ],
    };

    getUserChecklists.mockResolvedValueOnce(existingChecklist);

    const action = await store.dispatch(fetchUserChecklists(testUserId));

    expect(action.type).toBe(fetchUserChecklists.fulfilled.type);
    expect(action.payload).toHaveLength(4);
    expect(action.payload[0].completed).toBe(true);

    // Verify no initialization was called since checklist exists
    expect(upsertUserChecklists).not.toHaveBeenCalled();
  });

  it('should handle initialization failure gracefully', async () => {
    // Mock API failure
    getUserChecklists.mockRejectedValueOnce(new Error('Network error'));

    // Mock upsert failure
    upsertUserChecklists.mockResolvedValueOnce({
      success: false,
      message: 'Database error',
    });

    const action = await store.dispatch(fetchUserChecklists(testUserId));

    expect(action.type).toBe(fetchUserChecklists.fulfilled.type);
    expect(action.payload).toHaveLength(4);
    // Should return basic items without _id as fallback
    expect(action.payload[0]._id).toBeUndefined();
  });

  it('should update task progress correctly', async () => {
    // First set up initial state
    const initialItems = [
      {
        _id: 'item1',
        title: '',
        completed: false,
        status: 'not started',
        position: 0,
      },
      {
        _id: 'item2',
        title: '',
        completed: false,
        status: 'not started',
        position: 1,
      },
    ];

    store.dispatch({
      type: fetchUserChecklists.fulfilled.type,
      payload: initialItems,
    });

    // Mock successful update
    upsertUserChecklists.mockResolvedValueOnce({
      success: true,
      message: 'Updated successfully',
    });

    const updateData = {
      _id: 'item1',
      completed: true,
      status: 'completed',
      userId: testUserId,
    };

    const action = await store.dispatch(updateTaskProgress(updateData));

    expect(action.type).toBe(updateTaskProgress.fulfilled.type);
    expect(action.payload[0].completed).toBe(true);
    expect(action.payload[0].status).toBe('completed');
    expect(action.payload[0].completionDate).toBeDefined();
  });
});
