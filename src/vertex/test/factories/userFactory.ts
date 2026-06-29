export const createMockUser = (overrides = {}) => ({
  _id: "user-123",
  email: "test@airqo.net",
  firstName: "Test",
  lastName: "User",
  ...overrides,
});
