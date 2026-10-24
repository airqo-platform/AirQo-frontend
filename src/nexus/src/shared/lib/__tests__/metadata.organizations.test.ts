import { generatePageMetadata } from '../metadata';

describe('organization page metadata', () => {
  it('keeps the collection metadata for the trailing-slash route', () => {
    expect(generatePageMetadata('/system/organizations/').title).toBe(
      'Organizations'
    );
  });

  it('uses detail metadata only when an organization id is present', () => {
    expect(generatePageMetadata('/system/organizations/org-123').title).toBe(
      'Organization Details'
    );
  });
});
