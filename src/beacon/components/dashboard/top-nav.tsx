"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Loader2, RefreshCw, Moon, Sun } from "lucide-react"
import { AqAirQo, AqHelpCircle } from '@airqo/icons-react'
import { Button } from "@/components/ui/button"
import GroupSelector from "@/components/dashboard/group-selector"
import { syncGroups } from "@/services/device-api.service"
import authService from "@/services/api-service"
import { useToast } from "@/components/ui/use-toast"
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
import { useTheme } from "next-themes"
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
  onToggleSidebar: () => void
  onLogout: () => void
}

const GROUP_SYNC_ADMIN_EMAIL = "gibson@airqo.net"

function decodeJwtEmail(token: string | null): string | null {
  if (!token) return null

  try {
    const rawToken = token.replace(/^(JWT|Bearer)\s+/i, "")
    const parts = rawToken.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1].replaceAll('-', '+').replaceAll('_', '/')))
    return payload.email || payload.userName || payload.username || null
  } catch {
    return null
  }
}

export default function TopNav({
  user,
  loading,
  isLoggingOut,
  onToggleSidebar,
  onLogout,
}: Readonly<TopNavProps>) {
  const { toast } = useToast()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isSyncingGroups, setIsSyncingGroups] = useState(false)
  const [canSyncGroups, setCanSyncGroups] = useState(false)
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  useEffect(() => {
    const email = decodeJwtEmail(authService.getToken())
    setCanSyncGroups(email?.toLowerCase() === GROUP_SYNC_ADMIN_EMAIL)
  }, [])

  // Generate user initials from first_name and last_name
  const getUserInitials = (user: User | null) => {
    if (!user) return "U"
    
    const firstInitial = (user.first_name || user.firstName)?.[0]?.toUpperCase() || ""
    const lastInitial = (user.last_name || user.lastName)?.[0]?.toUpperCase() || ""
    
    if (firstInitial || lastInitial) {
      return firstInitial + lastInitial
    }
    
    // Fallback to email or userName
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
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6 flex-shrink-0 mx-4 mt-3 rounded-xl border border-gray-300 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="flex items-center space-x-2 cursor-pointer"
            onClick={onToggleSidebar}
          >
            <AqAirQo size={48} color="#0A84FF" />
            <span className="text-xl font-bold text-gray-800">Beacon</span>
          </button>
        </div>
        <div className="flex items-center gap-x-3 pr-2">
          <GroupSelector />
          {canSyncGroups && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncGroups}
              disabled={isSyncingGroups}
            >
              {isSyncingGroups ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              <span className="hidden sm:inline">{isSyncingGroups ? "Syncing..." : "Sync Groups"}</span>
            </Button>
          )}

          {/* Help & Feedback */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openFeedbackDialog}
            className="text-muted-foreground hover:text-foreground rounded-full p-2 h-10 w-10 hover:bg-gray-100 dark:hover:bg-primary/10 transition-colors"
            title="Help & Feedback"
            aria-label="Help & Feedback"
          >
            <AqHelpCircle className="!h-7 !w-7" />
          </Button>

          {/* Apps Dropdown */}
          <AppDropdown />

          {/* Notifications */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6 text-gray-500 hover:text-primary" />
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
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.profilePicture || user?.image || ''}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary hover:text-foreground font-semibold">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 px-2 bg-white dark:bg-card border border-gray-200 dark:border-border shadow-lg rounded-xl mt-1 z-[9999]">
              <div className="flex items-center p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.profilePicture || user?.image || ''}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 pl-2 truncate">
                  <p className="text-sm font-semibold leading-none text-foreground truncate">
                    {displayName.length > 18
                      ? displayName.slice(0, 18) + '...'
                      : displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || user?.userName}
                  </p>
                </div>
              </div>

              {/* <DropdownMenuSeparator className="bg-gray-100 dark:bg-border" />

              <DropdownMenuItem
                onClick={toggleDarkMode}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-primary/10"
              >
                {mounted && resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem> */}
              
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-border" />
              
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
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
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
