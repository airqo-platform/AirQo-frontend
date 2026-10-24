import { getPageTitle } from '../pageTitles';

describe('system organization page titles', () => {
  it('keeps the collection route title for the trailing-slash form', () => {
    expect(getPageTitle('/system/organizations/')).toBe('Organizations');
  });

  it('uses the detail title only when an organization id is present', () => {
    expect(getPageTitle('/system/organizations/org-123')).toBe(
      'Organization Details'
    );
    expect(getPageTitle('/system/organizations/org-123/members')).toBe(
      'Organization Details'
    );
  });
});
