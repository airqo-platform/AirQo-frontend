"use client"

import { useEffect, useState } from "react"
import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  MapPin,
  Bell,
  Settings,
  Menu,
  X,
  Home,
  Users,
  LogOut,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import authService from "@/services/api-service"
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          // Clear any stale data and redirect to login
          authService.clearAllAuthData()
          router.push("/login")
          return
        }

        // Get user data from auth service
        const userData = authService.getUserData()
        
        if (userData) {
          // Normalize user data structure (handle different API response formats)
          const normalizedUser: User = {
            id: userData.id || userData._id,
            _id: userData._id || userData.id,
            first_name: userData.first_name || userData.firstName,
            last_name: userData.last_name || userData.lastName,
            firstName: userData.firstName || userData.first_name,
            lastName: userData.lastName || userData.last_name,
            email: userData.email || userData.userName,
            userName: userData.userName || userData.email,
            phone: userData.phone,
            role: userData.role || 'user',
            created_at: userData.created_at || userData.createdAt
          }
          setUser(normalizedUser)
        } else {
          // If no user data but authenticated, try to fetch from API
          await fetchUserFromAPI()
        }
      } catch (error) {
        console.error("Error initializing user:", error)
        // On error, redirect to login
        authService.clearAllAuthData()
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    initializeUser()
  }, [router])

  // Fetch user data from API if needed
  const fetchUserFromAPI = async () => {
    try {
      const token = authService.getToken()
      if (!token) {
        throw new Error("No authentication token")
      }

      // Try to fetch from the API
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401 || response.status === 403) {
        // Token is invalid
        throw new Error("Invalid authentication")
      }

      if (response.ok) {
        const userData = await response.json()
        
        // Store user data in auth service
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(userData))
        }
        
        setUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user from API:", error)
      // If we can't fetch user data, use what we have or show default
      const storedData = authService.getUserData()
      if (storedData) {
        setUser(storedData)
      }
    }
  }


  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // Clear all authentication data
      authService.logout()
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to login with logout flag
      router.push("/login?action=logout")
      
      // Force page refresh to clear any cached data
      router.refresh()
      
    } catch (error) {
      console.error("Logout error:", error)
      
      // Force logout even if there's an error
      authService.forceLogout()
      
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }

  }

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

  // Check authentication status periodically
  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        authService.clearAllAuthData()
        router.push("/login")
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkAuth, 30000)
    
    // Also check on focus
    const handleFocus = () => checkAuth()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [router])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-primary text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/10">
          <div
            className={`flex items-center ${
              !sidebarOpen && "justify-center w-full"
            }`}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8ystA7fUvSxUyn8lJlJplrEDq9D64a.png"
              alt="AirQo Logo"
              width={sidebarOpen ? 100 : 40}
              height={35}
              className="object-contain"
              priority
            />
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white p-1 rounded-md hover:bg-primary-foreground/10"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                <Home className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Overview</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/analytics"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                <BarChart3 className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Analytics</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/devices"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                <MapPin className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Devices</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/alerts"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Alerts</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/users"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                <Users className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Users</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                <Settings className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout button in sidebar (optional) */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-foreground/10">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center w-full p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              disabled={isLoggingOut}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
              sidebarOpen && "hidden md:block"
            }`}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
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
        <main className="p-4">{children}</main>
      </div>

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
              onClick={handleLogout}
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

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-2 bg-gray-900 text-white text-xs rounded-md opacity-50 hover:opacity-100 transition-opacity">
          <p>Auth: {authService.isAuthenticated() ? '✓' : '✗'}</p>
          <p>User: {user?.email || 'None'}</p>
          <button 
            onClick={() => authService.forceLogout()}
            className="text-red-400 underline mt-1"
          >
            Force Logout
          </button>
        </div>
      )}
    </div>
  )
}