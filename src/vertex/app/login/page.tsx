"use client"
import { CookieInfoBanner } from '@/components/features/auth/cookie-info-banner';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"
import Link from "next/link"
import Image from "next/image"
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
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
import { ROUTE_LINKS } from "@/core/routes";
// import GoogleAuthSection from "@/components/features/auth/google-auth-section";
import { motion, AnimatePresence } from "framer-motion";


const loginSchema = z.object({
  userName: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export default function LoginPage() {
 
  return (
    
      <CookieInfoBanner /> )
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'password'>('email');
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
  const waitForSession = useCallback(async () => {
    const attempts = 8;
    const delayMs = 150;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const session = await getSession();
      if (session?.user) {
        return session;
      }

      if (attempt < attempts - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, delayMs);
        });
      }
    }

    return null;
  }, []);

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
    // If we are on the email step, just validate the email and move forward
    if (step === 'email') {
      const isEmailValid = await form.trigger('userName');
      if (isEmailValid) {
        setStep('password');
      }
      return;
    }

    // On the password step, ensure password is also validated
    const isPasswordValid = await form.trigger('password');
    if (!isPasswordValid) return;

    setIsLoading(true);

    // Read preference BEFORE authentication to avoid timing issues
    const lastModule = getLastActiveModule(values.userName);
    const fallbackUrl = lastModule === 'admin' ? '/admin/networks' : '/home';
    const isAuthRouteCallback =
      callbackUrl.startsWith('/login') ||
      callbackUrl.startsWith('/auth-error') ||
      callbackUrl.startsWith('/forgot-password');
    const redirectUrl =
      callbackUrl && !isAuthRouteCallback ? callbackUrl : fallbackUrl;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        userName: values.userName,
        password: values.password,
        callbackUrl: redirectUrl,
      });

      if (!isMounted.current) return;

      if (result?.ok) {
        const session = await waitForSession();
        if (!session?.user) {
          throw new Error("Could not confirm session. Please try again.");
        }
        ReusableToast({ message: "Welcome back!", type: "SUCCESS" });
        window.location.replace(result.url || redirectUrl);
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
  }, [callbackUrl, waitForSession, step, form]);

  return (
    <div className="flex min-h-screen lg:h-screen w-full flex-col bg-primary-50 text-foreground">
      {/* Sticky Topbar */}
      <header data-vertex-topbar className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary-50 backdrop-blur supports-[backdrop-filter]:bg-primary-50/60">
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
              <Link
                href={ROUTE_LINKS.DOWNLOAD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/80 hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z"/>
                </svg>
                Download for Windows
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-y-auto">
        <div className="flex flex-1 flex-col px-4 sm:px-6">
          <div className="mx-auto w-full max-w-[450px] my-auto border border-primary/20 rounded-lg p-8 shadow-md bg-white">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-semibold leading-relaxed text-foreground sm:text-4xl">
                <span className="block">Deploy devices,</span>
                <span className="block">Share your data</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Add your devices and stream live air quality data through AirQo&apos;s open data channels.
              </p>
            </div>

            <div className="flex flex-col">
              {/* {step === 'email' && (
                <GoogleAuthSection
                  disabled={isLoading}
                  className="mb-6"
                  callbackUrl={callbackUrl}
                />
              )} */}

              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(form.getValues());
                  }}
                  className="space-y-5"
                >
                  <AnimatePresence mode="wait">
                    {step === 'email' ? (
                      <motion.div
                        key="email-step"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <FormField
                          control={form.control}
                          name="userName"
                          render={({ field, fieldState }) => (
                            <ReusableInputField
                              placeholder="Enter your email"
                              type="email"
                              required
                              error={fieldState.error?.message}
                              disabled={isLoading}
                              {...field}
                            />
                          )}
                        />
                        <ReusableButton
                          type="submit"
                          className="w-full font-medium bg-primary hover:bg-primary/90"
                          disabled={isLoading}
                          variant="filled"
                        >
                          Continue with email
                        </ReusableButton>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="password-step"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                       <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-muted-foreground">
                              Signing in as
                            </span>
                            <span className="text-sm font-semibold truncate">
                              {form.getValues('userName')}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                              form.resetField('password');
                              form.clearErrors('password');
                              setStep('email');
                            }}
                            className="text-xs font-medium text-primary border border-primary/40 rounded-md px-2.5 py-1 hover:bg-primary/10 active:bg-primary/20 transition-colors ml-3 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Change email
                          </button>
                        </div>

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
                          className="w-full font-medium bg-primary hover:bg-primary/90"
                          disabled={isLoading}
                          loading={isLoading}
                          variant="filled"
                        >
                          {isLoading ? "Signing in..." : "Login"}
                        </ReusableButton>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </Form>

              <div className="text-sm text-center text-muted-foreground mt-4">
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
