"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/core/redux/hooks";
import SessionLoadingState from "@/components/layout/loading/session-loading";

export default function Page() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/home"); // or whatever your main authenticated route is
    }
  }, [isAuthenticated, router]);

  // Show loading state while redirecting
  return <SessionLoadingState />;
}
