'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AqDownload01 } from '@airqo/icons-react';
import { Button, toast } from '@/shared/components/ui';
import { apiKeyUsageService } from '@/shared/services/apiKeyUsageService';
import { buildCsvFilename, downloadCsv } from '@/shared/utils/csv';
import { isAbortError } from '@/shared/lib/retryPolicy';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { ApiKeyUsageLeaderboardParams } from '@/shared/types/apiKeyUsage';

export interface ExportApiKeyUsageButtonProps {
  params: ApiKeyUsageLeaderboardParams;
  disabled?: boolean;
}

/**
 * CSV export for the API Key Usage leaderboard. One-off request (no SWR):
 * each click supersedes the previous one, the controller is aborted on
 * unmount, and cancelled exports never surface to the user (AGENTS.md
 * AbortError rule).
 */
const ExportApiKeyUsageButton: React.FC<ExportApiKeyUsageButtonProps> = ({
  params,
  disabled,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const handleExport = useCallback(async () => {
    // Supersede any in-flight export before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsExporting(true);

    try {
      const csv = await apiKeyUsageService.getLeaderboardCsv(
        params,
        controller.signal
      );

      // A superseded export must not fire a second download/toast.
      if (abortRef.current !== controller) return;

      downloadCsv(buildCsvFilename('api-key-usage'), csv);
      toast.success('Export started');
    } catch (err) {
      // Cancelled/superseded requests are not failures.
      if (isAbortError(err)) return;
      if (abortRef.current !== controller) return;
      toast.error(getUserFriendlyErrorMessage(err));
    } finally {
      // Only reset when this controller is still the current one, so a
      // superseded export can't clobber the newer one's loading state.
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsExporting(false);
      }
    }
  }, [params]);

  return (
    <Button
      variant="outlined"
      Icon={AqDownload01}
      loading={isExporting}
      disabled={disabled}
      onClick={handleExport}
    >
      Export CSV
    </Button>
  );
};

export default ExportApiKeyUsageButton;
