import { expect, type Page } from "@playwright/test";
import {
  PERMISSIONS,
  mapLegacyPermission,
} from "../../core/permissions/constants";
import { clearPersistedQueryCache } from "./app-state";

/**
 * RBAC test support — hybrid interception for permission scenarios.
 *
 * The app derives every permission check from one payload: the user-details
 * GET (`/api/users/:id`), whose `groups[].role.role_permissions` and
 * `networks[].role.role_permissions` feed permissionService. These helpers
 * keep real auth, routing, and data GETs, but transform that single response
 * in flight so each test boots as a user with exactly the permissions the
 * scenario needs — no second test account, no backend seeding.
 *
 * Determinism requires a clean boot: `resetAppBootState` clears the persisted
 * Redux user slice and React Query cache (both ride along in the auth
 * storageState), forcing the app to rebuild its RBAC state from the
 * intercepted fetch on every page load.
 */

// Structural types for the slices of the user-details payload we transform.
// Kept intentionally loose: the real payload has many more fields, which all
// pass through untouched.
interface RolePermissionLike {
  permission?: string;
  [key: string]: unknown;
}

interface RoleLike {
  role_name?: string;
  role_permissions?: RolePermissionLike[];
  [key: string]: unknown;
}

interface OrgMembershipLike {
  _id: string;
  grp_title?: string;
  net_name?: string;
  role?: RoleLike;
  [key: string]: unknown;
}

export interface MockableUserDetails {
  _id: string;
  groups?: OrgMembershipLike[];
  networks?: OrgMembershipLike[];
  [key: string]: unknown;
}

export type UserDetailsTransform = (
  user: MockableUserDetails
) => MockableUserDetails;

/** Synthetic external organization injected by `rbacUser({ externalOrg })`. */
export const E2E_EXTERNAL_ORG_ID = "e2ee2ee2ee2ee2ee2ee2ee2e";
export const E2E_EXTERNAL_ORG_TITLE = "E2E RBAC Org";

const ALL_NEW_PERMISSIONS = new Set<string>(
  (Object.values(PERMISSIONS) as Array<Record<string, string>>).flatMap(
    (group) => Object.values(group)
  )
);

/**
 * Resolves a raw role_permission string (new-style or legacy) to the
 * new-style permission names it grants — mirrors permissionService's
 * resolution so stripping catches legacy grants too.
 */
function resolvePermission(raw: string): string[] {
  if (ALL_NEW_PERMISSIONS.has(raw)) return [raw];
  return mapLegacyPermission(raw);
}

function stripFromRole(role: RoleLike | undefined, banned: Set<string>): RoleLike | undefined {
  if (!role?.role_permissions) return role;
  return {
    ...role,
    role_permissions: role.role_permissions.filter(
      (rp) => !resolvePermission(rp.permission ?? "").some((p) => banned.has(p))
    ),
  };
}

function grantToRole(role: RoleLike | undefined, grants: string[]): RoleLike {
  const base: RoleLike = role ?? { role_name: "E2E_RBAC_ROLE", role_permissions: [] };
  const existing = new Set(
    (base.role_permissions ?? []).map((rp) => rp.permission ?? "")
  );
  return {
    ...base,
    role_permissions: [
      ...(base.role_permissions ?? []),
      ...grants
        .filter((p) => !existing.has(p))
        .map((permission) => ({ permission })),
    ],
  };
}

export interface RbacUserOptions {
  /**
   * Permissions to remove from every group and network role. Legacy
   * role_permission strings that map to any of these are removed too.
   */
  strip?: string[];
  /** Permissions to ensure on the AirQo group role (the personal context). */
  grantPersonal?: string[];
  /**
   * Inject a synthetic non-AirQo organization (id E2E_EXTERNAL_ORG_ID) whose
   * role holds exactly these permissions. Combine with `seedActiveGroup` to
   * boot the app in external-org context.
   */
  externalOrg?: { permissions: string[] };
}

/**
 * Builds a user-details transform for an RBAC scenario.
 *
 * SUPER_ADMIN is ALWAYS stripped (it overrides every permission check in
 * permissionService), so outcomes depend only on the explicit role
 * permissions the scenario grants. Order: strip first, then grant.
 */
