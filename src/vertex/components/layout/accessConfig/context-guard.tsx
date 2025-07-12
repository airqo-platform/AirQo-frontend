"use client";

import React from "react";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ContextGuardProps {
  allowedContexts: UserContext[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export const ContextGuard: React.FC<ContextGuardProps> = ({
  allowedContexts,
  children,
  fallback,
  showError = false,
}) => {
  const { userContext } = useUserContext();
  const hasValidContext = allowedContexts.includes(userContext);

  if (hasValidContext) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This feature is not available in {userContext} context.
          <br />
          <strong>Required:</strong> {allowedContexts.join(', ')}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

// Higher-order component for context-based rendering
export const withContext = (
  allowedContexts: UserContext[],
  fallback?: React.ComponentType<Record<string, unknown>>
) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
      const { userContext } = useUserContext();
      const hasValidContext = allowedContexts.includes(userContext);

      if (!hasValidContext) {
        return fallback ? React.createElement(fallback, { ...(props as Record<string, unknown>) }) : null;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withContext(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
}; 