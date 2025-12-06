"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Loader2 } from "lucide-react"
import { AqAirQo, AqAlignLeft } from '@airqo/icons-react'
import { Button } from "@/components/ui/button"
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

interface TopNavProps {
  user: User | null
  loading: boolean
  isLoggingOut: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}

export default function TopNav({
  user,
  loading,
  isLoggingOut,
  onToggleSidebar,
  onLogout,
}: TopNavProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const router = useRouter()

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

  return (
    <>
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6 flex-shrink-0 mx-4 mt-3 rounded-xl border border-gray-300 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
            type="button"
          >
            <AqAlignLeft size={30} color="#0A84FF" />
          </button>
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => router.push('/dashboard')}
          >
            <AqAirQo size={48} color="#0A84FF" />
            <span className="text-xl font-bold text-gray-800">Beacon</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-primary transition-colors" />
          <div className="flex items-center space-x-2">
            {/* User Avatar with initials */}
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                userInitials
              )}
            </div>
            
            {/* User name and logout button */}
            <div className="flex items-center space-x-2">
              {!loading && user && (
                <span className="text-sm text-gray-700 hidden sm:inline-block max-w-32 truncate">
                  {displayName}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
                onClick={() => setShowLogoutDialog(true)}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </Button>
            </div>
          </div>
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
