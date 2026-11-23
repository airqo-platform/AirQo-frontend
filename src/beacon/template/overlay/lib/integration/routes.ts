/**
 * Pages beyond the shared ones. Empty in the template; add your own pages' routes, titles and
 * admin-menu entries here so the navigation, sidebar and analytics pick them up.
 */
import type { NavItemConfig } from "@/components/dashboard/nav-config"

export const EXTENSION_ROUTES = {} as const

/** Everything under these belongs to the admin module. */
export const EXTENSION_ADMIN_ROUTE_PREFIXES: string[] = []

/** Entries for "Recently Visited", after the shared ones. */
export const EXTENSION_RECENT_PAGES: Array<{ label: string; href: string; exact?: boolean }> = []

export const EXTENSION_PAGE_TITLES: Record<string, string> = {}

/** Titles for pages below these paths. */
export const EXTENSION_TITLE_PREFIXES: Array<[prefix: string, title: string]> = []

/** Administrative Panel entries, placed before Sensor Manufacturers. */
export const EXTENSION_ADMIN_NAV_ITEMS: NavItemConfig[] = []

/** App routes of these pages, for analytics (see ROUTE_TEMPLATES in lib/analytics.ts). */
export const EXTENSION_ROUTE_TEMPLATES: string[] = []
