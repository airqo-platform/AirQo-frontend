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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { config } from "@/lib/config"

type User = {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
  created_at: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token')
    return token
  }

  // Fetch current user data
  const fetchUser = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        // No token, redirect to login
        router.push("/login")
        return
      }

      const response = await fetch(`${config.apiUrl}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        // Token is invalid, redirect to login
        localStorage.removeItem('access_token')
        router.push("/login")
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`)
      }

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user:", error)
      // On error, check if we have a token, if not redirect to login
      const token = getAuthToken()
      if (!token) {
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user") // Clean up any old user data
    router.push("/login?logout=true")
  }

  // Generate user initials from first_name and last_name
  const getUserInitials = (user: User | null) => {
    if (!user) return "U"
    
    const firstInitial = user.first_name?.[0]?.toUpperCase() || ""
    const lastInitial = user.last_name?.[0]?.toUpperCase() || ""
    
    return firstInitial + lastInitial || user.email?.[0]?.toUpperCase() || "U"
  }

  // Get display name
  const getDisplayName = (user: User | null) => {
    if (!user) return "User"
    
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim()
    return fullName || user.email || "User"
  }

  const userInitials = getUserInitials(user)
  const displayName = getDisplayName(user)

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
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10"
              >
                <Home className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Overview</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/analytics"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10"
              >
                <BarChart3 className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Analytics</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/devices"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10"
              >
                <MapPin className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Devices</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/alerts"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10"
              >
                <Bell className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Alerts</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/users"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10"
              >
                <Users className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Users</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center p-2 rounded-md hover:bg-primary-foreground/10"
              >
                <Settings className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-md hover:bg-gray-100 ${
              sidebarOpen && "hidden md:block"
            }`}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-gray-500 cursor-pointer hover:text-primary transition-colors" />
            <div className="flex items-center space-x-2">
              {/* User Avatar with initials */}
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                {loading ? "..." : userInitials}
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
                  className="flex items-center text-gray-600 hover:text-primary"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}