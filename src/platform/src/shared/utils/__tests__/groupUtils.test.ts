import { isDefaultAirQoGroup, isInOrganizationContext } from '../groupUtils';

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
