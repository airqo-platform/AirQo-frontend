import test from 'node:test';
import assert from 'node:assert/strict';

// Mock window and localStorage
global.window = {
  location: { protocol: 'https:' }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

import { useCollaborationStore } from '@/store/useCollaborationStore';
import { sessionManager } from '@/services/iot/collaboration/SessionManager';

test('releaseControl WebRTC message clears active controller and revokes backend control', async () => {
  const store = useCollaborationStore.getState();
  store.setRole('host');
  store.setSessionId('session-789');
  store.setCurrentControllerId('user-456');

  let fetchUrl = '';
  let fetchMethod = '';
  let fetchBody = null;

  global.fetch = async (url, options) => {
    fetchUrl = url;
    fetchMethod = options.method;
    fetchBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({}) };
  };

  // Trigger handleWebRTCDataMessage with releaseControl message
  sessionManager['handleWebRTCDataMessage']('user-456', {
    type: 'releaseControl',
    payload: { username: 'Alice' }
  });

  // Verify local state updates immediately
  const updatedStore = useCollaborationStore.getState();
  assert.equal(updatedStore.currentControllerId, null, 'Active controller should be cleared to null');

  // Allow async fetch to complete
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.ok(fetchUrl.includes('/api/v1/webrtc/sessions/session-789/control/revoke'), 'Should POST to backend control/revoke endpoint');
  assert.equal(fetchMethod, 'POST', 'HTTP method should be POST');
  assert.equal(fetchBody.controller_id, 'user-456', 'Payload controller_id should match releasing participant user-456');
});
