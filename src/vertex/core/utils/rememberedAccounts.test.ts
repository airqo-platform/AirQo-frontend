import {
  getRememberedAccounts,
  rememberAccount,
  removeRememberedAccount,
  type RememberedAccount,
} from "./rememberedAccounts";

const STORAGE_KEY = "vertex_remembered_accounts_v1";

describe("rememberedAccounts utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("returns an empty list when storage is empty, invalid, or not an array", () => {
    expect(getRememberedAccounts()).toEqual([]);

    localStorage.setItem(STORAGE_KEY, "{bad-json");
    expect(getRememberedAccounts()).toEqual([]);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "one" }));
    expect(getRememberedAccounts()).toEqual([]);
  });

  it("filters invalid account entries and sorts by most recent use", () => {
    const accounts: Array<Partial<RememberedAccount>> = [
      { id: "old@example.com", email: "old@example.com", lastUsedAt: 1 },
      { id: "missing-email", lastUsedAt: 3 },
      { id: "new@example.com", email: "new@example.com", lastUsedAt: 5 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));

    expect(getRememberedAccounts().map((account) => account.email)).toEqual([
      "new@example.com",
      "old@example.com",
    ]);
  });

  it("remembers an account with a normalized id and timestamp", () => {
    rememberAccount({
      email: " User@Example.COM ",
      displayName: "User Example",
      profilePicture: "avatar.png",
    });

    expect(getRememberedAccounts()).toEqual([
      {
        id: "user@example.com",
        email: "User@Example.COM",
        displayName: "User Example",
        profilePicture: "avatar.png",
        lastUsedAt: Date.parse("2026-06-28T12:00:00.000Z"),
      },
    ]);
  });

  it("deduplicates accounts by normalized email and keeps the five most recent", () => {
    for (let index = 0; index < 6; index += 1) {
      vi.setSystemTime(new Date(2026, 5, 28, 12, index));
      rememberAccount({ email: `user${index}@example.com` });
    }

    vi.setSystemTime(new Date(2026, 5, 28, 13, 0));
    rememberAccount({ email: " USER2@example.com " });

    expect(getRememberedAccounts().map((account) => account.id)).toEqual([
      "user2@example.com",
      "user5@example.com",
      "user4@example.com",
      "user3@example.com",
      "user1@example.com",
    ]);
  });

  it("ignores empty emails and removes accounts by normalized id", () => {
    rememberAccount({ email: "   " });
    expect(getRememberedAccounts()).toEqual([]);

    rememberAccount({ email: "one@example.com" });
    rememberAccount({ email: "two@example.com" });

    expect(removeRememberedAccount(" TWO@example.com ")).toEqual([
      expect.objectContaining({ id: "one@example.com" }),
    ]);
    expect(getRememberedAccounts()).toHaveLength(1);
  });
});
