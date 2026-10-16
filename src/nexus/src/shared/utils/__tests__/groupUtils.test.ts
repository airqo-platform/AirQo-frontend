import {
  isDefaultAirQoGroup,
  isInOrganizationContext,
  isSameGroup,
  mergeOrganizationOptions,
} from '../groupUtils';

describe('isDefaultAirQoGroup', () => {
  describe('null and undefined', () => {
    it('returns true for null (default group)', () => {
      expect(isDefaultAirQoGroup(null)).toBe(true);
    });

    it('returns true for undefined (default group)', () => {
      expect(isDefaultAirQoGroup(undefined)).toBe(true);
    });
  });

  describe('title matching', () => {
    it('returns true for title "airqo" (lowercase)', () => {
      expect(isDefaultAirQoGroup({ title: 'airqo' })).toBe(true);
    });

    it('returns true for title "AirQo" (case insensitive)', () => {
      expect(isDefaultAirQoGroup({ title: 'AirQo' })).toBe(true);
    });

    it('returns true for title "AIRQO" (all caps)', () => {
      expect(isDefaultAirQoGroup({ title: 'AIRQO' })).toBe(true);
    });
  });

  describe('organizationSlug matching', () => {
    it('returns true for organizationSlug "airqo"', () => {
      expect(isDefaultAirQoGroup({ organizationSlug: 'airqo' })).toBe(true);
    });

    it('returns true for organizationSlug "AirQo" (case insensitive)', () => {
      expect(isDefaultAirQoGroup({ organizationSlug: 'AirQo' })).toBe(true);
    });

    it('returns true when organizationSlug is missing', () => {
      expect(isDefaultAirQoGroup({ title: 'Test' })).toBe(true);
    });

    it('returns true for empty string organizationSlug (falsy)', () => {
      expect(isDefaultAirQoGroup({ organizationSlug: '' })).toBe(true);
    });
  });

  describe('non-default group', () => {
    it('returns false when both title and organizationSlug are non-airqo', () => {
      expect(
        isDefaultAirQoGroup({ title: 'Test Org', organizationSlug: 'test-org' })
      ).toBe(false);
    });

    it('returns false when organizationSlug is set to non-airqo even without title', () => {
      expect(isDefaultAirQoGroup({ organizationSlug: 'some-org' })).toBe(false);
    });
  });
});

