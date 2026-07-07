# Data Fetching Strategy

Two caching libraries with clear boundaries.

## SWR — Persistent, User-Scoped Data

Use for data that persists across sessions and needs cache invalidation by key pattern.

**Examples:** user profile, preferences, devices, cohorts, clients, admin data.

```ts
import useSWR from 'swr';

export function usePreferences() {
  return useSWR('preferences/list', fetchPreferences);
}
```

**Mutations:** use `useSWRMutation` for write operations that should invalidate cached data.

```ts
import useSWRMutation from 'swr/mutation';

export function useUpdatePreference() {
  return useSWRMutation('preferences', updatePreference);
}
```

## TanStack Query — Ephemeral, Query-Key-Based Data

Use for data that is ephemeral and benefits from stale-while-revalidate. Cache is organized by array keys for composability.

**Examples:** analytics charts, map readings, site data, forecasts, countries.

```ts
import { useQuery } from '@tanstack/react-query';

export function useSiteAnalytics(siteId: string, range: string) {
  return useQuery({
    queryKey: ['analytics', 'site', siteId, range],
    queryFn: () => fetchSiteAnalytics(siteId, range),
  });
}
```

## Cache Invalidation on Group Switch

Both caches are invalidated in `useUserActions.ts` on group switch:

- **SWR:** clears structural keys (preferences, cohorts, devices) with `revalidate: true` so active subscriptions refetch immediately; clears analytics keys with `revalidate: false` to avoid large background fetches.
- **TanStack Query:** removes group-scoped queries via `queryClient.removeQueries` predicate.

This prevents stale cross-group data from leaking into the new context.

## When to Use Which

| Scenario                        | Library              |
| ------------------------------- | -------------------- |
| Persistent, user-scoped data    | SWR                  |
| Ephemeral, query-based data     | TanStack Query       |
| Mutations                       | SWR `useSWRMutation` |
| New group-scoped analytics hook | TanStack Query       |
| New user preferences hook       | SWR                  |

## Key Conventions

- **TanStack Query:** array keys for composability — `['analytics', 'site', siteId, range]`
- **SWR:** path-like strings for flat keys — `'preferences/list'`, `'group/cohorts'`
- Keep keys descriptive; they drive cache identity and invalidation logic.
