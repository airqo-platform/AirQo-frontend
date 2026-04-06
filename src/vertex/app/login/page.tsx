"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"
import Link from "next/link"
import Image from "next/image"
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
  const [downloadUrl, setDownloadUrl] = useState("https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.0/vertex-desktop-v0.1.0.exe");
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(() => {
    const raw = searchParams.get("callbackUrl");
    if (!raw) return "";
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.origin !== window.location.origin) return "";
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return "";
    }
  }, [searchParams]);

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

    // OS Detection for download link
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setDownloadUrl("https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.0/vertex-desktop-v0.1.0-arm64.dmg");
    }

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
    const fallbackUrl = lastModule === 'admin' ? '/admin/networks' : '/home';
    const redirectUrl = callbackUrl || fallbackUrl;

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
  }, [rememberedAccounts, callbackUrl]);

  return (
    <div className="flex min-h-screen lg:h-screen w-full bg-background relative">
      <div className="absolute left-6 top-6 sm:left-8 sm:top-8">
        <Image
          src="/images/airqo_logo.svg"
          alt="AirQo Logo"
          width={40}
          height={40}
        />
      </div>
      {/* Main Column: Branding and Form */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-[400px] my-auto">
          <div className="mb-10">
            <h1 className="mt-8 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Deploy and track air quality devices
            </h1>
            <p className="mt-4 text-center text-base text-muted-foreground leading-relaxed max-w-sm">
              Unified device management with AirQo Vertex.
            </p>
          </div>


          <div className="flex flex-col">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                        <Link href={forgotPasswordUrl} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
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
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  )}
                />
                <ReusableButton
                  type="submit"
                  className="w-full mt-2 font-medium bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                  loading={isLoading}
                  variant="filled"
                >
                  {isLoading ? "Signing in..." : "Login"}
                </ReusableButton>
              </form>
            </Form>
            <div className="text-sm text-center my-6 text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href={signUpUrl} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </div>

            <div className="pt-1 flex justify-center">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-70"
                >
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <line x1="8" x2="16" y1="21" y2="21" />
                  <line x1="12" x2="12" y1="17" y2="21" />
                </svg>
                Download desktop app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
