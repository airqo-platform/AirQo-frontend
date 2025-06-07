// app/login/page.js (or wherever your login page is located)
"use client"

import { useState, useEffect, FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { config } from "@/lib/config"



export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [logoutMessage, setLogoutMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user was redirected from logout
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
      // Create form data for FastAPI OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email); // FastAPI expects 'username' for email
      formData.append('password', password);

      // Make API call to your FastAPI authentication endpoint
      const response = await fetch(`http://srv828289.hstgr.cloud:8000/login`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save to localStorage (optional for frontend use)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      
        // Save token to cookie for middleware
        document.cookie = `token=${data.access_token}; path=/;`;
      
        // Redirect to dashboard
        router.push("/dashboard");
      }
       else {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          setError(errorData.detail || "Invalid email or password. Please try again.");
        } catch (e) {
          setError("Invalid email or password. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8ystA7fUvSxUyn8lJlJplrEDq9D64a.png"
            alt="AirQo Logo"
            width={120}
            height={40}
            className="mb-4"
          />
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
            <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
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
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}