describe('isInOrganizationContext', () => {
  describe('inverse of isDefaultAirQoGroup', () => {
    it('returns false for null', () => {
      expect(isInOrganizationContext(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isInOrganizationContext(undefined)).toBe(false);
    });

    it('returns false for default AirQo group (title)', () => {
      expect(isInOrganizationContext({ title: 'airqo' })).toBe(false);
    });

    it('returns false for default AirQo group (organizationSlug)', () => {
      expect(isInOrganizationContext({ organizationSlug: 'airqo' })).toBe(
        false
      );
    });

    it('returns false when organizationSlug is missing', () => {
      expect(isInOrganizationContext({ title: 'Test' })).toBe(false);
    });

    it('returns false for empty string organizationSlug', () => {
      expect(isInOrganizationContext({ organizationSlug: '' })).toBe(false);
    });

    it('returns true for non-default group', () => {
      expect(
        isInOrganizationContext({
          title: 'Test Org',
          organizationSlug: 'test-org',
        })
      ).toBe(true);
    });

    it('returns true when only non-airqo organizationSlug is set', () => {
      expect(isInOrganizationContext({ organizationSlug: 'some-org' })).toBe(
        true
      );
    });
  });
});

describe('isSameGroup', () => {
  describe('id equality', () => {
    it('matches when both ids are present and equal', () => {
      expect(isSameGroup({ id: 'g1' }, { id: 'g1' })).toBe(true);
    });

    it('does not match when both ids differ', () => {
      expect(isSameGroup({ id: 'g1' }, { id: 'g2' })).toBe(false);
    });

    it('trims ids before comparing', () => {
      expect(isSameGroup({ id: ' g1 ' }, { id: 'g1' })).toBe(true);
    });

    it('uses id match even when slugs also differ', () => {
      expect(
        isSameGroup(
          { id: 'g1', organizationSlug: 'slug-a' },
          { id: 'g1', organizationSlug: 'slug-b' }
        )
      ).toBe(true);
    });
  });

  describe('slug equality (when ids absent)', () => {
    it('matches case-insensitively on organizationSlug', () => {
      expect(
        isSameGroup(
          { organizationSlug: 'My-Org' },
          { organizationSlug: 'my-org' }
        )
      ).toBe(true);
    });

    it('trims slugs before comparing', () => {
      expect(
        isSameGroup(
          { organizationSlug: '  org ' },
          { organizationSlug: 'org' }
        )
      ).toBe(true);
    });

    it('does not match when slugs differ', () => {
      expect(
        isSameGroup(
          { organizationSlug: 'org-a' },
          { organizationSlug: 'org-b' }
        )
      ).toBe(false);
    });
  });

  describe('no usable identifier', () => {
    it('returns false when neither side has an id or slug', () => {
      expect(isSameGroup({}, {})).toBe(false);
    });

    it('returns false when only one side has a slug', () => {
      expect(isSameGroup({ organizationSlug: 'org-a' }, {})).toBe(false);
    });
  });

  describe('null and undefined', () => {
    it('returns false when a is null', () => {
      expect(isSameGroup(null, { id: 'g1' })).toBe(false);
    });

    it('returns false when b is null', () => {
      expect(isSameGroup({ id: 'g1' }, null)).toBe(false);
    });

    it('returns false when a is undefined', () => {
      expect(isSameGroup(undefined, { id: 'g1' })).toBe(false);
    });

    it('returns false when both are null', () => {
      expect(isSameGroup(null, null)).toBe(false);
    });
  });
});

describe('mergeOrganizationOptions', () => {
  const g = (id: string, slug = id) => ({ id, organizationSlug: slug });

  it('returns memberships first with isMember true, preserving order', () => {
    const memberships = [g('m1', 'm-1'), g('m2', 'm-2')];
    const result = mergeOrganizationOptions(memberships, []);
    expect(result).toEqual([
      { group: memberships[0], isMember: true },
      { group: memberships[1], isMember: true },
    ]);
  });

  it('flags discovered orgs as non-members', () => {
    const discovered = [g('d1', 'd-1')];
    const result = mergeOrganizationOptions([], discovered);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ group: discovered[0], isMember: false });
  });

  it('does not duplicate discovered orgs already in memberships (by id)', () => {
    const shared = g('shared', 'shared');
    const memberships = [shared];
    const discovered = [g('shared', 'shared'), g('d1', 'd-1')];
    const result = mergeOrganizationOptions(memberships, discovered);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ group: shared, isMember: true });
    expect(result[1]).toEqual({ group: g('d1', 'd-1'), isMember: false });
  });

  it('dedups discovered orgs already in memberships (by slug)', () => {
    const memberships = [g('m1', 'shared')];
    const discovered = [g('d1', 'Shared')];
    const result = mergeOrganizationOptions(memberships, discovered);
    expect(result).toHaveLength(1);
    expect(result[0].isMember).toBe(true);
  });

  it('dedups within the memberships list itself', () => {
    const dup = g('dup', 'dup');
    const memberships = [dup, g('m2', 'm-2'), g('dup', 'dup')];
    const result = mergeOrganizationOptions(memberships, []);
    expect(result).toHaveLength(2);
    expect(result[0].group.id).toBe('dup');
    expect(result[1].group.id).toBe('m2');
  });

  it('dedups within the discovered list itself', () => {
    const memberships = [g('m1', 'm-1')];
    const discovered = [g('d1', 'd-1'), g('d1', 'd-1'), g('d2', 'd-2')];
    const result = mergeOrganizationOptions(memberships, discovered);
    expect(result).toHaveLength(3);
    expect(result.filter(r => !r.isMember)).toHaveLength(2);
  });

  it('handles an empty discovered list', () => {
    const memberships = [g('m1', 'm-1')];
    const result = mergeOrganizationOptions(memberships, []);
    expect(result).toHaveLength(1);
    expect(result[0].isMember).toBe(true);
  });

  it('handles an empty memberships list', () => {
    const discovered = [g('d1', 'd-1'), g('d2', 'd-2')];
    const result = mergeOrganizationOptions([], discovered);
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.isMember).toBe(false));
  });

  it('returns an empty array when both lists are empty', () => {
    expect(mergeOrganizationOptions([], [])).toEqual([]);
  });
});
