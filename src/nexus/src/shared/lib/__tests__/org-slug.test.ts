import { titleToOrgSlug, findGroupByOrgPathSlug } from '../org-slug';
import type { NormalizedGroup } from '@/shared/utils/userUtils';

function makeGroup(
  overrides: Partial<NormalizedGroup> & { id: string }
): NormalizedGroup {
  return {
    title: 'Test Group',
    organizationSlug: 'test-group',
    profilePicture: '',
    createdAt: '',
    status: 'active',
    userType: 'group',
    ...overrides,
  };
}

describe('titleToOrgSlug', () => {
  it('converts a simple title', () => {
    expect(titleToOrgSlug('AirQo')).toBe('airqo');
  });

  it('replaces spaces with hyphens', () => {
    expect(titleToOrgSlug('My Organization')).toBe('my-organization');
  });

  it('replaces underscores with hyphens', () => {
    expect(titleToOrgSlug('My_Organization')).toBe('my-organization');
  });

  it('collapses multiple whitespace characters', () => {
    expect(titleToOrgSlug('  Hello   World  ')).toBe('hello-world');
  });

  it('collapses mixed spaces and underscores', () => {
    expect(titleToOrgSlug('My  __ Organization')).toBe('my-organization');
  });

  it('handles empty string', () => {
    expect(titleToOrgSlug('')).toBe('');
  });

  it('handles whitespace-only string', () => {
    expect(titleToOrgSlug('   ')).toBe('');
  });

  it('lowercases the result', () => {
    expect(titleToOrgSlug('UPPER CASE')).toBe('upper-case');
  });
});

describe('findGroupByOrgPathSlug', () => {
  const groups: NormalizedGroup[] = [
    makeGroup({
      id: '1',
      title: 'AirQo',
      organizationSlug: 'airqo',
    }),
    makeGroup({
      id: '2',
      title: 'Kampala Makerere Innovation Hub',
      organizationSlug: 'kmihub',
    }),
    makeGroup({
      id: '3',
      title: 'My  Organization',
      organizationSlug: '',
    }),
    makeGroup({
      id: '4',
      title: 'Space Org',
      organizationSlug: 'space-org',
    }),
  ];

  it('returns null for null slug', () => {
    expect(findGroupByOrgPathSlug(groups, null)).toBeNull();
  });

  it('returns null for undefined slug', () => {
    expect(findGroupByOrgPathSlug(groups, undefined)).toBeNull();
  });

  it('returns null for empty slug', () => {
    expect(findGroupByOrgPathSlug(groups, '')).toBeNull();
  });

  it('returns null for whitespace-only slug', () => {
    expect(findGroupByOrgPathSlug(groups, '   ')).toBeNull();
  });

  it('returns null for no match', () => {
    expect(findGroupByOrgPathSlug(groups, 'nonexistent')).toBeNull();
  });

  it('exact match on organizationSlug wins', () => {
    const result = findGroupByOrgPathSlug(groups, 'airqo');
    expect(result?.id).toBe('1');
  });

  it('exact match is case-insensitive', () => {
    const result = findGroupByOrgPathSlug(groups, 'AIRQO');
    expect(result?.id).toBe('1');
  });

  it('exact match trims whitespace', () => {
    const result = findGroupByOrgPathSlug(groups, '  kmihub  ');
    expect(result?.id).toBe('2');
  });

  it('title-derived fallback matches when organizationSlug is empty', () => {
    // 'My  Organization' -> titleToOrgSlug -> 'my-organization'
    const result = findGroupByOrgPathSlug(groups, 'my-organization');
    expect(result?.id).toBe('3');
  });

  it('title-derived fallback does not match underscore variant of slug', () => {
    // titleToOrgSlug normalises to hyphens; incoming slug with underscores
    // is only trim/lowercased, so it will NOT match.
    const result = findGroupByOrgPathSlug(groups, 'my_organization');
    expect(result).toBeNull();
  });

  it('title-derived fallback does not match space variant of slug', () => {
    const result = findGroupByOrgPathSlug(groups, 'my organization');
    expect(result).toBeNull();
  });

  it('title-derived fallback works when organizationSlug differs', () => {
    // Group 2: title 'Kampala Makerere Innovation Hub' -> 'kampala-makerere-innovation-hub'
    // organizationSlug is 'kmihub', so slug 'kmihub' hits exact match, but
    // the title-derived slug should also work as a fallback.
    const result = findGroupByOrgPathSlug(
      groups,
      'kampala-makerere-innovation-hub'
    );
    expect(result?.id).toBe('2');
  });

  it('title-derived fallback handles case differences', () => {
    const result = findGroupByOrgPathSlug(
      groups,
      'KAMPALA-MAKERERE-INNOVATION-HUB'
    );
    expect(result?.id).toBe('2');
  });

  it('returns first matching group for duplicate title slugs', () => {
    const dupGroups = [
      makeGroup({ id: 'a', title: 'Duplicate', organizationSlug: '' }),
      makeGroup({ id: 'b', title: 'Duplicate', organizationSlug: '' }),
    ];
    const result = findGroupByOrgPathSlug(dupGroups, 'duplicate');
    expect(result?.id).toBe('a');
  });

  it('title-derived slug colliding with another group exact organizationSlug wins via exact match', () => {
    // Group A: title 'Acme' → title-derived slug 'acme'; organizationSlug 'acme'
    // Group B: title 'Acme Division' → title-derived slug 'acme-division'; organizationSlug 'acme'
    // Both have organizationSlug 'acme', but group A comes first so exact match returns it.
    const groups: NormalizedGroup[] = [
      makeGroup({ id: 'a', title: 'Acme', organizationSlug: 'acme' }),
      makeGroup({
        id: 'b',
        title: 'Acme Division',
        organizationSlug: 'acme',
      }),
    ];
    const result = findGroupByOrgPathSlug(groups, 'acme');
    expect(result?.id).toBe('a');
  });

  it('handles empty array', () => {
    expect(findGroupByOrgPathSlug([], 'airqo')).toBeNull();
  });

  it('skips groups with empty title for title-derived fallback', () => {
    const groupEmptyTitle = makeGroup({
      id: '5',
      title: '',
      organizationSlug: '',
    });
    const result = findGroupByOrgPathSlug([groupEmptyTitle], 'something');
    expect(result).toBeNull();
  });
});
