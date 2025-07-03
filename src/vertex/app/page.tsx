"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/core/redux/hooks";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/dashboard"); // or whatever your main authenticated route is
    }
  }, [isAuthenticated, router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}
