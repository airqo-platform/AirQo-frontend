import type { UserGroup } from "@/lib/group-context"

/** What the platform's discovery endpoint tells us about an organisation the person may join. */
export type DiscoverableOrganisation = Pick<UserGroup, "_id" | "grp_title" | "organization_slug">

export interface OrganisationOption {
  id: string
  title: string
  /** Only members can switch to it. Everyone else asks for access in Nexus. */
  isMember: boolean
  /** Lower-cased and with underscores spelled out, as a member's role is. */
  roleName?: string
}

/** `GET /users/groups/discover` returns `{ groups: [...] }`; anything unusable is left out. */
export function normalizeDiscoveredOrganisations(payload: unknown): DiscoverableOrganisation[] {
  const groups = (payload as { groups?: unknown } | null)?.groups
  if (!Array.isArray(groups)) return []

  return groups.flatMap((group) => {
    const { _id, grp_title, organization_slug } = (group ?? {}) as Record<string, unknown>
    if (typeof _id !== "string" || typeof grp_title !== "string" || !grp_title) return []
    return [
      {
        _id,
        grp_title,
        organization_slug: typeof organization_slug === "string" ? organization_slug : undefined,
      },
    ]
  })
}

const sameOrganisation = (a: DiscoverableOrganisation, b: DiscoverableOrganisation): boolean => {
  if (a._id === b._id) return true
  const slugA = a.organization_slug?.trim().toLowerCase()
  const slugB = b.organization_slug?.trim().toLowerCase()
  if (slugA && slugB && slugA === slugB) return true
  return a.grp_title.trim().toLowerCase() === b.grp_title.trim().toLowerCase()
}

/** The person's own organisations first, then the others they could ask to join. */
export function mergeOrganisationOptions(
  memberships: UserGroup[],
  discovered: DiscoverableOrganisation[] = []
): OrganisationOption[] {
  return [
    ...memberships.map((group) => ({
      id: group._id,
      title: group.grp_title,
      isMember: true,
      roleName: group.role?.role_name?.replaceAll("_", " ").toLowerCase(),
    })),
    ...discovered
      .filter((group) => !memberships.some((member) => sameOrganisation(member, group)))
      .map((group) => ({ id: group._id, title: group.grp_title, isMember: false })),
  ]
}
