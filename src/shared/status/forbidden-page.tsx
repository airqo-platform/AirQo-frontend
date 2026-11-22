"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OopsIcon from "../page/oops-icon";
import { Button } from "../ui/button";

/*
 * Full-page 403: big "Oops!" headline, "Go back", "Error code: 403 forbidden access".
 * Copied from vertex/components/ui/forbidden-error.tsx (ForbiddenError) and
 * forbidden-page.tsx (ForbiddenPage, the full-screen wrapper). The same layout is
 * Vertex's app/global-error.tsx.
 *
 * The other apps: Nexus shows a smaller in-page red banner instead (./access-denied).
 * Beacon has no generic one; its AirQo-only diagnostics pages show their own
 * "Restricted Organization Section" card (diagnostics/AirqoFleetGate.tsx).
 *
 * Changes from Vertex's files:
 * - "Go back" cleared Vertex's Redux forbidden state (clearForbiddenState) before
 *   router.back(). Clearing app state is now the caller's `onGoBack`; without it the
 *   button just goes back.
 * - Vertex's OopsIcon (public/icons/Errors) is swapped for the shared one from Nexus,
 *   and ReusableButton for the shared Button.
 * - `text-black-900` and `text-grey-400` are kept as they were, but neither exists in
 *   Vertex's Tailwind config, so the headline and code line take the inherited colour.
 */
export interface ForbiddenErrorProps {
    message?: string;
    onGoBack?: () => void;
    showBackButton?: boolean;
}

export const ForbiddenError: React.FC<ForbiddenErrorProps> = ({
    message = "You don't have access rights to this page.",
    onGoBack,
    showBackButton = true,
}) => {
    const router = useRouter();

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
            return;
        }

        // Default behavior
        router.back();
    };

    return (
        <div className="flex flex-col justify-center items-center w-full md:px-48 px-6">
            <OopsIcon className="text-primary" />

            <div className="flex flex-col justify-center items-center w-full mt-6">
                <h1 className="text-4xl md:text-[40px] font-normal w-full max-w-xl text-center text-black-900 md:leading-[56px]">
                    <span className="text-primary font-bold">Oops!</span> {message}
                </h1>
                <span className="text-primary/70 mt-2">
                    Reach out to your administrator if you think this is a mistake.
                </span>

                {showBackButton && (
                    <Button
                        onClick={handleGoBack}
                        className="mt-6 w-64"
                    >
                        Go back
                    </Button>
                )}

                <p className="text-center text-grey-400 py-6">
                    Error code: 403 forbidden access
                </p>
            </div>
        </div>
    );
};

interface ForbiddenPageProps {
  message?: string;
  onGoBack?: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({
  message,
  onGoBack,
}) => {
  return (
    <div className="relative w-screen h-screen dark:bg-transparent overflow-x-hidden flex items-center justify-center mt-14">
      <ForbiddenError message={message} onGoBack={onGoBack} />
    </div>
  );
};

export default ForbiddenPage;
