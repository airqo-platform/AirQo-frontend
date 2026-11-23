import { beaconConfig } from "@/beacon.config"

/**
 * The demo user and the groups they belong to. The mock backend serves these from the
 * platform endpoints (`/users/{id}`), and the demo sign-in in lib/auth.ts puts the same
 * user on the session, so everything that reads either one agrees.
 */

const permissions = (names: string[]) =>
  names.map((permission, index) => ({ _id: `perm-${index + 1}`, permission }))

const ADMIN_PERMISSIONS = permissions([
  "SYSTEM_ADMIN",
  "DEVICE_MAINTAIN",
  "DEVICE_DEPLOY",
  "DEVICE_RECALL",
  "ANALYTICS_VIEW",
  "ANALYTICS_EXPORT",
  "DATA_VIEW",
  "DATA_EXPORT",
])

const MEMBER_PERMISSIONS = permissions(["DATA_VIEW", "DATA_EXPORT", "ANALYTICS_VIEW"])

export const DEMO_USER_ID = "000000000000000000000001"

/** Group ids are stable so links and stored preferences survive restarts. */
export const DEMO_GROUPS = [
  {
    _id: "100000000000000000000001",
    grp_title: beaconConfig.auth.systemGroupSlug,
    grp_profile_picture: null,
    organization_slug: beaconConfig.auth.systemGroupSlug,
    status: "ACTIVE",
    createdAt: "2025-01-06T08:00:00.000Z",
    role: { _id: "200000000000000000000001", role_name: "SYSTEM_ADMIN", role_permissions: ADMIN_PERMISSIONS },
  },
  {
    _id: "100000000000000000000002",
    grp_title: "riverside_city",
    grp_profile_picture: null,
    organization_slug: "riverside-city",
    status: "ACTIVE",
    createdAt: "2025-02-14T08:00:00.000Z",
    role: { _id: "200000000000000000000002", role_name: "RIVERSIDE_CITY_ADMIN", role_permissions: ADMIN_PERMISSIONS },
  },
  {
    _id: "100000000000000000000003",
    grp_title: "lakeshore_university",
    grp_profile_picture: null,
    organization_slug: "lakeshore-university",
    status: "ACTIVE",
    createdAt: "2025-04-02T08:00:00.000Z",
    role: { _id: "200000000000000000000003", role_name: "LAKESHORE_UNIVERSITY_MEMBER", role_permissions: MEMBER_PERMISSIONS },
  },
]

export const DEMO_USER = {
  _id: DEMO_USER_ID,
  firstName: "Demo",
  lastName: "Admin",
  userName: "demo@example.org",
  email: "demo@example.org",
  country: "",
  timezone: "UTC",
  phoneNumber: "",
  profilePicture: "",
  privilege: "admin",
  organization: beaconConfig.auth.systemGroupSlug,
  verified: true,
  isActive: true,
  groups: DEMO_GROUPS,
  networks: [],
}

const base64Url = (value: string) =>
  (typeof Buffer !== "undefined" ? Buffer.from(value).toString("base64") : btoa(value))
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

/**
 * An unsigned token in JWT form. Nothing verifies it: the mock backend accepts any request.
 * It only needs to decode, because parts of the app read the expiry out of the token.
 */
export function createDemoAccessToken(lifetimeSeconds = 30 * 24 * 60 * 60): { token: string; exp: number } {
  const exp = Math.floor(Date.now() / 1000) + lifetimeSeconds
  const header = base64Url(JSON.stringify({ alg: "none", typ: "JWT" }))
  const payload = base64Url(
    JSON.stringify({
      _id: DEMO_USER._id,
      email: DEMO_USER.email,
      userName: DEMO_USER.userName,
      firstName: DEMO_USER.firstName,
      lastName: DEMO_USER.lastName,
      organization: DEMO_USER.organization,
      privilege: DEMO_USER.privilege,
      exp,
    }),
  )
  return { token: `${header}.${payload}.demo`, exp }
}
