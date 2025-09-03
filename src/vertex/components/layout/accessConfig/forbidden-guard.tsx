"use client";

import React from "react";
import { useAppSelector } from "@/core/redux/hooks";
import { ForbiddenPage } from "@/components/ui/forbidden-page";

interface ForbiddenGuardProps {
  children: React.ReactNode;
}

export const ForbiddenGuard: React.FC<ForbiddenGuardProps> = ({ children }) => {
  const forbiddenState = useAppSelector((state) => state.user.forbidden);

  // If user is in forbidden state, show forbidden page
  if (forbiddenState.isForbidden) {
    return <ForbiddenPage message={forbiddenState.message} />;
  }

  // Otherwise, render children normally
  return <>{children}</>;
}; 