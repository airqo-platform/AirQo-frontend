"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import authService from "@/services/api-service"
import { signIn, useSession } from "next-auth/react"
import SocialAuthSection from "@/components/auth/social-auth-section"
import SelectedEmailCard from "@/components/auth/selected-email-card"
import AuthLayout from "@/components/auth/auth-layout"

/**
 * Login Page Component
 * Handles user authentication for the AirQo Beacon platform matching Nexus design
 */
export default function LoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [step, setStep] = useState<1 | 2>(1)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  
  const { data: session, status } = useSession()

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')
    
    if (action === 'logout') {
      authService.clearAllAuthData()
      router.replace('/login')
    } else if (status === 'authenticated') {
      if (!session?.user) {
        authService.clearAllAuthData()
        void import("next-auth/react").then(({ signOut }) => signOut({ redirect: false }))
      } else {
        const isAirqoAdmin = (typeof window !== 'undefined' && window.localStorage.getItem('isAirqoAdmin') === 'true') ||
                             (session?.user?.organization === 'AirQo' && 
                              (session?.user?.privilege?.toLowerCase()?.includes('admin') || 
                               session?.user?.privilege?.toLowerCase() === 'super' || 
                               session?.user?.privilege?.toLowerCase() === 'net admin'));
        
        if (isAirqoAdmin) {
          router.push("/dashboard")
        } else {
          router.push("/dashboard/devices")
        }
      }
    }
  }, [router, status, session])
  
  /**
   * Validates email format
   */
  const isValidEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailStr)
  }
  
  /**
   * Handles form submission and authentication
   */
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError("")
    
    if (step === 1) {
      if (!email.trim()) {
        setError("Please enter your email address")
        return
      }
      
      if (!isValidEmail(email.trim())) {
        setError("Please enter a valid email address")
        return
      }
      
      setStep(2)
      
      setTimeout(() => {
        passwordInputRef.current?.focus()
      }, 50)
      
      return
    }
    
    // Step 2 processing
    if (!password) {
      setError("Please enter your password")
      return
    }
    
    setIsLoading(true)
    
    try {
      authService.clearAllAuthData()
      
      const response = await signIn('credentials', {
        redirect: false,
        userName: email.trim(),
        password: password,
      })
      
      if (response?.error) {
        let errorMessage = "Invalid email or password"
        if (response.error === "CredentialsSignin") {
          errorMessage = "Incorrect username or password. Please check your credentials and try again."
        } else if (response.error.includes("incorrect username or password")) {
          errorMessage = "Incorrect username or password"
        } else if (response.error !== "CredentialsSignin") {
          errorMessage = response.error
        }
        setError(errorMessage)
        return
      }
      
      if (response?.ok) {
        let redirectTarget = "/dashboard/devices"
        try {
          const { getSession } = await import("next-auth/react")
          const userSession = await getSession()
          
          const isAirqoAdmin = (typeof window !== 'undefined' && window.localStorage.getItem('isAirqoAdmin') === 'true') ||
                               (userSession?.user?.organization === 'AirQo' && 
                                (userSession?.user?.privilege?.toLowerCase()?.includes('admin') || 
                                 userSession?.user?.privilege?.toLowerCase() === 'super' || 
                                 userSession?.user?.privilege?.toLowerCase() === 'net admin'))
                                
          if (isAirqoAdmin) {
            redirectTarget = "/dashboard"
          }
        } catch (err) {
          console.error("Error checking user session on login:", err)
        }
        
        window.location.href = redirectTarget
        return
      } else {
        setError("Unexpected response. Please try again.")
      }
    } catch (err: any) {
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

  const handleGoBack = () => {
    setPassword("")
    setError("")
    setStep(1)
  }

  return (
    <AuthLayout
      heading="Manage, diagnose, and maintain air quality devices across Africa"
      subtitle="AirQo Beacon provides calibration, firmware management, automated triage, and live telemetry to keep air monitors healthy."
    >
      {step === 1 ? (
        <form onSubmit={handleFormSubmit} className="w-full space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError("")
              }}
              className="h-11 rounded-md px-3.5 text-sm bg-white dark:bg-[#151718] border-slate-300 dark:border-slate-700 focus-visible:ring-primary focus-visible:border-primary"
              placeholder="user@example.com"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md text-sm shadow-xs transition-colors cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </span>
            ) : (
              "Continue"
            )}
          </Button>

          <SocialAuthSection mode="login" disabled={isLoading} onError={(msg) => setError(msg)} />

          <div className="w-full pt-1 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <a
                href="https://analytics.airqo.net/user/creation/individual/register"
                className="text-primary hover:underline font-semibold"
              >
                Register
              </a>
            </p>
          </div>
        </form>
      ) : (
        <div className="w-full space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <SelectedEmailCard
            email={email}
            onChangeEmail={handleGoBack}
          />

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                Password
              </label>
              <div className="relative">
                <Input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError("")
                  }}
                  className="h-11 rounded-md px-3.5 pr-10 text-sm bg-white dark:bg-[#151718] border-slate-300 dark:border-slate-700 focus-visible:ring-primary focus-visible:border-primary"
                  placeholder="password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a
                href="https://analytics.airqo.net/user/forgotPwd"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md text-sm shadow-xs transition-colors cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="w-full pt-1 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <a
                href="https://analytics.airqo.net/user/creation/individual/register"
                className="text-primary hover:underline font-semibold"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
