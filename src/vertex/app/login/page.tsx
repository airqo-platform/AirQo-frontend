"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"
import Link from "next/link"
import Image from "next/image"
import { useState, useCallback, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Form, FormField } from "@/components/ui/form"
import { signUpUrl, forgotPasswordUrl } from "@/core/urls"
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField"
import ReusableButton from "@/components/shared/button/ReusableButton"
import ReusableToast from "@/components/shared/toast/ReusableToast"
import logger from "@/lib/logger"
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";
import { useAppDispatch } from "@/core/redux/hooks";
import { setLoggingOut } from "@/core/redux/slices/userSlice";
import { getLastActiveModule } from "@/core/utils/userPreferences";
import {
  getRememberedAccounts,
  rememberAccount,
  removeRememberedAccount,
  type RememberedAccount,
} from "@/core/utils/rememberedAccounts";

const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [rememberedAccounts, setRememberedAccounts] = useState<RememberedAccount[]>([]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  })

  const dispatch = useAppDispatch();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    // Reset logout state when login page mounts - this ensures suppression flags persist until we land here
    dispatch(setLoggingOut(false));
    setRememberedAccounts(getRememberedAccounts());
    return () => {
      isMounted.current = false;
    };
  }, [dispatch]);

  const handleUseRememberedAccount = useCallback((email: string) => {
    form.setValue("userName", email, { shouldValidate: true });
    form.setValue("password", "");
    form.setFocus("password");
  }, [form]);

  const handleRemoveRememberedAccount = useCallback((id: string) => {
    const updated = removeRememberedAccount(id);
    setRememberedAccounts(updated);
  }, []);

  const onSubmit = useCallback(async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    // Read preference BEFORE authentication to avoid timing issues
    const lastModule = getLastActiveModule(values.userName);
    const redirectUrl = lastModule === 'admin' ? '/admin/networks' : '/home';

    try {
      const result = await signIn("credentials", {
        redirect: false,
        userName: values.userName,
        password: values.password,
      });

      if (!isMounted.current) return;

      if (result?.ok) {
        const existing = rememberedAccounts.find((item) => item.email.toLowerCase() === values.userName.toLowerCase());
        rememberAccount({
          email: values.userName,
          displayName: existing?.displayName || values.userName,
          profilePicture: existing?.profilePicture || "",
        });
        setRememberedAccounts(getRememberedAccounts());
        ReusableToast({ message: "Welcome back!", type: "SUCCESS" });
        window.location.href = redirectUrl;
      } else {
        let message = "Login failed. Please check your credentials.";
        if (result?.error) {
          if (result.error === 'CredentialsSignin') {
            message = "Invalid email or password. Please check your credentials.";
          } else if (result.error.toLowerCase().includes('fetch')) {
            message = "Network error. Please check your connection and try again.";
          } else {
            message = result.error;
          }
        }
        throw new Error(message);
      }
    } catch (error) {
      if (!isMounted.current) return;
      const message = getApiErrorMessage(error);
      logger.error("Sign-in failed", { error: message });
      ReusableToast({ message, type: "ERROR" });
      setIsLoading(false);
    }
  }, [rememberedAccounts]);

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
          {rememberedAccounts.length > 0 && (
            <div className="mb-5 rounded-lg border border-border bg-card p-3">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Recently used accounts</p>
              <div className="space-y-2">
                {rememberedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleUseRememberedAccount(account.email)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                        {(account.displayName || account.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {account.displayName || account.email}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRememberedAccount(account.id)}
                      className="text-xs text-muted-foreground hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  form.setValue("userName", "");
                  form.setValue("password", "");
                  form.setFocus("userName");
                }}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Use a different account
              </button>
            </div>
          )}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                )}
              />
              <ReusableButton type="submit" className="max-w-xs w-full mx-auto" disabled={isLoading} loading={isLoading} variant="filled">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span>Signing in...</span>
                  </span>
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
