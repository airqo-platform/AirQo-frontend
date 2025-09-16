"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { Form, FormField } from "@/components/ui/form"
import { signUpUrl, forgotPasswordUrl } from "@/core/urls"
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField"
import ReusableButton from "@/components/shared/button/ReusableButton"
import ReusableToast from "@/components/shared/toast/ReusableToast"
import { useAuth } from "@/core/hooks/users"
import logger from "@/lib/logger"
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { initializeUserSession } = useAuth()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    const result = await signIn("credentials", {
      redirect: false,
      userName: values.userName,
      password: values.password,
    })
    setIsLoading(false)
    
    if (result?.ok) {
      try {
        const session = await getSession();
        if (session?.user?.id) {
          await initializeUserSession(session.user.id);
          router.push("/home");
        } else {
          logger.error("Sign-in succeeded but session is missing user data.", { session });
          ReusableToast({ message: "Session could not be established. Please try again.", type: "ERROR" });
        }
      } catch (error) {
        logger.error("Error during post-login session initialization", { error });
        ReusableToast({ message: getApiErrorMessage(error), type: "ERROR" });
      }
    } else {
      // Handle failed login
      const defaultMessage = "Login failed. Please check your credentials.";
      const message = result?.error && result.error !== 'CredentialsSignin' ? result.error : defaultMessage;
      ReusableToast({ message, type: "ERROR" })
      logger.error("Sign-in failed", { error: result?.error })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="mb-4">
            <Image
              src="/images/airqo_logo.svg"
              alt="Logo"
              width={50}
              height={50}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back to Vertex</h1>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href={signUpUrl} className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
        <div className="flex flex-col">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Email"
                    placeholder="login@airqo.net"
                    type="email"
                    required
                    error={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                      <Link href={forgotPasswordUrl} className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <ReusableInputField
                      type={"password"}
                      id="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                      error={fieldState.error?.message}
                      className="mt-2"
                      {...field}
                    />
                  </div>
                )}
              />
              <ReusableButton type="submit" className="max-w-xs w-full mx-auto" disabled={isLoading} loading={isLoading} variant="filled">
                {isLoading ? (
                  "Logging in..."
                ) : (
                  "Login"
                )}
              </ReusableButton>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
