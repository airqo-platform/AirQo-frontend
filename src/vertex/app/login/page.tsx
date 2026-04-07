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

const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
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

  const [platform, setPlatform] = useState<'mac' | 'win' | 'linux' | 'other' | null>(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    // Reset logout state when login page mounts
    dispatch(setLoggingOut(false));

    // OS Detection for download link and platform check
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMac = userAgent.includes('mac');
    const isWin = userAgent.includes('win');
    const isLinux = userAgent.includes('linux');
    setIsElectron(userAgent.includes('electron'));
    
    if (isMac) {
      setPlatform('mac');
      setDownloadUrl("https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.0/vertex-desktop-v0.1.0-arm64.dmg");
    } else if (isWin) {
      setPlatform('win');
      setDownloadUrl("https://github.com/airqo-platform/AirQo-frontend/releases/download/v0.1.0/vertex-desktop-v0.1.0.exe");
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
      const result = await signIn("credentials", {
        redirect: false,
        userName: values.userName,
        password: values.password,
      });

      if (!isMounted.current) return;

      if (result?.ok) {
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
  }, [callbackUrl]);

  return (
    <div className="flex min-h-screen lg:h-screen w-full flex-col bg-background text-foreground">
      {/* Sticky Topbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          
          {!isElectron && (platform === 'mac' || platform === 'win') && (
            <div className="flex items-center">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/80 hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {platform === 'mac' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .76-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.36 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z"/>
                  </svg>
                )}
                Download for {platform === 'mac' ? 'macOS' : 'Windows'}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-y-auto">
        <div className="flex flex-1 flex-col px-4 py-12 sm:px-6">
          <div className="mx-auto w-full max-w-[400px] my-auto">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Deploy and track air quality devices
              </h1>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
