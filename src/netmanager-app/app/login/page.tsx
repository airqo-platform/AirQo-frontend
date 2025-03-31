"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useAuth } from "@/core/hooks/users"
import { Loader2, Lock, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()

  // Get URLs from environment variables
  const forgotPasswordUrl = process.env.NEXT_PUBLIC_FORGOT_PASSWORD_URL || "/forgot-password"
  const signUpUrl = process.env.NEXT_PUBLIC_SIGNUP_URL || "/signup"

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null)
    try {
      await login(values, {
        onSuccess: () => {
          router.push("/")
        },
        onError: (error: any) => {
          setError(error?.message || "Invalid email or password. Please try again.")
        },
      })
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-2">
            <Image
              src="/placeholder.svg?height=80&width=80"
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="border-muted/40 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="name@example.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link href={forgotPasswordUrl} className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in-50">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
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
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="flex items-center">
              <Separator className="flex-1" />
              <span className="mx-2 text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href={signUpUrl} className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-primary">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

