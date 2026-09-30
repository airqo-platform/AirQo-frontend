"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import TopNav from "@/components/dashboard/top-nav"
import Sidebar from "@/components/dashboard/sidebar"
import PrimarySidebar from "@/components/dashboard/primary-sidebar"
import { GroupProvider, useGroup } from "@/lib/group-context"
import { useNavigationAccess } from "@/hooks/use-navigation-access"
import { getDevicesHome, getModuleForPath, isRouteAccessible } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { LoadingState } from "@/components/ui/loading-state"
import { NetworkStatusBanner } from "@/components/network-status-banner"
import { useConnectionRecoveryKey } from "@/hooks/use-network-status"

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
  const [primarySidebarOpen, setPrimarySidebarOpen] = useState(false)
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
  // Most pages fetch in useEffect with no retry, so when reads failed during an
  // outage the page is remounted once the connection is back to load them again
  const recoveryKey = useConnectionRecoveryKey()
  // Like Vertex, the sidebar module follows the URL: admin routes show the admin panel
  const activeModule = getModuleForPath(pathname)

  // Close the navigation drawer once a new page is reached
  useEffect(() => {
    setPrimarySidebarOpen(false)
  }, [pathname])

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
      <NetworkStatusBanner />
      <div className="flex flex-col h-screen gap-2 px-1.5 pt-1.5 pb-0.5 overflow-hidden bg-background">
        {/* Top Navigation Bar */}
        <TopNav
          user={user}
          loading={loading}
          isLoggingOut={isLoggingOut}
          onMenuClick={() => setPrimarySidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Row Container (Sidebar + Content) with gap */}
        <div className="flex flex-1 gap-2 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            activeModule={activeModule}
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
                  <GroupRouteGuard key={recoveryKey}>{children}</GroupRouteGuard>
                </div>
              ) : (
                /* Content Container matching Nexus padding and max-w layout */
                <div className="flex-grow w-full max-w-full">
                  <div className="container px-1 py-6 mx-auto md:px-6 lg:px-8 w-full max-w-7xl">
                    <GroupRouteGuard key={recoveryKey}>{children}</GroupRouteGuard>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Slide-over primary navigation: Home, Administrative Panel, Recently Visited */}
        <PrimarySidebar
          isOpen={primarySidebarOpen}
          onClose={() => setPrimarySidebarOpen(false)}
          activeModule={activeModule}
        />
      </div>
    </GroupProvider>
  )
}

function GroupRouteGuard({ children }: { children: React.ReactNode }) {
  const { activeGroup } = useGroup()
  const access = useNavigationAccess()
  const pathname = usePathname()
  const router = useRouter()

  // Same policy the sidebars use, so a page is reachable exactly when it is offered.
  // Also runs on group switches, moving users off pages the new group doesn't offer.
  const canViewRoute = !pathname || isRouteAccessible(pathname, access)
  const devicesHome = getDevicesHome(access)

  useEffect(() => {
    if (access.loading || canViewRoute) return
    router.replace(devicesHome)
  }, [access.loading, canViewRoute, devicesHome, router])

  if (access.loading && !activeGroup) {
    return <LoadingState text="Updating active group..." className="min-h-[50vh]" />
  }

  // Don't render (and start fetching for) a page we're about to leave
  if (!canViewRoute) {
    return <LoadingState text="Redirecting..." className="min-h-[50vh]" />
  }

  return <>{children}</>
}
