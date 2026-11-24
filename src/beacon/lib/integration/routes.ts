/**
 * Pages Beacon has beyond the shared ones: AirQo's lab, firmware and inventory tools. Everything
 * the navigation, the sidebar and analytics need to know about them is here. The exported template
 * replaces this file with an empty version (template/overlay/lib/integration/routes.ts).
 */
import { AqBeaker02, AqBox, AqLayersThree01, AqPackage } from "@airqo/icons-react"
import type { NavItemConfig } from "@/components/dashboard/nav-config"

export const EXTENSION_ROUTES = {
  COLLOCATION_INLAB: "/dashboard/collocation/inlab",
  COLLOCATION_SITE: "/dashboard/collocation/site",
  FIRMWARE: "/dashboard/firmware",
  CATEGORIES: "/dashboard/category",
  STOCK: "/dashboard/stock",
  USERS: "/dashboard/users",
} as const

/** Everything under these belongs to the admin module. */
export const EXTENSION_ADMIN_ROUTE_PREFIXES: string[] = [
  "/dashboard/collocation",
  EXTENSION_ROUTES.FIRMWARE,
  EXTENSION_ROUTES.CATEGORIES,
  EXTENSION_ROUTES.STOCK,
  // User management isn't in the admin menu yet, but it is an admin surface.
  EXTENSION_ROUTES.USERS,
]

/** Entries for "Recently Visited", after the shared ones. */
export const EXTENSION_RECENT_PAGES: Array<{ label: string; href: string; exact?: boolean }> = [
  { label: "In-Lab Collocation", href: EXTENSION_ROUTES.COLLOCATION_INLAB },
  { label: "Site Collocation", href: EXTENSION_ROUTES.COLLOCATION_SITE },
  { label: "Firmware Management", href: EXTENSION_ROUTES.FIRMWARE },
  { label: "Device Categories", href: EXTENSION_ROUTES.CATEGORIES },
  { label: "Stock & Inventory", href: EXTENSION_ROUTES.STOCK },
]

export const EXTENSION_PAGE_TITLES: Record<string, string> = {
  "/dashboard/collocation/inlab": "In-Lab Collocation",
  "/dashboard/collocation/site": "Field Collocation",
  "/dashboard/firmware": "Firmware Management",
  "/dashboard/category": "Device Categories",
  "/dashboard/stock": "Stock & Inventory",
  "/dashboard/users": "User Management",
}

/** Titles for pages below these paths, e.g. one batch or one category. */
export const EXTENSION_TITLE_PREFIXES: Array<[prefix: string, title: string]> = [
  ["/dashboard/collocation/inlab/", "In-Lab Collocation"],
  ["/dashboard/collocation/site/", "Field Collocation"],
  ["/dashboard/category/", "Device Category Details"],
]

/** Administrative Panel entries, placed before Sensor Manufacturers. */
export const EXTENSION_ADMIN_NAV_ITEMS: NavItemConfig[] = [
  {
    id: "admin-collocation",
    label: "Collocation",
    href: EXTENSION_ROUTES.COLLOCATION_INLAB,
    icon: AqBeaker02,
    description: "In-lab and on-site sensor collocation testing",
    isActive: (pathname) => pathname === "/dashboard/collocation" || pathname.startsWith("/dashboard/collocation/"),
    subroutes: [
      {
        id: "collocation-inlab",
        label: "In-Lab Collocation",
        href: EXTENSION_ROUTES.COLLOCATION_INLAB,
        description: "Review in-laboratory batch collocation results",
      },
      {
        id: "collocation-site",
        label: "Site Collocation",
        href: EXTENSION_ROUTES.COLLOCATION_SITE,
        description: "Field site collocation sensor calibration",
      },
    ],
  },
  {
    id: "admin-firmware",
    label: "Firmware Management",
    href: EXTENSION_ROUTES.FIRMWARE,
    icon: AqPackage,
    description: "Binary releases and over-the-air updates",
  },
  {
    id: "admin-categories",
    label: "Device Categories",
    href: EXTENSION_ROUTES.CATEGORIES,
    icon: AqLayersThree01,
    description: "Organize devices into functional categories",
  },
  {
    id: "admin-stock",
    label: "Stock & Inventory",
    href: EXTENSION_ROUTES.STOCK,
    icon: AqBox,
    description: "Hardware parts, inventory levels & stock movements",
  },
]

/** App routes of these pages, for analytics (see ROUTE_TEMPLATES in lib/analytics.ts). */
export const EXTENSION_ROUTE_TEMPLATES: string[] = [
  "/register",
  "/dashboard/category",
  "/dashboard/category/[categoryId]",
  "/dashboard/collocation/inlab",
  "/dashboard/collocation/inlab/[id]",
  "/dashboard/collocation/site",
  "/dashboard/collocation/site/[id]",
  "/dashboard/firmware",
  "/dashboard/stock",
  "/dashboard/users",
]