export function rbacUser(options: RbacUserOptions): UserDetailsTransform {
  const banned = new Set([
    ...(options.strip ?? []),
    PERMISSIONS.SYSTEM.SUPER_ADMIN,
  ]);

  return (user) => {
    let groups: OrgMembershipLike[] = (user.groups ?? []).map((group) => ({
      ...group,
      role: stripFromRole(group.role, banned),
    }));
    const networks = (user.networks ?? []).map((network) => ({
      ...network,
      role: stripFromRole(network.role, banned),
    }));

    if (options.grantPersonal?.length) {
      groups = groups.map((group) =>
        group.grp_title?.toLowerCase() === "airqo"
          ? { ...group, role: grantToRole(group.role, options.grantPersonal!) }
          : group
      );
    }

    if (options.externalOrg) {
      groups = [
        ...groups.filter((g) => g._id !== E2E_EXTERNAL_ORG_ID),
        {
          _id: E2E_EXTERNAL_ORG_ID,
          grp_title: E2E_EXTERNAL_ORG_TITLE,
          grp_status: "ACTIVE",
          role: grantToRole(undefined, options.externalOrg.permissions),
        },
      ];
    }

    return { ...user, groups, networks };
  };
}

export interface UserDetailsIntercept {
  /** Resolves with the real user id once the intercepted fetch has happened. */
  userId: () => Promise<string>;
}

// Matches the user-details GET only: /api/users/<24-hex id> with no further
// path segments (so /api/users/:id/cohorts, /api/users/permissions etc. pass
// through untouched).
const USER_DETAILS_URL = /\/api\/users\/[0-9a-fA-F]{24}(\?.*)?$/;

/**
 * Intercepts the user-details GET, fetches the real backend response, applies
 * `transform` to the user object, and fulfills with the modified payload.
 */
export async function interceptUserDetails(
  page: Page,
  transform: UserDetailsTransform
): Promise<UserDetailsIntercept> {
  let resolveUserId: (id: string) => void;
  const userIdPromise = new Promise<string>((resolve) => {
    resolveUserId = resolve;
  });

  await page.route(USER_DETAILS_URL, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    try {
      const response = await route.fetch();
      const json = (await response.json()) as { users?: MockableUserDetails[] };
      if (Array.isArray(json.users) && json.users[0]) {
        resolveUserId(json.users[0]._id);
        json.users[0] = transform(json.users[0]);
      }
      await route.fulfill({ response, json });
    } catch (error) {
      // React Query refetches user details in the background, so a request
      // can still be in flight when the test ends — fulfilling is impossible
      // and irrelevant then. Rethrow anything else.
      if (page.isClosed() || /Test ended/i.test(String(error))) return;
      throw error;
    }
  });

  return { userId: () => userIdPromise };
}

/**
 * Clears persisted app state (Redux user slice + React Query cache) before
 * every document load, so the app must rebuild permissions from the
 * (intercepted) user-details fetch instead of hydrating stale grants from the
 * auth storageState.
 */
export async function resetAppBootState(page: Page): Promise<void> {
  await clearPersistedQueryCache(page);
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("persist:user");
    } catch {
      // Storage unavailable — nothing to clear.
    }
  });
}

export const FORBIDDEN_TEXT = "Error code: 403 forbidden access";

/**
 * Asserts a guarded route denied direct navigation with the canonical
 * surface: RouteGuard's in-place forbidden UI, URL unchanged.
 *
 * This is strict on purpose. useContextAwareRouting used to also enforce
 * access on every pathname change (racing RouteGuard, with the winner
 * depending on build mode); it now only redirects on a context *switch*, so
 * for direct navigation RouteGuard is the single denial surface in both dev
 * and production builds.
 */
export async function expectRouteDenied(
  page: Page,
  { timeout = 120_000 }: { timeout?: number } = {}
): Promise<void> {
  const deniedAt = new URL(page.url()).pathname;
  await expect(page.getByText(FORBIDDEN_TEXT)).toBeVisible({ timeout });
  // Denial is in place — no silent redirect away from the route.
  expect(new URL(page.url()).pathname).toBe(deniedAt);
}

/**
 * Seeds the "last active group" preference so the next page load boots with
 * the given group active (and, for a non-AirQo group, in external-org
 * context). Register interception + resetAppBootState first, then call this
 * with the id from `interceptUserDetails().userId()`.
 */
export async function seedActiveGroup(
  page: Page,
  userId: string,
  groupId: string
): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Storage unavailable — the app will fall back to its default group.
      }
    },
    { key: `lastActiveGroupId_${userId}`, value: groupId }
  );
}
