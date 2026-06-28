export const createMockOrganization = (overrides = {}) => ({
  _id: "org-123",
  grp_title: "Test Organization",
  grp_description: "A test org",
  ...overrides,
});
