'use client';

import React from 'react';
import { useUser } from '@/shared/hooks/useUser';
import { useAnalyticsPreferences } from '../hooks';

/**
 * Debug component to check user state and analytics preferences
 */
export const DebugUserState: React.FC = () => {
  const { user, activeGroup, isLoading, error } = useUser();
  const {
    selectedSiteIds,
    selectedSites,
    hasUser,
    hasActiveGroup,
    hasPreferencesData,
    isLoading: prefsLoading,
    error: prefsError,
    shouldFetchPreferences,
    userLoading,
    preferencesLoading,
  } = useAnalyticsPreferences();

  return (
    <div
      style={{
        background: '#f0f0f0',
        padding: '10px',
        margin: '10px',
        border: '1px solid #ccc',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}
    >
      <h4>Debug: User & Preferences State</h4>
      <p>
        <strong>User ID:</strong> {user?.id || 'No user'}
      </p>
      <p>
        <strong>User Email:</strong> {user?.email || 'No email'}
      </p>
      <p>
        <strong>Active Group ID:</strong> {activeGroup?.id || 'No active group'}
      </p>
      <p>
        <strong>Active Group Title:</strong>{' '}
        {activeGroup?.title || 'No active group'}
      </p>
      <p>
        <strong>User Loading:</strong> {isLoading ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>User Error:</strong> {error || 'None'}
      </p>

      <hr style={{ margin: '10px 0' }} />

      <p>
        <strong>Has User:</strong> {hasUser ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Has Active Group:</strong> {hasActiveGroup ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Should Fetch Preferences:</strong>{' '}
        {shouldFetchPreferences ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Has Preferences Data:</strong>{' '}
        {hasPreferencesData ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>User Loading:</strong> {userLoading ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Preferences Loading:</strong>{' '}
        {preferencesLoading ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Combined Loading:</strong> {prefsLoading ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Preferences Error:</strong> {prefsError ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Selected Sites Count:</strong> {selectedSites.length}
      </p>
      <p>
        <strong>Selected Site IDs:</strong>{' '}
        {selectedSiteIds.join(', ') || 'None'}
      </p>
    </div>
  );
};
