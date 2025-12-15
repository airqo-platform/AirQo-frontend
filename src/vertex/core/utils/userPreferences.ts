export const PREFERENCE_KEYS = {
  LAST_ACTIVE_MODULE: 'lastActiveModule',
};

export const getLastActiveModule = (identifier?: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  if (identifier) {
    return localStorage.getItem(`${PREFERENCE_KEYS.LAST_ACTIVE_MODULE}_${identifier}`);
  }
  
  return localStorage.getItem(PREFERENCE_KEYS.LAST_ACTIVE_MODULE);
};

export const setLastActiveModule = (module: string, identifier?: string) => {
  if (typeof window === 'undefined') return;
  
  if (identifier) {
    localStorage.setItem(`${PREFERENCE_KEYS.LAST_ACTIVE_MODULE}_${identifier}`, module);
  } else {
    localStorage.setItem(PREFERENCE_KEYS.LAST_ACTIVE_MODULE, module);
  }
};
