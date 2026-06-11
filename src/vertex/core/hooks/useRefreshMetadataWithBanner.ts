import { useCallback } from "react";
import { useRefreshSiteMetadata } from "@/core/hooks/useSites";
import { useBanner } from "@/context/banner-context";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";
import type { SiteRefreshResponse } from "@/core/apis/sites";
import type { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  };
}

export const useRefreshMetadataWithBanner = () => {
  const { showBanner } = useBanner();

  const handleSuccess = useCallback((data: SiteRefreshResponse) => {
    const msg = (data.message ?? "").toLowerCase();
    if (msg.includes("partially refreshed")) {
      showBanner({ severity: "warning", message: data.message ?? "Site metadata partially refreshed.", scoped: false });
    } else if (msg.includes("already complete")) {
      showBanner({ severity: "info", message: "Site metadata is already up to date.", scoped: false });
    } else {
      showBanner({ severity: "success", message: "Site metadata refreshed successfully.", scoped: false });
    }
  }, [showBanner]);

  const handleError = useCallback((error: AxiosError<ErrorResponse>) => {
    showBanner({ severity: "error", message: `Refresh Failed: ${getApiErrorMessage(error)}`, scoped: false });
  }, [showBanner]);

  return useRefreshSiteMetadata({ onSuccess: handleSuccess, onError: handleError });
};
