/**
 * Active Group Flow Test
 *
 * This file is created to help debug the active group selection logic.
 * Run this in the browser console after logging in to see the flow.
 */

// Test function to help debug the active group issue
window.debugActiveGroupFlow = () => {
  console.log('=== ACTIVE GROUP DEBUG ===');

  // Get Redux store
  const store = window.__REDUX_STORE__ || window.store;
  if (!store) {
    console.error("Redux store not found. Make sure it's exposed to window.");
    return;
  }

  const state = store.getState();

  console.log('Current Redux State:');
  console.log('- Active Group:', state.groups?.activeGroup);
  console.log('- User Groups:', state.groups?.userGroups);
  console.log('- Group Details:', state.groups?.groupDetails);

  console.log('Session Info:');
  console.log('- Current pathname:', window.location.pathname);
  console.log('- Is org route?', window.location.pathname.startsWith('/org/'));
  console.log(
    '- Is user route?',
    window.location.pathname.startsWith('/user/'),
  );

  // Test group selection
  const userGroups = state.groups?.userGroups || [];
  const airqoGroup = userGroups.find(
    (g) => g.grp_title?.toLowerCase() === 'airqo',
  );
  const otherGroups = userGroups.filter(
    (g) => g.grp_title?.toLowerCase() !== 'airqo',
  );

  console.log('Group Analysis:');
  console.log('- AirQo Group:', airqoGroup);
  console.log('- Other Groups:', otherGroups);

  // Test setting different groups
  window.testSetAirQo = () => {
    if (airqoGroup) {
      console.log('Setting AirQo as active group...');
      store.dispatch({ type: 'groups/setActiveGroup', payload: airqoGroup });
    }
  };

  window.testSetOtherGroup = () => {
    if (otherGroups.length > 0) {
      console.log('Setting other group as active...', otherGroups[0]);
      store.dispatch({
        type: 'groups/setActiveGroup',
        payload: otherGroups[0],
      });
    }
  };

  console.log('Test functions available:');
  console.log('- window.testSetAirQo() - Set AirQo as active');
  console.log('- window.testSetOtherGroup() - Set other group as active');
  console.log('- window.debugActiveGroupFlow() - Run this debug again');
};

// Auto-run the debug when this file is loaded
setTimeout(() => {
  console.log(
    'Active Group Debug Tool Loaded. Run window.debugActiveGroupFlow() to debug.',
  );
}, 1000);
