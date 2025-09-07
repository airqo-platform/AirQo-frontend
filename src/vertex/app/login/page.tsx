"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Form, FormField } from "@/components/ui/form"
import { useAuth } from "@/core/hooks/users"
import { signUpUrl, forgotPasswordUrl } from "@/core/urls"
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField"
import ReusableButton from "@/components/shared/button/ReusableButton"

const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    login(values, {
      onSuccess: () => {
        router.push("/")
      },
    })
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
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                      <Link href={forgotPasswordUrl} className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <ReusableInputField
                      type={"password"}
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
