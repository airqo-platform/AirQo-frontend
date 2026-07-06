import type { RootState } from '../index';
import {
  selectUser,
  selectGroups,
  selectActiveGroup,
  selectPendingGroupSwitch,
  selectUserLoading,
  selectLoggingOut,
  selectUserError,
  selectDialogStack,
  selectTopDialog,
  selectIsDialogOpen,
  selectSelectedSites,
  selectInsightsLoading,
  selectInsightsError,
  selectActiveGroupCohorts,
  selectCohortsLoading,
  selectCohortsError,
  selectLastFetchedGroupId,
  selectMapStyle,
  selectNodeType,
  selectMapSettings,
} from '../selectors';

const mockState: RootState = {
  theme: {} as RootState['theme'],
  ui: {} as RootState['ui'],
  selectedLocation: {} as RootState['selectedLocation'],
  analytics: {} as RootState['analytics'],
  user: {
    user: {
      _id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
    groups: [
      { id: 'group-1', name: 'Group One', organizationSlug: 'org-one' },
      { id: 'group-2', name: 'Group Two', organizationSlug: 'org-two' },
    ],
    activeGroup: {
      id: 'group-1',
      name: 'Group One',
      organizationSlug: 'org-one',
    },
    pendingGroupSwitch: {
      targetGroupId: 'group-2',
      targetGroupName: 'Group Two',
      destinationPath: '/dashboard',
      startedAt: '2026-01-01T00:00:00Z',
    },
    isLoading: true,
    isLoggingOut: false,
    error: 'Something went wrong',
  },
  insights: {
    dialogStack: [
      { id: 'dialog-1', type: 'more-insights' },
      { id: 'dialog-2', type: 'add-location', data: { foo: 'bar' } },
    ],
    selectedSites: [
      { _id: 'site-1', name: 'Site A', country: 'UG' },
      { _id: 'site-2', name: 'Site B', city: 'Kampala' },
    ],
    isLoading: true,
    error: 'Insights error',
  },
  cohorts: {
    activeGroupCohorts: ['cohort-a', 'cohort-b'],
    isLoading: true,
    error: 'Cohorts error',
    lastFetchedGroupId: 'group-1',
  },
  mapSettings: {
    mapStyle: 'mapbox://styles/mapbox/dark-v11',
    nodeType: 'heatmap' as const,
  },
} as unknown as RootState;

describe('User selectors', () => {
  it('selectUser returns the user object', () => {
    expect(selectUser(mockState)).toEqual(mockState.user.user);
  });

  it('selectGroups returns the groups array', () => {
    expect(selectGroups(mockState)).toEqual(mockState.user.groups);
  });

  it('selectActiveGroup returns the active group', () => {
    expect(selectActiveGroup(mockState)).toEqual(mockState.user.activeGroup);
  });

  it('selectPendingGroupSwitch returns the pending group switch', () => {
    expect(selectPendingGroupSwitch(mockState)).toEqual(
      mockState.user.pendingGroupSwitch
    );
  });

  it('selectUserLoading returns the loading flag', () => {
    expect(selectUserLoading(mockState)).toBe(true);
  });

  it('selectLoggingOut returns the logging out flag', () => {
    expect(selectLoggingOut(mockState)).toBe(false);
  });

  it('selectUserError returns the error string', () => {
    expect(selectUserError(mockState)).toBe('Something went wrong');
  });
});

describe('Insights selectors', () => {
  it('selectDialogStack returns the dialog stack', () => {
    expect(selectDialogStack(mockState)).toEqual(
      mockState.insights.dialogStack
    );
  });

  it('selectTopDialog returns the last item in the dialog stack', () => {
    expect(selectTopDialog(mockState)).toEqual({
      id: 'dialog-2',
      type: 'add-location',
      data: { foo: 'bar' },
    });
  });

  it('selectTopDialog returns undefined when dialog stack is empty', () => {
    const emptyState = {
      ...mockState,
      insights: { ...mockState.insights, dialogStack: [] },
    } as unknown as RootState;
    expect(selectTopDialog(emptyState)).toBeUndefined();
  });

  it('selectIsDialogOpen returns true for an existing dialog id', () => {
    const selector = selectIsDialogOpen('dialog-1');
    expect(selector(mockState)).toBe(true);
  });

  it('selectIsDialogOpen returns false for a non-existent dialog id', () => {
    const selector = selectIsDialogOpen('dialog-999');
    expect(selector(mockState)).toBe(false);
  });

  it('selectSelectedSites returns the selected sites array', () => {
    expect(selectSelectedSites(mockState)).toEqual(
      mockState.insights.selectedSites
    );
  });

  it('selectInsightsLoading returns the loading flag', () => {
    expect(selectInsightsLoading(mockState)).toBe(true);
  });

  it('selectInsightsError returns the error string', () => {
    expect(selectInsightsError(mockState)).toBe('Insights error');
  });
});

describe('Cohort selectors', () => {
  it('selectActiveGroupCohorts returns the cohorts array', () => {
    expect(selectActiveGroupCohorts(mockState)).toEqual(
      mockState.cohorts.activeGroupCohorts
    );
  });

  it('selectCohortsLoading returns the loading flag', () => {
    expect(selectCohortsLoading(mockState)).toBe(true);
  });

  it('selectCohortsError returns the error string', () => {
    expect(selectCohortsError(mockState)).toBe('Cohorts error');
  });

  it('selectLastFetchedGroupId returns the last fetched group id', () => {
    expect(selectLastFetchedGroupId(mockState)).toBe('group-1');
  });
});

describe('Map settings selectors', () => {
  it('selectMapStyle returns the map style', () => {
    expect(selectMapStyle(mockState)).toBe('mapbox://styles/mapbox/dark-v11');
  });

  it('selectNodeType returns the node type', () => {
    expect(selectNodeType(mockState)).toBe('heatmap');
  });

  it('selectMapSettings returns the full map settings object', () => {
    expect(selectMapSettings(mockState)).toEqual({
      mapStyle: 'mapbox://styles/mapbox/dark-v11',
      nodeType: 'heatmap',
    });
  });
});
