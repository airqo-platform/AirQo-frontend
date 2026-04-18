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
import {
  setLoggingOut,
} from "@/core/redux/slices/userSlice";
import { getLastActiveModule } from "@/core/utils/userPreferences";
import { VERTEX_DESKTOP_DOWNLOADS } from "@/core/constants/app-downloads";

const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(VERTEX_DESKTOP_DOWNLOADS.windows);
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

  const [platform, setPlatform] = useState<'win' | 'linux' | 'other' | null>(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    // Reset logout state when login page mounts
    dispatch(setLoggingOut(false));

    // OS Detection for download link and platform check
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isWin = userAgent.includes('win');
    const isLinux = userAgent.includes('linux');
    setIsElectron(userAgent.includes('electron'));
    
    if (isWin) {
      setPlatform('win');
      setDownloadUrl(VERTEX_DESKTOP_DOWNLOADS.windows);
    } else if (isLinux) {
      setPlatform('linux');
    } else {
      setPlatform('other');
    }

    return () => {
      isMounted.current = false;
    };
  }, [dispatch]);


  const onSubmit = useCallback(async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    // Read preference BEFORE authentication to avoid timing issues
    const lastModule = getLastActiveModule(values.userName);
    const fallbackUrl = lastModule === 'admin' ? '/admin/networks' : '/home';
    const redirectUrl = callbackUrl || fallbackUrl;

    try {
      console.log("Attempting sign-in with:", { userName: values.userName, callbackUrl, redirectUrl });
      const result = await signIn("credentials", {
        redirect: false,
        userName: values.userName,
        password: values.password,
      });

      console.log("Sign-in result:", result);

      if (!isMounted.current) return;

      if (result?.ok) {
        ReusableToast({ message: "Welcome back!", type: "SUCCESS" });
        window.location.href = redirectUrl;
      } else {
        console.error("Sign-in failed with result:", result);
        
        // This will pause execution in dev tools if they are open
        // giving you time to check the Network tab.
        // debugger; 

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
  }, [callbackUrl]);

  return (
    <div className="flex min-h-screen lg:h-screen w-full flex-col bg-background text-foreground">
      {/* Sticky Topbar */}
      <header data-vertex-topbar className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-12 items-center justify-between px-6 md:px-8">
          <div className="flex items-center">
            <Image
              src="/images/airqo_logo.svg"
              alt="AirQo Logo"
              width={28}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </div>
          
          {!isElectron && platform === 'win' && (
            <div className="flex items-center">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/80 hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z"/>
                </svg>
                Download for Windows
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-y-auto">
        <div className="flex flex-1 flex-col px-4 py-12 sm:px-6">
          <div className="mx-auto w-full max-w-[450px] my-auto">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                <span className="block">Deploy devices,</span>
                <span className="block">Share your data</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Add your devices, manage their details, and stream live air quality data through AirQo&apos;s open data channels.
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
