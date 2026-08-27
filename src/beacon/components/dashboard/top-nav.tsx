"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Bell, LogOut, Loader2, RefreshCw } from "lucide-react"
import { AqAirQo, AqHelpCircle, AqMenu01 } from "@airqo/icons-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import GroupSelector from "@/components/dashboard/group-selector"
import { syncGroups } from "@/services/device-api.service"
import { useToast } from "@/components/ui/use-toast"
import { useGroup } from "@/lib/group-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import AppDropdown from "./app-dropdown"
import { openFeedbackDialog } from "@/components/features/feedback/feedback-dialog"

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

interface TopNavProps {
  user: User | null
  loading: boolean
  isLoggingOut: boolean
  onToggleAdminMenu: () => void
  onLogout: () => void
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Network Overview",
  "/dashboard/devices": "Devices",
  "/dashboard/analytics": "Performance Analysis",
  "/dashboard/maintenance": "Maintenance",
  "/dashboard/reports": "Reports",
  "/dashboard/diagnostics": "Diagnostics",
  "/dashboard/diagnostics/simulator": "Bench Simulator",
  "/dashboard/settings/device-profiles": "Device Profiles",
  "/dashboard/settings/diagnostic-templates": "Diagnostic Templates",
  "/dashboard/collocation/inlab": "In-Lab Collocation",
  "/dashboard/collocation/site": "Field Collocation",
  "/dashboard/firmware": "Firmware Management",
  "/dashboard/category": "Device Categories",
  "/dashboard/stock": "Stock & Inventory",
  "/dashboard/visualise": "Data Analysis",
  "/dashboard/visualize": "Data Analysis",
  "/dashboard/settings": "Settings",
  "/dashboard/users": "User Management",
  "/dashboard/alerts": "Alerts",
}

function getPageTitle(pathname: string | null, searchParams?: URLSearchParams | null): string {
  if (!pathname) return "Beacon"

  // Query parameter overrides (e.g. analytics tab)
  if (pathname === "/dashboard/analytics" && searchParams) {
    const analysis = searchParams.get("analysis")
    if (analysis === "cohorts") return "Cohort Analysis"
    if (analysis === "grids") return "Grid Analysis"
  }

  // Exact match
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname]
  }

  // Dynamic device details route /dashboard/devices/[id]
  if (pathname.startsWith("/dashboard/devices/")) {
    if (pathname.endsWith("/diagnostics")) {
      return "Device Diagnostics"
    }
    return "Device Details"
  }

  // Collocation subroutes
  if (pathname.startsWith("/dashboard/collocation/inlab/")) {
    return "In-Lab Collocation"
  }
  if (pathname.startsWith("/dashboard/collocation/site/")) {
    return "Field Collocation"
  }

  // Category subroutes
  if (pathname.startsWith("/dashboard/category/")) {
    return "Device Category Details"
  }

  // Analytics subroutes
  if (pathname.startsWith("/dashboard/analytics/")) {
    return "Performance Analysis"
  }

  // Fallback
  return "Beacon"
}

export default function TopNav({
  user,
  loading,
  isLoggingOut,
  onToggleAdminMenu,
  onLogout,
}: Readonly<TopNavProps>) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageTitle = getPageTitle(pathname, searchParams)

  const { toast } = useToast()
  const { activeGroup } = useGroup()
  const isAirqoGroup = activeGroup?.toLowerCase() === "airqo"
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isSyncingGroups, setIsSyncingGroups] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate user initials from first_name and last_name
  const getUserInitials = (user: User | null) => {
    if (!user) return "U"
    const firstInitial = (user.first_name || user.firstName)?.[0]?.toUpperCase() || ""
    const lastInitial = (user.last_name || user.lastName)?.[0]?.toUpperCase() || ""
    if (firstInitial || lastInitial) {
      return firstInitial + lastInitial
    }
    const emailOrUsername = user.email || user.userName
    return emailOrUsername?.[0]?.toUpperCase() || "U"
  }

  // Get display name
  const getDisplayName = (user: User | null) => {
    if (!user) return "User"
    const firstName = user.first_name || user.firstName || ""
    const lastName = user.last_name || user.lastName || ""
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || user.email || user.userName || "User"
  }

  const userInitials = getUserInitials(user)
  const displayName = getDisplayName(user)

  const handleLogoutClick = () => {
    setShowLogoutDialog(false)
    onLogout()
  }

  const handleSyncGroups = async () => {
    setIsSyncingGroups(true)
    try {
      await syncGroups()
      toast({
        title: "Groups sync successful",
        description: "Groups synced successfully.",
      })
    } catch (error) {
      console.error("Error syncing groups:", error)
      toast({
        variant: "destructive",
        title: "Groups sync failed",
        description: error instanceof Error ? error.message : "Failed to sync groups.",
      })
    } finally {
      setIsSyncingGroups(false)
    }
  }

  return (
    <>
      <header className="relative z-40 w-full shrink-0">
        <Card className="w-full p-0 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between w-full h-14 px-3 sm:px-4">
            {/* Left Section: Hamburger & Brand */}
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-1 mr-1 p-2 rounded-lg text-foreground hover:bg-muted"
                onClick={onToggleAdminMenu}
                aria-label="Open AirQo Admin Panel"
                title="AirQo Admin Panel"
              >
                <AqMenu01 className="w-5 h-5 text-foreground" />
              </Button>

              <Link
                href="/dashboard/devices"
                className="flex items-center space-x-2.5 cursor-pointer focus:outline-none"
              >
                <AqAirQo size={32} color="#0A84FF" />
                <span className="text-lg font-bold text-foreground tracking-tight hidden xs:inline-block">
                  Beacon
                </span>
              </Link>
            </div>

            {/* Middle Section: Page Title (Nexus Style) */}
            <div className="flex-1 ml-4 sm:ml-6 min-w-0">
              <h1 className="text-base sm:text-xl font-normal text-foreground truncate">
                {pageTitle}
              </h1>
            </div>

            {/* Right Section: Controls & Profile */}
            <div className="flex items-center gap-x-2 sm:gap-x-3 shrink-0">
              <GroupSelector />

              {isAirqoGroup && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncGroups}
                  disabled={isSyncingGroups}
                  className="hidden md:inline-flex items-center rounded-lg"
                >
                  {isSyncingGroups ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  <span>{isSyncingGroups ? "Syncing..." : "Sync Groups"}</span>
                </Button>
              )}

              {/* Help & Feedback */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openFeedbackDialog}
                className="text-muted-foreground hover:text-foreground rounded-full h-9 w-9 hover:bg-muted transition-colors"
                title="Help & Feedback"
                aria-label="Help & Feedback"
              >
                <AqHelpCircle className="w-5 h-5" />
              </Button>

              {/* Apps Dropdown */}
              <AppDropdown />

              {/* Notifications */}
              <button
                type="button"
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>

              {/* User profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center cursor-pointer hover:bg-transparent p-0 m-0 focus-visible:ring-0 rounded-full"
                    title={`AirQo Account\n${displayName}`}
                    aria-label="AirQo Account"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.profilePicture || user?.image || ""}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 px-2 bg-card border border-border shadow-lg rounded-xl mt-1 z-[9999]"
                >
                  <div className="flex items-center p-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.profilePicture || user?.image || ""}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5 pl-2 truncate">
                      <p className="text-sm font-semibold leading-none text-foreground truncate">
                        {displayName.length > 18
                          ? displayName.slice(0, 18) + "..."
                          : displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email || user?.userName}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    className="flex items-center text-red-600 focus:text-red-600 cursor-pointer p-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut} className="rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
