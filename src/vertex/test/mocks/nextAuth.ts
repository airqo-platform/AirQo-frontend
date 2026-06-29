import { vi } from "vitest";

// Mocks next-auth
export const mockGetServerSession = vi.fn();
export const mockGetSession = vi.fn();

// Default mock reset helper
export const resetNextAuthMocks = () => {
  mockGetServerSession.mockReset();
  mockGetSession.mockReset();
};

export const createMockSession = (overrides = {}) => ({
  user: {
    id: "test-user-id",
    accessToken: "test-access-token",
    userName: "testuser",
    organization: "test-org",
    privilege: "user",
    firstName: "Test",
    lastName: "User",
    country: "UG",
    timezone: "Africa/Kampala",
    phoneNumber: "123456789",
  },
  expires: "2099-01-01T00:00:00.000Z",
  accessToken: "test-access-token",
  ...overrides,
});
