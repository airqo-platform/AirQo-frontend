import {
  normalizeUser,
  normalizeGroups,
  normalizeGroupDetails,
  normalizeDiscoveredGroups,
} from '../userUtils';
import type { User, Group, GroupDetails } from '../../types/api';

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    _id: 'u-1',
    firstName: '',
    lastName: '',
    email: '',
    userName: '',
    profilePicture: '',
    isActive: false,
    verified: false,
    country: '',
    organization: '',
    jobTitle: '',
    description: '',
    lastLogin: '',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }) as unknown as User;

const makeGroup = (overrides: Partial<Group> = {}): Group =>
  ({
    _id: 'g-1',
    grp_title: '',
    organization_slug: '',
    grp_image: '',
    grp_profile_picture: '',
    createdAt: '',
    status: '',
    userType: '',
    ...overrides,
  }) as unknown as Group;

const makeGroupDetails = (
  overrides: Partial<GroupDetails> = {}
): GroupDetails =>
  ({
    _id: 'gd-1',
    grp_title: '',
    organization_slug: '',
    grp_image: '',
    grp_profile_picture: '',
    createdAt: '',
    grp_status: '',
    ...overrides,
  }) as unknown as GroupDetails;

describe('normalizeUser', () => {
  describe('invalid inputs', () => {
    it('returns null for null', () => {
      expect(normalizeUser(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(normalizeUser(undefined)).toBeNull();
    });

    it('returns null for non-object (number)', () => {
      expect(normalizeUser(42 as unknown as User)).toBeNull();
    });

    it('returns null for non-object (string)', () => {
      expect(normalizeUser('user' as unknown as User)).toBeNull();
    });

    it('returns null for missing _id', () => {
      expect(normalizeUser({} as User)).toBeNull();
    });

    it('returns null for empty string _id', () => {
      expect(normalizeUser({ _id: '' } as unknown as User)).toBeNull();
    });
  });

  describe('field mapping', () => {
    it('maps all user fields', () => {
      const user = makeUser({
        _id: 'u-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        userName: 'johnd',
        profilePicture: 'pic.jpg',
        isActive: true,
        verified: true,
        country: 'Uganda',
        organization: 'AirQo',
        jobTitle: 'Engineer',
        description: 'Desc',
        lastLogin: '2024-01-01',
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
      });
      const result = normalizeUser(user)!;
      expect(result.id).toBe('u-1');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.userName).toBe('johnd');
      expect(result.profilePicture).toBe('pic.jpg');
      expect(result.isActive).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.country).toBe('Uganda');
      expect(result.organization).toBe('AirQo');
      expect(result.jobTitle).toBe('Engineer');
      expect(result.description).toBe('Desc');
      expect(result.lastLogin).toBe('2024-01-01');
      expect(result.createdAt).toBe('2023-01-01');
      expect(result.updatedAt).toBe('2024-01-01');
    });

    it('uses empty string/false defaults for missing fields', () => {
      const result = normalizeUser(makeUser())!;
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
      expect(result.email).toBe('');
      expect(result.userName).toBe('');
      expect(result.profilePicture).toBe('');
      expect(result.isActive).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.country).toBe('');
      expect(result.organization).toBe('');
      expect(result.jobTitle).toBe('');
      expect(result.description).toBe('');
      expect(result.lastLogin).toBe('');
      expect(result.createdAt).toBe('');
      expect(result.updatedAt).toBe('');
    });
  });
});

