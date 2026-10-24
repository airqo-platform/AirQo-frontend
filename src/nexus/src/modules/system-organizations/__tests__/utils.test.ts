import {
  getOrganizationInitials,
  getRemovableMemberIds,
  isProtectedOrganization,
} from '../utils';

describe('isProtectedOrganization', () => {
  it('is true when the title is airqo (case-insensitive)', () => {
    expect(
      isProtectedOrganization({
        grp_title: 'AirQo',
        organization_slug: 'some-org',
      })
    ).toBe(true);
  });

  it('is true when the slug is airqo (case-insensitive)', () => {
    expect(
      isProtectedOrganization({
        grp_title: 'Kampala Clean Air',
        organization_slug: 'AIRQO',
      })
    ).toBe(true);
  });

  it('is true when the slug is missing', () => {
    expect(
      isProtectedOrganization({ grp_title: 'Kampala Clean Air' })
    ).toBe(true);
    expect(
      isProtectedOrganization({ grp_title: 'Kampala Clean Air', organization_slug: '' })
    ).toBe(true);
  });

  it('is false for any other organization', () => {
    expect(
      isProtectedOrganization({
        grp_title: 'Kampala Clean Air',
        organization_slug: 'kampala-clean-air',
      })
    ).toBe(false);
  });

  it('is false for a missing group (never treats undefined as protected)', () => {
    expect(isProtectedOrganization(undefined)).toBe(false);
    expect(isProtectedOrganization(null)).toBe(false);
  });
});

describe('getRemovableMemberIds', () => {
  it('excludes the manager and de-duplicates the selection', () => {
    expect(
      getRemovableMemberIds(['u1', 'manager', 'u1', 'u2'], 'manager')
    ).toEqual(['u1', 'u2']);
  });

  it('keeps every id when no manager is set', () => {
    expect(getRemovableMemberIds(['u1', 'u2'])).toEqual(['u1', 'u2']);
  });

  it('normalizes numeric ids and drops empty values', () => {
    expect(getRemovableMemberIds([1, 2, 1, '', null])).toEqual(['1', '2']);
  });

  it('handles an empty selection', () => {
    expect(getRemovableMemberIds([], 'manager')).toEqual([]);
    expect(getRemovableMemberIds(null, 'manager')).toEqual([]);
    expect(getRemovableMemberIds(undefined)).toEqual([]);
  });
});

describe('getOrganizationInitials', () => {
  it('uses the first two words', () => {
    expect(getOrganizationInitials('Kampala Clean Air')).toBe('KC');
    expect(getOrganizationInitials('  Kampala  ')).toBe('K');
  });

  it('falls back to a placeholder for empty titles', () => {
    expect(getOrganizationInitials('')).toBe('?');
    expect(getOrganizationInitials('   ')).toBe('?');
  });
});
