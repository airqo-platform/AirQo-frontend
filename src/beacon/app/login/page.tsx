"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import authService from "@/services/api-service"
import dynamic from "next/dynamic"

// Dynamically import the 3D component to avoid SSR issues with better error handling
const DeviceModel3D = dynamic(
  () => import("@/components/device-model-3d").catch((error) => {
    console.error('Failed to load DeviceModel3D:', error)
    // Return a fallback component
    return {
      default: () => (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-red-300 via-red-400 to-red-500">
          <AlertCircle className="h-16 w-16 text-white mb-4" />
          <div className="text-white text-xl font-semibold">3D model failed to load</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white text-red-500 rounded hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      )
    }
  }),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
        <Loader2 className="h-16 w-16 text-white animate-spin mb-4" />
        <div className="text-white text-xl font-semibold">Loading 3D Experience...</div>
        <div className="text-blue-100 text-sm mt-2">Preparing your login page</div>
      </div>
    ),
  }
)

/**
 * Login Page Component
 * Handles user authentication for the AirQo platform
 */

export default function LoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [pageReady, setPageReady] = useState<boolean>(false)
  
  /**
   * Check if on mobile and set page ready immediately (no 3D model on mobile)
   */
  useEffect(() => {
    // Check if screen is smaller than lg breakpoint (1024px)
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setPageReady(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    // Check if we're coming from a logout action
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')
    
    if (action === 'logout') {
      // Clear auth data without redirecting (we're already on login page)
      authService.clearAllAuthData()
      // Clean up the URL
      router.replace('/login')
    } else {
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        router.push("/dashboard/devices")
      }

    }
  }, [router])
  
  /**
   * Validates email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Handles form submission and authentication
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError("")
    
    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      return
    }
    
    setIsLoading(true)

    
    try {
      // Clear any existing auth data (without redirect)
      authService.clearAllAuthData()
      
      const response = await authService.login({
        userName: email,
        password: password
      })
      
      // Check for HTML response (indicates API route issue)
      if (typeof response === 'string' && response.includes('<!DOCTYPE')) {
        setError("Service temporarily unavailable. Please try again later.")
        return
      }
      
      // Handle successful authentication
      if (response?.token || response?.success) {
        // Set authentication cookie for middleware
        if (response.token) {
          // Set cookie with appropriate expiry based on remember me
          const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
          document.cookie = `token=${response.token}; path=/; max-age=${maxAge}; SameSite=Strict`
          
          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true')
          } else {
            sessionStorage.setItem('rememberMe', 'false')
          }
        }
        
        // Clear form
        setEmail("")
        setPassword("")
        
        // Redirect to dashboard
        router.push("/dashboard/devices")
        
        // Force refresh to ensure clean state
        router.refresh()
        
      } else if (response?.success === false) {
        setError(response.message || "Invalid credentials")
      } else {
        setError("Unexpected response. Please try again.")
      }
      
    } catch (err: any) {
      // Handle specific error cases
      if (err.status === 401) {
        setError("Invalid email or password")
      } else if (err.status === 500) {
        setError("Server error. Please try again later.")
      } else {
        setError(err.message || "Authentication failed. Please check your credentials.")
      }

    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Clear error when user starts typing
   */
  useEffect(() => {
    if (error && (email || password)) {
      setError("")
    }
  }, [email, password])

  return (
    <div className="relative">
      {/* Full Page Loader - Shows until 3D model is ready */}
      {!pageReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
          <Loader2 className="h-20 w-20 text-white animate-spin mb-6" />
          <div className="text-white text-2xl font-bold mb-2">AirQo Beacon</div>
          <div className="text-blue-100 text-lg">Loading devices...</div>
        </div>
      )}

      {/* Main Content - Hidden until ready */}
      <div className={`min-h-screen flex transition-opacity duration-500 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left side - 3D Model */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
          <DeviceModel3D onModelLoaded={() => setPageReady(true)} />
          
          {/* Overlay text */}
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <h1 className="text-5xl font-bold mb-4">AirQo Beacon</h1>
            <p className="text-xl opacity-90">
              Device Performance Monitoring & Management
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header - Mobile only */}
          <div className="text-center lg:hidden">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">AirQo Beacon</h1>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Header - Desktop */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

        {/* Login Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            {/* <CardDescription>
              Enter your credentials to access your account
            </CardDescription> */}
          </CardHeader>
          
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password  I will implement this later */}
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    href="/forgot-password" 
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div> */}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

          {/* Footer */}
          {/* <p className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p> */}
        </div>
        </div>
      </div>
    </div>
  )
}
