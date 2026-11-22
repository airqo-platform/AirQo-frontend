"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthLayout from "@/components/auth/auth-layout"
import authService from "@/services/api-service"
import { getSafeReturnPath, ROUTES } from "@/lib/navigation"
import { beaconConfig } from "@/beacon.config"

const isSignOut = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("action") === "logout"

/**
 * Sign-in for `auth.provider: "none"`: there is nothing to enter, so the page signs straight in
 * as the demo user and carries on to the page the middleware was taking them to.
 */
export default function LoginPage() {
  const router = useRouter()
  const { status } = useSession()
  const [error, setError] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  const attempted = useRef(false)

  const continueToDemo = useCallback(async () => {
    setError("")
    setIsSigningIn(true)
    const from = getSafeReturnPath(new URLSearchParams(window.location.search).get("from"))

    try {
      authService.clearAllAuthData()
      const response = await signIn("demo", { redirect: false })
      if (response?.error) throw new Error(response.error)
      // The middleware sends system admins on to the fleet overview
      router.replace(from ?? ROUTES.HOME)
    } catch (err: any) {
      setError(err?.message || "Couldn't open the demo. Try again.")
      setIsSigningIn(false)
    }
  }, [router])

  useEffect(() => {
    // Signing out lands here; stay put so the user isn't signed straight back in
    if (isSignOut()) {
      setSignedOut(true)
      authService.clearAllAuthData()
      return
    }

    if (status === "authenticated") {
      router.replace(getSafeReturnPath(new URLSearchParams(window.location.search).get("from")) ?? ROUTES.HOME)
      return
    }

    if (status === "unauthenticated" && !attempted.current) {
      attempted.current = true
      void continueToDemo()
    }
  }, [status, router, continueToDemo])

  return (
    <AuthLayout
      heading={`Welcome to ${beaconConfig.app.name}`}
      subtitle={beaconConfig.app.description}
      microLine="This demo runs on sample data. No account is needed."
    >
      <div className="w-full space-y-4">
        {error && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="button"
          onClick={() => void continueToDemo()}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md text-sm"
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening the demo...
            </span>
          ) : signedOut ? (
            "Open the demo again"
          ) : (
            "Open the demo"
          )}
        </Button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Questions?{" "}
          <a className="font-medium text-primary hover:underline" href={`mailto:${beaconConfig.org.supportEmail}`}>
            {beaconConfig.org.supportEmail}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
