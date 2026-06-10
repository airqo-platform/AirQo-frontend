export interface RememberedAccount {
  id: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  lastUsedAt: number;
}

const REMEMBERED_ACCOUNTS_KEY = "vertex_remembered_accounts_v1";
const MAX_REMEMBERED_ACCOUNTS = 5;

const normalizeId = (email: string): string => email.trim().toLowerCase();

export const getRememberedAccounts = (): RememberedAccount[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RememberedAccount[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item?.email && item?.id)
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  } catch {
    return [];
  }
};

export const rememberAccount = (account: {
  email: string;
  displayName?: string;
  profilePicture?: string;
}): void => {
  if (typeof window === "undefined") return;
  const email = account.email?.trim();
  if (!email) return;

  const id = normalizeId(email);
  const existing = getRememberedAccounts().filter((item) => item.id !== id);
  const updated: RememberedAccount = {
    id,
    email,
    displayName: account.displayName,
    profilePicture: account.profilePicture,
    lastUsedAt: Date.now(),
  };

  const merged = [updated, ...existing].slice(0, MAX_REMEMBERED_ACCOUNTS);
  localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(merged));
};

export const removeRememberedAccount = (id: string): RememberedAccount[] => {
  if (typeof window === "undefined") return [];
  const normalizedId = normalizeId(id);
  const updated = getRememberedAccounts().filter((item) => item.id !== normalizedId);
  localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(updated));
  return updated;
};
