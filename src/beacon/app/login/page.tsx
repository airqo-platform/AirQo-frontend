"use client"

import { useState, useEffect, FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [logoutMessage, setLogoutMessage] = useState("")
  const router = useRouter()

  const AIRQO_API_BASE_URL = process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("logout") === "true") {
      setLogoutMessage("You have been successfully logged out")
    }
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${AIRQO_API_BASE_URL}/api/v2/users/loginUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: email,
          password: password
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Clean token (remove "JWT " prefix if present)
        const rawToken = data.token || data.access_token || ""
        const token = rawToken.startsWith("JWT ") ? rawToken.split(" ")[1] : rawToken

        // Store auth data
        localStorage.setItem("access_token", token)
        if (data.user) {
          localStorage.setItem("user_data", JSON.stringify(data.user))
        }

        // Store token in cookie
        document.cookie = `token=${token}; path=/;`

        // Navigate to dashboard
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        setError(errorData.message || errorData.detail || "Invalid email or password.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <AirqoLogo className="mb-4" alt="AirQo Logo" />
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {logoutMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{logoutMessage}</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </Link>
          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
