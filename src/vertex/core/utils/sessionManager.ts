/**
 * Clears all session-related data from localStorage.
 */
export const clearSessionData = () => {
  localStorage.removeItem('userDetails');
  localStorage.removeItem('activeNetwork');
  localStorage.removeItem('availableNetworks');
  localStorage.removeItem('activeGroup');
  localStorage.removeItem('userGroups');
  localStorage.removeItem('userContext');
  localStorage.removeItem("recentOrganizations");
  localStorage.removeItem("persist:user");
  localStorage.removeItem("unauthorized_count");
  localStorage.removeItem("last_unauthorized");
};