describe('normalizeGroups', () => {
  describe('invalid inputs', () => {
    it('returns empty array for null', () => {
      expect(normalizeGroups(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
      expect(normalizeGroups(undefined)).toEqual([]);
    });

    it('returns empty array for non-array', () => {
      expect(normalizeGroups('string' as unknown as Group[])).toEqual([]);
    });

    it('returns empty array for empty array', () => {
      expect(normalizeGroups([])).toEqual([]);
    });
  });

  describe('filtering', () => {
    it('filters null entries', () => {
      const groups = [
        null,
        makeGroup({ _id: 'g-1', grp_title: 'Valid' }),
        undefined,
      ] as unknown as Group[];
      const result = normalizeGroups(groups);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('g-1');
    });

    it('filters entries without _id', () => {
      const groups = [{ grp_title: 'No ID' }] as unknown as Group[];
      expect(normalizeGroups(groups)).toEqual([]);
    });
  });

  describe('field mapping', () => {
    it('maps group fields with proper fallbacks', () => {
      const groups = [
        makeGroup({
          _id: 'g-1',
          grp_title: 'Group One',
          organization_slug: '  My-Org  ',
          grp_image: 'logo.png',
          grp_profile_picture: 'pic.png',
          createdAt: '2024-01-01',
          status: 'ACTIVE',
          userType: 'admin',
        }),
      ];
      const result = normalizeGroups(groups);
      expect(result[0].id).toBe('g-1');
      expect(result[0].title).toBe('Group One');
      expect(result[0].organizationSlug).toBe('my-org');
      expect(result[0].profilePicture).toBe('logo.png');
      expect(result[0].createdAt).toBe('2024-01-01');
      expect(result[0].status).toBe('ACTIVE');
      expect(result[0].userType).toBe('admin');
    });

    it('uses grp_profile_picture when grp_image is missing', () => {
      const groups = [
        makeGroup({
          _id: 'g-1',
          grp_title: 'T',
          grp_profile_picture: 'pic.png',
        }),
      ];
      expect(normalizeGroups(groups)[0].profilePicture).toBe('pic.png');
    });

    it('uses empty string when both image fields are missing', () => {
      const groups = [makeGroup({ _id: 'g-1', grp_title: 'T' })];
      expect(normalizeGroups(groups)[0].profilePicture).toBe('');
    });
  });

  describe('organizationSlug handling', () => {
    it('trims and lowercases organization_slug', () => {
      const groups = [
        makeGroup({ _id: 'g-1', organization_slug: '  My-Org  ' }),
      ];
      expect(normalizeGroups(groups)[0].organizationSlug).toBe('my-org');
    });

    it('returns empty string for non-string organization_slug', () => {
      const groups = [
        makeGroup({ _id: 'g-1', organization_slug: 123 as unknown as string }),
      ];
      expect(normalizeGroups(groups)[0].organizationSlug).toBe('');
    });

    it('returns empty string for whitespace-only organization_slug after trim', () => {
      const groups = [makeGroup({ _id: 'g-1', organization_slug: '   ' })];
      expect(normalizeGroups(groups)[0].organizationSlug).toBe('');
    });
  });
});

describe('normalizeGroupDetails', () => {
  describe('invalid inputs', () => {
    it('returns null for null', () => {
      expect(normalizeGroupDetails(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(normalizeGroupDetails(undefined)).toBeNull();
    });

    it('returns null for missing _id', () => {
      expect(normalizeGroupDetails({} as GroupDetails)).toBeNull();
    });

    it('returns null for non-object', () => {
      expect(
        normalizeGroupDetails('string' as unknown as GroupDetails)
      ).toBeNull();
    });
  });

  describe('field mapping', () => {
    it('maps all fields with "group" as default userType', () => {
      const details = makeGroupDetails({
        _id: 'gd-1',
        grp_title: 'My Group',
        organization_slug: 'my-org',
        grp_image: 'logo.png',
        grp_profile_picture: 'pic.png',
        createdAt: '2024-01-01',
        grp_status: 'ACTIVE',
      });
      const result = normalizeGroupDetails(details)!;
      expect(result.id).toBe('gd-1');
      expect(result.title).toBe('My Group');
      expect(result.organizationSlug).toBe('my-org');
      expect(result.profilePicture).toBe('logo.png');
      expect(result.createdAt).toBe('2024-01-01');
      expect(result.status).toBe('ACTIVE');
      expect(result.userType).toBe('group');
    });

    it('uses fallbacks for missing optional fields', () => {
      const details = makeGroupDetails({ _id: 'gd-1' });
      const result = normalizeGroupDetails(details)!;
      expect(result.title).toBe('');
      expect(result.organizationSlug).toBe('');
      expect(result.profilePicture).toBe('');
      expect(result.createdAt).toBe('');
      expect(result.status).toBe('');
    });
  });

  describe('organizationSlug handling', () => {
    it('trims and lowercases organization_slug', () => {
      const details = makeGroupDetails({
        _id: 'gd-1',
        organization_slug: '  My-Org  ',
      });
      expect(normalizeGroupDetails(details)!.organizationSlug).toBe('my-org');
    });

    it('returns empty string for non-string organization_slug', () => {
      const details = makeGroupDetails({
        _id: 'gd-1',
        organization_slug: 123 as unknown as string,
      });
      expect(normalizeGroupDetails(details)!.organizationSlug).toBe('');
    });
  });
});

describe('normalizeDiscoveredGroups', () => {
  describe('envelope variants', () => {
    const makeDiscovered = (overrides: Record<string, unknown>) => ({
      _id: 'd-1',
      grp_title: 'Discovered One',
      organization_slug: 'discovered-one',
      grp_image: 'logo.png',
      grp_status: 'ACTIVE',
      createdAt: '2024-01-01',
      ...overrides,
    });

    it('reads from a { groups: [...] } envelope', () => {
      const result = normalizeDiscoveredGroups({
        groups: [makeDiscovered({ _id: 'g-1' })],
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('g-1');
      expect(result[0].title).toBe('Discovered One');
    });

    it('reads from a bare array', () => {
      const result = normalizeDiscoveredGroups([makeDiscovered({ _id: 'g-3' })]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('g-3');
    });

    it('returns [] for a bare array containing only invalid entries', () => {
      expect(normalizeDiscoveredGroups([])).toEqual([]);
    });

    it('ignores a { data: [...] } envelope (no v3-era tolerance)', () => {
      const result = normalizeDiscoveredGroups({
        data: [makeDiscovered({ _id: 'g-2' })],
      });
      expect(result).toEqual([]);
    });
  });

  describe('canonical field mapping (grp_* and _id only)', () => {
    it('uses _id and drops entries with a non-_id alias', () => {
      const result = normalizeDiscoveredGroups([
        { _id: 'preferred', grp_title: 'T' },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('preferred');
    });

    it('drops entries that only carry an id (no _id)', () => {
      const result = normalizeDiscoveredGroups([
        { id: 'only-id', grp_title: 'T' },
      ]);
      expect(result).toEqual([]);
    });

    it('reads grp_title and ignores name/title aliases', () => {
      expect(
        normalizeDiscoveredGroups([{ _id: '1', grp_title: 'gt' }])[0].title
      ).toBe('gt');
      expect(
        normalizeDiscoveredGroups([{ _id: '1', name: 'nm' }])[0].title
      ).toBe('');
      expect(
        normalizeDiscoveredGroups([{ _id: '1', title: 'tl' }])[0].title
      ).toBe('');
      expect(normalizeDiscoveredGroups([{ _id: '1' }])[0].title).toBe('');
    });

    it('reads organization_slug, trimmed and lowercased, ignoring slug', () => {
      const result = normalizeDiscoveredGroups([
        { _id: '1', organization_slug: '  My-Org  ', slug: 'ignored' },
      ]);
      expect(result[0].organizationSlug).toBe('my-org');
    });

    it('returns empty slug when only a non-canonical slug is present', () => {
      const result = normalizeDiscoveredGroups([
        { _id: '1', slug: 'From-Slug' },
      ]);
      expect(result[0].organizationSlug).toBe('');
    });

    it('prefers grp_image then grp_profile_picture, ignoring profilePicture', () => {
      expect(
        normalizeDiscoveredGroups([{ _id: '1', grp_image: 'a' }])[0].profilePicture
      ).toBe('a');
      expect(
        normalizeDiscoveredGroups([{ _id: '1', grp_profile_picture: 'b' }])[0]
          .profilePicture
      ).toBe('b');
      expect(
        normalizeDiscoveredGroups([{ _id: '1', profilePicture: 'c' }])[0]
          .profilePicture
      ).toBe('');
      expect(
        normalizeDiscoveredGroups([{ _id: '1' }])[0].profilePicture
      ).toBe('');
    });

    it('reads grp_status and ignores a non-grp_ status alias', () => {
      expect(
        normalizeDiscoveredGroups([{ _id: '1', grp_status: 'GS' }])[0].status
      ).toBe('GS');
      expect(
        normalizeDiscoveredGroups([{ _id: '1', status: 'ST' }])[0].status
      ).toBe('');
    });

    it('maps createdAt through unchanged', () => {
      expect(
        normalizeDiscoveredGroups([{ _id: '1', createdAt: '2024-02-02' }])[0]
          .createdAt
      ).toBe('2024-02-02');
    });
  });

  describe('invalid-entry filtering', () => {
    it('drops entries without an _id', () => {
      const result = normalizeDiscoveredGroups([
        { grp_title: 'No ID' },
        { _id: 'valid', grp_title: 'Valid' },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid');
    });

    it('drops null and non-object entries', () => {
      const result = normalizeDiscoveredGroups([
        null,
        undefined,
        42,
        'string',
        { _id: 'keep', grp_title: 'Keep' },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('keep');
    });
  });

  describe('malformed payloads', () => {
    it('returns [] for null', () => {
      expect(normalizeDiscoveredGroups(null)).toEqual([]);
    });

    it('returns [] for undefined', () => {
      expect(normalizeDiscoveredGroups(undefined)).toEqual([]);
    });

    it('returns [] for a non-object non-array (number)', () => {
      expect(normalizeDiscoveredGroups(123)).toEqual([]);
    });

    it('returns [] for a string', () => {
      expect(normalizeDiscoveredGroups('nope')).toEqual([]);
    });

    it('returns [] for an object with no array envelope', () => {
      expect(normalizeDiscoveredGroups({ message: 'ok' })).toEqual([]);
    });

    it('returns [] when the envelope array is not actually an array', () => {
      expect(
        normalizeDiscoveredGroups({ groups: 'not-an-array' })
      ).toEqual([]);
    });

    it('returns [] for a { data: ... } envelope even with an array', () => {
      expect(
        normalizeDiscoveredGroups({ data: [{ _id: 'x', grp_title: 'X' }] })
      ).toEqual([]);
    });
  });
});
