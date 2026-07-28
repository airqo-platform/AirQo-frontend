import test from 'node:test';
import assert from 'node:assert/strict';

// Setup mock window environment
global.window = {
  location: { href: '' }
};

import * as nextAuth from 'next-auth/react';
import authService from '@/services/api-service';

// Mock clearAllAuthData on authService
if (authService) {
  authService.clearAllAuthData = () => {};
  if (authService.default) {
    authService.default.clearAllAuthData = () => {};
  }
}

import { handleUnauthorized } from '@/lib/api-client';

test('concurrent 401 requests share the exact same logout promise', async () => {
  let signOutCallCount = 0;
  let signOutResolver;

  nextAuth.signOut = async (options) => {
    signOutCallCount++;
    return new Promise((resolve) => {
      signOutResolver = resolve;
    });
  };

  const target = authService?.default || authService;
  if (target) {
    target.clearAllAuthData = () => {};
  }

  // Call handleUnauthorized concurrently twice
  const promise1 = handleUnauthorized();
  const promise2 = handleUnauthorized();

  // Verify that both returned promises are strictly identical (sharing the same promise instance)
  assert.equal(promise1, promise2, 'Concurrent calls to handleUnauthorized should return the exact same promise instance');
  assert.equal(signOutCallCount, 1, 'signOut should only be invoked once for concurrent requests');

  // Resolve the signOut promise
  if (signOutResolver) signOutResolver();

  await Promise.all([promise1, promise2]);
});
