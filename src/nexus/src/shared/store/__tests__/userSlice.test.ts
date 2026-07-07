import type { Reducer } from '@reduxjs/toolkit';
import reducer, {
  setUser,
  setGroups,
  setActiveGroup,
  setActiveGroupById,
  setLoading,
  setError,
  setLoggingOut,
  startPendingGroupSwitch,
  clearPendingGroupSwitch,
  clearUser,
} from '../userSlice';
import type { NormalizedUser, NormalizedGroup } from '../../utils/userUtils';

type UserState = {
  user: NormalizedUser | null;
  groups: NormalizedGroup[];
  activeGroup: NormalizedGroup | null;
  pendingGroupSwitch: {
    targetGroupId: string;
    targetGroupName: string;
    destinationPath: string;
    startedAt: string;
  } | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  error: string | null;
};

const userReducer = reducer as Reducer<UserState>;

const mockUser: NormalizedUser = {
  id: 'u1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  userName: 'johndoe',
  profilePicture: '',
  isActive: true,
  verified: true,
  country: 'UG',
  organization: 'AirQo',
  jobTitle: 'Engineer',
  description: '',
  lastLogin: '2025-01-01',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockUser2: NormalizedUser = {
  id: 'u2',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  userName: 'janesmith',
  profilePicture: 'pic.jpg',
  isActive: true,
  verified: false,
  country: 'KE',
  organization: 'AirQo',
  jobTitle: 'Manager',
  description: 'desc',
  lastLogin: '2025-06-01',
  createdAt: '2025-06-01',
  updatedAt: '2025-06-01',
};

const mockGroup: NormalizedGroup = {
  id: 'g1',
  title: 'Test Group',
  organizationSlug: 'airqo',
  profilePicture: '',
  createdAt: '2025-01-01',
  status: 'active',
  userType: 'admin',
};

const mockGroup2: NormalizedGroup = {
  id: 'g2',
  title: 'Other Group',
  organizationSlug: 'other',
  profilePicture: '',
  createdAt: '2025-01-01',
  status: 'active',
  userType: 'member',
};

const mockGroup3: NormalizedGroup = {
  id: 'g3',
  title: 'Third Group',
  organizationSlug: 'third',
  profilePicture: '',
  createdAt: '2025-01-01',
  status: 'active',
  userType: 'member',
};

const initialState: UserState = {
  user: null,
  groups: [],
  activeGroup: null,
  pendingGroupSwitch: null,
  isLoading: false,
  isLoggingOut: false,
  error: null,
};

describe('userSlice', () => {
  it('returns the initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setUser', () => {
    it('sets user and clears error', () => {
      const state = userReducer(
        { ...initialState, error: 'some error' },
        setUser(mockUser)
      );
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it('overwrites existing user', () => {
      const stateWithUser = { ...initialState, user: mockUser };
      const state = userReducer(stateWithUser, setUser(mockUser2));
      expect(state.user).toEqual(mockUser2);
      expect(state.error).toBeNull();
    });
  });

  describe('setGroups', () => {
    it('sets groups and sets activeGroup to default airqo group', () => {
      const state = userReducer(
        initialState,
        setGroups([mockGroup, mockGroup2])
      );
      expect(state.groups).toEqual([mockGroup, mockGroup2]);
      expect(state.activeGroup).toEqual(mockGroup);
    });

    it('preserves existing activeGroup if it exists in new groups', () => {
      const stateWithActive = {
        ...initialState,
        activeGroup: mockGroup2,
      };
      const updatedGroup2 = { ...mockGroup2, title: 'Updated' };
      const state = userReducer(
        stateWithActive,
        setGroups([mockGroup, updatedGroup2])
      );
      expect(state.activeGroup).toEqual(updatedGroup2);
    });

    it('sets first group as active if no airqo group found', () => {
      const state = userReducer(
        initialState,
        setGroups([mockGroup2, mockGroup3])
      );
      expect(state.activeGroup).toEqual(mockGroup2);
    });

    it('sets activeGroup null for empty array', () => {
      const stateWithActive = {
        ...initialState,
        activeGroup: mockGroup,
      };
      const state = userReducer(stateWithActive, setGroups([]));
      expect(state.groups).toEqual([]);
      expect(state.activeGroup).toBeNull();
    });
  });

  describe('setActiveGroup', () => {
    it('sets activeGroup', () => {
      const state = userReducer(initialState, setActiveGroup(mockGroup));
      expect(state.activeGroup).toEqual(mockGroup);
    });
  });

  describe('setActiveGroupById', () => {
    it('finds group by id and sets it active', () => {
      const stateWithGroups = {
        ...initialState,
        groups: [mockGroup, mockGroup2],
      };
      const state = userReducer(stateWithGroups, setActiveGroupById('g2'));
      expect(state.activeGroup).toEqual(mockGroup2);
    });

    it('does nothing if group id not found', () => {
      const stateWithGroups = {
        ...initialState,
        groups: [mockGroup, mockGroup2],
      };
      const state = userReducer(
        stateWithGroups,
        setActiveGroupById('nonexistent')
      );
      expect(state.activeGroup).toBeNull();
    });

    it('does nothing when groups is empty', () => {
      const state = userReducer(initialState, setActiveGroupById('g1'));
      expect(state.activeGroup).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets isLoading true', () => {
      const state = userReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('sets isLoading false', () => {
      const stateWithLoading = { ...initialState, isLoading: true };
      const state = userReducer(stateWithLoading, setLoading(false));
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error and sets isLoading false', () => {
      const state = userReducer(
        { ...initialState, isLoading: true },
        setError('something went wrong')
      );
      expect(state.error).toBe('something went wrong');
      expect(state.isLoading).toBe(false);
    });

    it('null clears error', () => {
      const stateWithError = { ...initialState, error: 'old error' };
      const state = userReducer(stateWithError, setError(null));
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoggingOut', () => {
    it('sets isLoggingOut true', () => {
      const state = userReducer(initialState, setLoggingOut(true));
      expect(state.isLoggingOut).toBe(true);
    });

    it('sets isLoggingOut false', () => {
      const stateWithLogout = { ...initialState, isLoggingOut: true };
      const state = userReducer(stateWithLogout, setLoggingOut(false));
      expect(state.isLoggingOut).toBe(false);
    });
  });

  describe('startPendingGroupSwitch', () => {
    it('sets pendingGroupSwitch', () => {
      const pending = {
        targetGroupId: 'g2',
        targetGroupName: 'Other',
        destinationPath: '/analytics',
        startedAt: '2025-01-01T00:00:00.000Z',
      };
      const state = userReducer(initialState, startPendingGroupSwitch(pending));
      expect(state.pendingGroupSwitch).toEqual(pending);
    });
  });

  describe('clearPendingGroupSwitch', () => {
    it('sets pendingGroupSwitch null', () => {
      const pending = {
        targetGroupId: 'g2',
        targetGroupName: 'Other',
        destinationPath: '/analytics',
        startedAt: '2025-01-01T00:00:00.000Z',
      };
      const stateWithPending = { ...initialState, pendingGroupSwitch: pending };
      const state = userReducer(stateWithPending, clearPendingGroupSwitch());
      expect(state.pendingGroupSwitch).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('resets user/groups/activeGroup/pendingGroupSwitch/error but preserves isLoggingOut', () => {
      const fullState: UserState = {
        user: mockUser,
        groups: [mockGroup],
        activeGroup: mockGroup,
        pendingGroupSwitch: {
          targetGroupId: 'g2',
          targetGroupName: 'Other',
          destinationPath: '/analytics',
          startedAt: '2025-01-01T00:00:00.000Z',
        },
        isLoading: false,
        isLoggingOut: true,
        error: 'some error',
      };
      const state = userReducer(fullState, clearUser());
      expect(state.user).toBeNull();
      expect(state.groups).toEqual([]);
      expect(state.activeGroup).toBeNull();
      expect(state.pendingGroupSwitch).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoggingOut).toBe(true);
    });

    it('preserves isLoading', () => {
      const stateWithLoading: UserState = {
        user: mockUser,
        groups: [mockGroup],
        activeGroup: mockGroup,
        pendingGroupSwitch: null,
        isLoading: true,
        isLoggingOut: false,
        error: null,
      };
      const state = userReducer(stateWithLoading, clearUser());
      expect(state.isLoading).toBe(true);
      expect(state.user).toBeNull();
      expect(state.groups).toEqual([]);
      expect(state.activeGroup).toBeNull();
    });
  });
});
