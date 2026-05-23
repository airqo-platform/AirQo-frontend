/**
 * Clears all session-related data from localStorage, using a secure default-deny approach.
 * Only whitelisted keys (like cross-tab signals or remembered accounts) are preserved.
 */
export const clearSessionData = () => {
  if (typeof window === 'undefined') return;

  const keysToRemove = new Set<string>();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    // Whitelist specific keys to keep
    if (
      key.startsWith('next-auth') ||
      key === 'vertex_remembered_accounts_v1' ||
      key.startsWith('lastActiveModule') ||
      key.startsWith('lastActiveGroupId') ||
      key.startsWith('vertex_login_feedback')
    ) {
      continue;
    }

    keysToRemove.add(key);
  }

  for (const key of Array.from(keysToRemove)) {
    localStorage.removeItem(key);
  }

  // Clear sessionStorage as well
  sessionStorage.clear();
};