"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/core/redux/hooks";
import SessionLoadingState from "@/components/layout/loading/session-loading";
import logger from "@/lib/logger";

export default function Page() {
  const router = useRouter();
  // Using optional chaining to prevent a runtime error if `state.user` is undefined.
  const isAuthenticated = useAppSelector(
    (state) => state.user?.isAuthenticated
  );

  useEffect(() => {
    // For debugging, let's log the authentication status on each render.
    logger.debug("[Auth Redirect] isAuthenticated:", isAuthenticated);

    // Wait until the authentication status is determined (i.e., not undefined).
    // This prevents a premature redirect if the auth state is still loading.
    if (isAuthenticated === undefined) {
      logger.debug("[Auth Redirect] Authentication status is pending. Waiting...");
      return;
    }

    if (isAuthenticated) {
      logger.debug("[Auth Redirect] User is authenticated. Redirecting to /home.");
      router.push("/home"); // or whatever your main authenticated route is
    } else {
      logger.debug("[Auth Redirect] User is not authenticated. Redirecting to /login.");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Show loading state while redirecting
  return <SessionLoadingState />;
}
