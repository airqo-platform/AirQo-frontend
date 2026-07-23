"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import TopNav from "@/components/dashboard/top-nav"
import Sidebar from "@/components/dashboard/sidebar"
import { GroupProvider, useGroup } from "@/lib/group-context"

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
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start with collapsed sidebar
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const loading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const rawUser = session?.user
  
  const user: User | null = rawUser ? {
    id: (rawUser as any).id,
    _id: (rawUser as any)._id,
    first_name: rawUser.firstName,
    last_name: rawUser.lastName,
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    email: rawUser.email || undefined,
    userName: (rawUser as any).userName,
    phone: (rawUser as any).phoneNumber,
    role: (rawUser as any).privilege || 'user',
  } : null;

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
      <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
        {/* Top Navigation - Fixed at top */}
        <TopNav
          user={user}
          loading={loading}
          isLoggingOut={isLoggingOut}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Sidebar and Main Content Container */}
        <div className="flex flex-1 overflow-hidden pt-3">
          {/* Sidebar - Below Top Nav with spacing */}
          <Sidebar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main Content - Scrollable behind top nav */}
          <main className="flex-1 overflow-y-auto p-4 pr-4 pt-20">
            <GroupRouteGuard>{children}</GroupRouteGuard>
          </main>
        </div>
      </div>
    </GroupProvider>
  )
}

function GroupRouteGuard({ children }: { children: React.ReactNode }) {
  const { activeGroup, isActiveGroupAdmin, hasPermission, loading } = useGroup()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading || !pathname) return

    const isAirqoGroup = activeGroup?.toLowerCase() === 'airqo'
    const canMaintainDevices = hasPermission('DEVICE_MAINTAIN') || isActiveGroupAdmin

    // Path definitions & permission checks
    const isOverview = pathname === '/dashboard' || pathname === '/dashboard/'
    const isRestrictedAirqoOnly = 
      pathname.startsWith('/dashboard/collocation') ||
      pathname.startsWith('/dashboard/firmware') ||
      pathname.startsWith('/dashboard/category') ||
      pathname.startsWith('/dashboard/stock')

    const isRestrictedFeature =
      pathname.startsWith('/dashboard/analytics') ||
      pathname.startsWith('/dashboard/maintenance') ||
      pathname.startsWith('/dashboard/reports')

    if (isOverview || isRestrictedAirqoOnly || isRestrictedFeature) {
      if (!canMaintainDevices) {
        router.replace('/dashboard/devices')
      }
    }
  }, [activeGroup, isActiveGroupAdmin, hasPermission, loading, pathname, router])

  if (loading && !activeGroup) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500 font-medium">Updating active group...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}