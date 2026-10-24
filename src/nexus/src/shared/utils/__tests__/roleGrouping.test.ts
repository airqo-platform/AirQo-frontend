import {
  getCurrentRoleNameForGroup,
  getRoleGroupOptions,
  getRolesForGroup,
  hasGroupMembership,
  resolveInitialRoleSelection,
} from '../roleGrouping';
import type { RoleWithGroup } from '../roleGrouping';

const makeRole = (
  id: string,
  groupId: string | undefined,
  roleName: string,
  options?: { grpTitle?: string; slug?: string }
): RoleWithGroup => ({
  _id: id,
  role_name: roleName,
  role_status: 'active',
  group:
    groupId === undefined
      ? undefined
      : {
          _id: groupId,
          grp_title: options?.grpTitle ?? `Group ${groupId}`,
          organization_slug: options?.slug ?? groupId,
        },
});

type InitialSelectionUser = Parameters<typeof resolveInitialRoleSelection>[0];

const asUser = (groups: unknown): InitialSelectionUser =>
  groups as InitialSelectionUser;

describe('roleGrouping', () => {
  describe('getRoleGroupOptions', () => {
    it('counts each role id once per group so duplicates cannot inflate roleCount', () => {
      // Mirrors the live bug: the summary endpoint returned AIRQO_ADMIN three
      // times for the same group, inflating the label to "12 roles".
      const roles: RoleWithGroup[] = [
        makeRole('r-admin', 'g-airqo', 'AIRQO_ADMIN', { grpTitle: 'airqo' }),
        makeRole('r-admin', 'g-airqo', 'AIRQO_ADMIN', { grpTitle: 'airqo' }),
        makeRole('r-admin', 'g-airqo', 'AIRQO_ADMIN', { grpTitle: 'airqo' }),
        makeRole('r-viewer', 'g-airqo', 'AIRQO_VIEWER', { grpTitle: 'airqo' }),
        makeRole('r-editor', 'g-airqo', 'AIRQO_EDITOR', { grpTitle: 'airqo' }),
        makeRole('r-ops', 'g-airqo', 'AIRQO_OPS', { grpTitle: 'airqo' }),
        makeRole('r-billing', 'g-airqo', 'AIRQO_BILLING', { grpTitle: 'airqo' }),
        makeRole('r-super', 'g-airqo', 'AIRQO_SUPER', { grpTitle: 'airqo' }),
      ];

      const options = getRoleGroupOptions(roles);

      expect(options).toHaveLength(1);
      expect(options[0].id).toBe('g-airqo');
      expect(options[0].roleCount).toBe(6);
    });

    it('excludes roles without a group id', () => {
      const roles: RoleWithGroup[] = [
        makeRole('r-1', 'g-1', 'ROLE_ONE', { grpTitle: 'One' }),
        makeRole('r-2', undefined, 'ORG_SUPER_ADMIN'),
      ];

      const options = getRoleGroupOptions(roles);

      expect(options.map(option => option.id)).toEqual(['g-1']);
      expect(options[0].roleCount).toBe(1);
    });
  });

  describe('getRolesForGroup', () => {
    it('returns unique roles sorted by role name', () => {
      const roles: RoleWithGroup[] = [
        makeRole('r-b', 'g-1', 'B_ROLE', { grpTitle: 'One' }),
        makeRole('r-a', 'g-1', 'A_ROLE', { grpTitle: 'One' }),
        makeRole('r-b', 'g-1', 'B_ROLE', { grpTitle: 'One' }),
        makeRole('r-c', 'g-2', 'C_ROLE', { grpTitle: 'Two' }),
      ];

      const result = getRolesForGroup(roles, 'g-1');

      expect(result.map(role => role._id)).toEqual(['r-a', 'r-b']);
      expect(result.map(role => role.role_name)).toEqual([
        'A_ROLE',
        'B_ROLE',
      ]);
    });

    it('does not mutate the input array', () => {
      const roles: RoleWithGroup[] = [
        makeRole('r-b', 'g-1', 'B_ROLE'),
        makeRole('r-a', 'g-1', 'A_ROLE'),
      ];
      const snapshot = [...roles];

      getRolesForGroup(roles, 'g-1');

      expect(roles).toEqual(snapshot);
    });

    it('excludes roles without a group and roles from other groups', () => {
      const roles: RoleWithGroup[] = [
        makeRole('r-1', 'g-1', 'ROLE_ONE'),
        makeRole('r-2', 'g-2', 'ROLE_TWO'),
        makeRole('r-3', undefined, 'ORG_SUPER_ADMIN'),
      ];

      expect(getRolesForGroup(roles, 'g-1').map(role => role._id)).toEqual([
        'r-1',
      ]);
      expect(getRolesForGroup(roles, '')).toEqual([]);
    });
  });

  describe('resolveInitialRoleSelection', () => {
    const roles: RoleWithGroup[] = [
      makeRole('r-beta-1', 'g-beta', 'BETA_ADMIN', { grpTitle: 'Beta' }),
      makeRole('r-alpha-1', 'g-alpha', 'ALPHA_ADMIN', { grpTitle: 'Alpha' }),
    ];

    it("picks the group of the user's current role with an empty roleId", () => {
      const user = asUser({
        groups: [
          { _id: 'g-beta', role: { _id: 'r-beta-1', role_name: 'BETA_ADMIN' } },
        ],
      });

      expect(resolveInitialRoleSelection(user, roles)).toEqual({
        groupId: 'g-beta',
        roleId: '',
      });
    });

    it('falls back to the first group (by title) when the user has no role membership', () => {
      const user = asUser({ groups: [{ _id: 'g-beta' }] });

      // Options sort by title, so the first group is "Alpha".
      expect(resolveInitialRoleSelection(user, roles)).toEqual({
        groupId: 'g-alpha',
        roleId: '',
      });
    });

    it('returns empty ids when there are no groups', () => {
      expect(resolveInitialRoleSelection(null, [])).toEqual({
        groupId: '',
        roleId: '',
      });
      expect(
        resolveInitialRoleSelection(asUser({ groups: [] }), [
          makeRole('r-ungrouped', undefined, 'ORG_SUPER_ADMIN'),
        ])
      ).toEqual({ groupId: '', roleId: '' });
    });
  });

  describe('getCurrentRoleNameForGroup', () => {
    const member = asUser({
      groups: [
        { _id: 'g-1', role: { _id: 'r-1', role_name: 'AIRQO_ADMIN' } },
        { _id: 'g-2' },
      ],
    });

    it("returns the role name for the user's membership in the group", () => {
      expect(getCurrentRoleNameForGroup(member, 'g-1')).toBe('AIRQO_ADMIN');
    });

    it('returns null for a group the user does not belong to', () => {
      expect(getCurrentRoleNameForGroup(member, 'g-unknown')).toBeNull();
    });

    it('returns null when the membership carries no role', () => {
      expect(getCurrentRoleNameForGroup(member, 'g-2')).toBeNull();
    });

    it('returns null for a null or undefined user', () => {
      expect(getCurrentRoleNameForGroup(null, 'g-1')).toBeNull();
      expect(getCurrentRoleNameForGroup(undefined, 'g-1')).toBeNull();
    });

    it('returns null for an empty groupId', () => {
      expect(getCurrentRoleNameForGroup(member, '')).toBeNull();
    });
  });

  describe('hasGroupMembership', () => {
    const member = asUser({
      groups: [
        { _id: 'g-1', role: { _id: 'r-1', role_name: 'AIRQO_ADMIN' } },
        { _id: 'g-2' },
      ],
    });

    it('returns true for a group the user belongs to, with or without a role', () => {
      expect(hasGroupMembership(member, 'g-1')).toBe(true);
      expect(hasGroupMembership(member, 'g-2')).toBe(true);
    });

    it('returns false for a group the user does not belong to', () => {
      expect(hasGroupMembership(member, 'g-unknown')).toBe(false);
    });

    it('returns false for a null or undefined user', () => {
      expect(hasGroupMembership(null, 'g-1')).toBe(false);
      expect(hasGroupMembership(undefined, 'g-1')).toBe(false);
    });

    it('returns false for an empty groupId', () => {
      expect(hasGroupMembership(member, '')).toBe(false);
    });
  });
});
