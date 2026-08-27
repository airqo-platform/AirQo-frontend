"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import TopNav from "@/components/dashboard/top-nav"
import Sidebar from "@/components/dashboard/sidebar"
import GlobalAdminSidebar from "@/components/dashboard/global-admin-sidebar"
import { GroupProvider, useGroup } from "@/lib/group-context"
import { cn } from "@/lib/utils"
import { LoadingState } from "@/components/ui/loading-state"

type User = {
  id?: number
  _id?: string
  first_name?: string
  last_name?: string
  firstName?: string
  lastName?: string
  email?: string
  userName?: string
  phone?: string
  role?: string
  created_at?: string
  profilePicture?: string
  image?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const loading = status === "loading"
  const rawUser = session?.user

  const user: User | null = rawUser
    ? {
        id: (rawUser as any).id,
        _id: (rawUser as any)._id,
        first_name: rawUser.firstName,
        last_name: rawUser.lastName,
        firstName: rawUser.firstName,
        lastName: rawUser.lastName,
        email: rawUser.email || undefined,
        userName: (rawUser as any).userName,
        phone: (rawUser as any).phoneNumber,
        role: (rawUser as any).privilege || "user",
        profilePicture: (rawUser as any).profilePicture,
        image: (rawUser as any).image,
      }
    : null

  const pathname = usePathname()
  const isMapRoute = Boolean(
    pathname && (
      pathname.startsWith("/dashboard/maintenance") ||
      pathname.startsWith("/dashboard/map") ||
      pathname.includes("/map")
    )
  )

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ callbackUrl: "/login?action=logout" })
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  // Redirect to login if unauthenticated or token expired
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || (status === "authenticated" && !session?.user)) {
      if (status === "authenticated" && !session?.user) {
        // Token expired but NextAuth session still exists, force sign out
        signOut({ redirect: false })
      }
      router.push("/login")
    }
  }, [status, session, router])

  return (
    <GroupProvider>
      <div className="flex flex-col h-screen gap-2 px-1.5 pt-1.5 pb-0.5 overflow-hidden bg-background">
        {/* Top Navigation Bar */}
        <TopNav
          user={user}
          loading={loading}
          isLoggingOut={isLoggingOut}
          onToggleAdminMenu={() => setAdminSidebarOpen(!adminSidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Main Row Container (Sidebar + Content) with gap */}
        <div className="flex flex-1 gap-2 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Scrollable Main Content Area */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <main
              id="main-content"
              className={cn(
                "flex-1 flex flex-col",
                isMapRoute ? "overflow-hidden h-full w-full" : "overflow-y-auto overflow-x-hidden"
              )}
            >
              {isMapRoute ? (
                <div className="flex-1 min-h-0 flex flex-col w-full h-full">
                  <GroupRouteGuard>{children}</GroupRouteGuard>
                </div>
              ) : (
                /* Content Container matching Nexus padding and max-w layout */
                <div className="flex-grow w-full max-w-full">
                  <div className="container px-1 py-6 mx-auto md:px-6 lg:px-8 w-full max-w-7xl">
                    <GroupRouteGuard>{children}</GroupRouteGuard>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Slide-over Global Admin Sidebar */}
        <GlobalAdminSidebar
          isOpen={adminSidebarOpen}
          onClose={() => setAdminSidebarOpen(false)}
        />
      </div>
    </GroupProvider>
  )
}

function GroupRouteGuard({ children }: { children: React.ReactNode }) {
  const { activeGroup, isActiveGroupAdmin, hasPermission, hasAnyPermission, loading } = useGroup()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading || !pathname) return

    const isAirqoGroup = activeGroup?.toLowerCase() === "airqo"
    const canMaintainDevices = hasPermission("DEVICE_MAINTAIN") || isActiveGroupAdmin

    // Path definitions & permission checks
    const isOverview = pathname === "/dashboard" || pathname === "/dashboard/"
    const isRestrictedAirqoOnly =
      pathname.startsWith("/dashboard/collocation") ||
      pathname.startsWith("/dashboard/firmware") ||
      pathname.startsWith("/dashboard/category") ||
      pathname.startsWith("/dashboard/stock")

    const isAnalytics = pathname.startsWith("/dashboard/analytics")
    const canAccessAnalytics =
      Boolean(activeGroup) &&
      (!isAirqoGroup || canMaintainDevices || hasAnyPermission(["ANALYTICS_VIEW", "DATA_VIEW"]))

    const isMaintenance = pathname.startsWith("/dashboard/maintenance")
    const canAccessMaintenance =
      Boolean(activeGroup) && (!isAirqoGroup || canMaintainDevices || hasPermission("DEVICE_MAINTAIN"))

    const isReports = pathname.startsWith("/dashboard/reports")
    const canAccessReports =
      Boolean(activeGroup) &&
      (!isAirqoGroup || canMaintainDevices || hasAnyPermission(["DATA_EXPORT", "ANALYTICS_EXPORT", "DATA_VIEW"]))

    const isVisualise =
      pathname.startsWith("/dashboard/visualise") || pathname.startsWith("/dashboard/visualize")
    const canAccessVisualise = Boolean(activeGroup)

    if ((isOverview || isRestrictedAirqoOnly) && (!isAirqoGroup || !canMaintainDevices)) {
      router.replace("/dashboard/devices")
    } else if (isAnalytics && !canAccessAnalytics) {
      router.replace("/dashboard/devices")
    } else if (isMaintenance && !canAccessMaintenance) {
      router.replace("/dashboard/devices")
    } else if (isReports && !canAccessReports) {
      router.replace("/dashboard/devices")
    } else if (isVisualise && !canAccessVisualise) {
      router.replace("/dashboard/devices")
    }
  }, [activeGroup, isActiveGroupAdmin, hasPermission, hasAnyPermission, loading, pathname, router])

  if (loading && !activeGroup) {
    return <LoadingState text="Updating active group..." className="min-h-[50vh]" />
  }

  return <>{children}</>
}