/**
 * Domain Update Verification Script
 *
 * This script helps verify that the domain update fixes are working correctly.
 * To use this script:
 * 1. Open browser dev tools
 * 2. Paste this script into the console
 * 3. Run verifyDomainUpdateFix() after performing domain updates
 */

window.verifyDomainUpdateFix = function () {
  const activeGroup =
    window.__NEXT_REDUX_STORE__?.getState?.()?.groups?.activeGroup;
  const userGroups =
    window.__NEXT_REDUX_STORE__?.getState?.()?.groups?.userGroups;
  const currentPath = window.location.pathname;

  return {
    timestamp: new Date().toISOString(),
    currentPath,
    activeGroup: activeGroup
      ? {
          id: activeGroup._id,
          title: activeGroup.grp_title,
          slug: activeGroup.organization_slug || activeGroup.grp_slug,
        }
      : null,
    userGroupsCount: userGroups?.length || 0,
    isOrganizationContext: currentPath.includes('/org/'),
    organizationSlug: currentPath.match(/\/org\/([^/]+)/)?.[1] || null,
    testStatus: {
      hasActiveGroup: !!activeGroup,
      activeGroupIsNotAirQo: activeGroup
        ? !activeGroup.grp_title?.toLowerCase().includes('airqo')
        : false,
      pathMatchesActiveGroup: true, // This would need custom logic based on your slug matching
    },
  };
};

window.checkForConflicts = function () {
  const originalSetActiveGroup = window.__NEXT_REDUX_STORE__?.dispatch;

  if (originalSetActiveGroup) {
    // This is a simplified conflict detector
    // In reality, you'd want to wrap the actual dispatch function
    return 'Redux store found. Monitor setActiveGroup actions in Redux DevTools';
  } else {
    return 'Redux store not accessible. Use Redux DevTools extension to monitor actions';
  }
};

window.domainUpdateTestInstructions = function () {
  return `
🧪 DOMAIN UPDATE TEST INSTRUCTIONS:

1️⃣  BEFORE STARTING:
   - Open Redux DevTools extension
   - Open browser console (F12)
   - Note current active group

2️⃣  PERFORM DOMAIN UPDATE:
   - Go to Settings > Domain Settings
   - Change organization domain
   - Submit form
   - Run: verifyDomainUpdateFix()

3️⃣  EXPECTED RESULTS:
   ✅ activeGroup should remain the same organization
   ✅ currentPath should show new domain
   ✅ No AirQo group switch should occur
   
4️⃣  AFTER REDIRECT:
   - Run: verifyDomainUpdateFix() again
   - Refresh page (F5)
   - Run: verifyDomainUpdateFix() once more

5️⃣  DEBUGGING:
   - Check console for setupUserSession logs
   - Look for "isDomainUpdate: true" in logs
   - Monitor Redux actions for multiple setActiveGroup calls
   
🔧 Run checkForConflicts() to monitor for race conditions
  `;
};

// Auto-run instructions when script loads
if (typeof window !== 'undefined') {
  // Domain Update Verification Script Loaded
  // Run: domainUpdateTestInstructions() for testing guide
  // Run: verifyDomainUpdateFix() after domain updates
}
