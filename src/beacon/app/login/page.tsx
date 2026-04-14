"use client"

import { useState, useEffect, FormEvent, Component, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import authService from "@/services/api-service"
import dynamic from "next/dynamic"

// Fallback component when 3D model fails to load - signals to hide the model section
function DeviceModel3DFallback({ onModelLoaded, onModelFailed }: Readonly<{ onModelLoaded?: () => void; onModelFailed?: () => void }>) {
  useEffect(() => {
    // Signal that model failed so we hide the section
    onModelFailed?.()
    onModelLoaded?.()
  }, [onModelLoaded, onModelFailed])

  return null
}

// Error boundary to catch runtime errors in the 3D component
class Model3DErrorBoundary extends Component<
  { children: ReactNode; onError: () => void; onModelFailed: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void; onModelFailed: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Model Error:', error, errorInfo)
    this.props.onError()
    this.props.onModelFailed()
  }

  render() {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}

// Dynamically import the 3D component wrapper to avoid SSR issues
const DeviceModel3D = dynamic(
  () => import("@/components/device-model-3d-wrapper").catch((error) => {
    console.error('Failed to load DeviceModel3D:', error)
    // Return a fallback component that signals readiness
    return {
      default: DeviceModel3DFallback
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
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [pageReady, setPageReady] = useState<boolean>(false)
  const [modelFailed, setModelFailed] = useState<boolean>(false)
  
  /**
   * Check if on mobile and set page ready immediately (no 3D model on mobile)
   * Also add a fallback timeout to ensure page becomes visible
   */
  useEffect(() => {
    // Check if screen is smaller than lg breakpoint (1024px)
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setPageReady(true)
        setModelFailed(true) // No 3D on mobile
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Fallback: ensure page is visible after 3 seconds even if 3D fails
    const fallbackTimer = setTimeout(() => {
      setPageReady(true)
    }, 3000)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(fallbackTimer)
    }
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
          const maxAge = 24 * 60 * 60 // 1 day
          document.cookie = `token=${response.token}; path=/; max-age=${maxAge}; SameSite=Strict`
        }
        
        // Clear form
        setEmail("")
        setPassword("")
        
        // Show transition screen
        setIsLoading(false)
        setIsTransitioning(true)
        
        // Small delay to show transition, then redirect
        setTimeout(() => {
          router.push("/dashboard/devices")
          router.refresh()
        }, 1500)
        
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

      {/* Login Progress Overlay - Shows during authentication */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm mx-4">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-gray-900 text-xl font-semibold mb-2">Signing you in...</div>
            <div className="text-gray-500 text-sm text-center">Please wait while we verify your credentials</div>
          </div>
        </div>
      )}

      {/* Transition Screen - Shows after successful login */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          {/* Blurred 3D Background */}
          <div className="absolute inset-0 blur-sm">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
              {!modelFailed && (
                <div className="w-full h-full opacity-80">
                  <DeviceModel3D 
                    onModelLoaded={() => {}} 
                    onModelFailed={() => {}} 
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Success checkmark animation */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Welcome text */}
            <div className="text-white text-3xl font-bold mb-3 animate-in slide-in-from-bottom duration-500 drop-shadow-lg">
              Welcome Back!
            </div>
            <div className="text-white/90 text-lg mb-8 animate-in slide-in-from-bottom duration-500 delay-100 drop-shadow-md">
              Preparing your dashboard...
            </div>
            
            {/* Loading dots */}
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Hidden until ready */}
      <div className={`min-h-screen flex transition-opacity duration-500 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left side - 3D Model (hidden if model failed to load) */}
        {!modelFailed && (
          <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
            <Model3DErrorBoundary 
              onError={() => setPageReady(true)} 
              onModelFailed={() => setModelFailed(true)}
            >
              <DeviceModel3D 
                onModelLoaded={() => setPageReady(true)} 
                onModelFailed={() => setModelFailed(true)} 
              />
            </Model3DErrorBoundary>
            {/* Overlay text */}
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <h1 className="text-5xl font-bold mb-4">AirQo Beacon</h1>
              <p className="text-xl opacity-90">
                Device Performance Monitoring & Management
              </p>
            </div>
          </div>
        )}

        {/* Right side - Login Form (full width if model failed) */}
        <div className={`w-full flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 ${!modelFailed ? 'lg:w-1/2 xl:w-2/5' : ''}`}>
        <div className="max-w-md w-full space-y-8">
          {/* Header - Mobile only or when model failed */}
          <div className={`text-center ${!modelFailed ? 'lg:hidden' : ''}`}>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">AirQo Beacon</h1>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Header - Desktop (only shown when model is visible) */}
          {!modelFailed && (
            <div className="hidden lg:block text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>
          )}

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
