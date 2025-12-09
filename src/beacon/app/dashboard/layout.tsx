"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import authService from "@/services/api-service"
import TopNav from "@/components/dashboard/top-nav"
import Sidebar from "@/components/dashboard/sidebar"

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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Only check authentication on client side
        if (typeof window === 'undefined') {
          return
        }

        // Check if user is authenticated
        const authStatus = authService.isAuthenticated()
        setIsAuthenticated(authStatus)
        
        if (!authStatus) {
          // Clear any stale data and redirect to login
          authService.logout()
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
        if (typeof window !== 'undefined') {
          authService.logout()
          router.push("/login")
        }
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
    }

  }

  // Check authentication status periodically
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated()
      setIsAuthenticated(authStatus)
      
      if (!authStatus) {
        authService.logout()
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
        <main className="flex-1 overflow-y-auto p-4 pr-4 pt-20">{children}</main>
      </div>
    </div>
  )
}