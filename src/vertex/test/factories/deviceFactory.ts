export const createMockDevice = (overrides = {}) => ({
  _id: "device-123",
  name: "Test Device",
  status: "deployed",
  ...overrides,
});
