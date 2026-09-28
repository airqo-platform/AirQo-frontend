'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AqDownload01 } from '@airqo/icons-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
} from '@/shared/components/ui';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { UserStatsExportSegment } from '@/shared/types/api';
import { downloadCsv } from '@/shared/utils/csv';
import {
  buildUserStatsExportCsv,
  buildUserStatsExportFilename,
  fetchAllUserStatsExport,
} from '@/shared/utils/userStatsExport';

interface ExportUsersButtonProps {
  segment: UserStatsExportSegment;
  segmentLabel: string;
}

/**
 * Aborted/cancelled exports (unmount, superseded click) must never surface as
 * a user-facing failure — AGENTS.md AbortError rule.
 */
const isCancelledExportError = (error: unknown): boolean => {
  if (axios.isCancel(error)) {
    return true;
  }
  const name = (error as { name?: unknown } | null)?.name;
  return name === 'CanceledError' || name === 'AbortError';
};

/**
 * Per-card CSV export for the user-statistics page. Each click is a fresh
 * one-off request (no SWR/caching); pagination is driven by the backend's
 * `has_more` flag until the whole segment has been fetched.
 */
const ExportUsersButton: React.FC<ExportUsersButtonProps> = ({
  segment,
  segmentLabel,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const handleExport = useCallback(
    async (excludeUnsubscribed: boolean) => {
      if (isExporting) {
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setIsExporting(true);

      try {
        const { users, total, unsubscribedTotal } =
          await fetchAllUserStatsExport(segment, {
            excludeUnsubscribed,
            signal: controller.signal,
          });

        if (total === 0 || users.length === 0) {
          toast.info(
            'No users to export',
            excludeUnsubscribed && unsubscribedTotal > 0
              ? 'All users in this segment have unsubscribed from emails.'
              : undefined
          );
          return;
        }

        downloadCsv(
          buildUserStatsExportFilename(segment),
          buildUserStatsExportCsv(users)
        );
        toast.success(
          `Exported ${total.toLocaleString()} users`,
          excludeUnsubscribed && unsubscribedTotal > 0
            ? `${unsubscribedTotal.toLocaleString()} unsubscribed user(s) excluded`
            : undefined
        );
      } catch (err) {
        if (isCancelledExportError(err)) {
          return;
        }
        toast.error(
          'Export failed',
          getUserFriendlyErrorMessage(err) || 'Please try again.'
        );
      } finally {
        // Only reset state if this controller is still the current one —
        // a superseded (or unmount-aborted) export must not clobber it.
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsExporting(false);
        }
      }
    },
    [isExporting, segment]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outlined"
          size="sm"
          Icon={AqDownload01}
          loading={isExporting}
          aria-label={`Export ${segmentLabel}`}
        >
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport(false)}>
          Export all
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(true)}>
          Export email-ready
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 max-w-[16rem] text-xs text-muted-foreground">
          Newsletter/Mailchimp unsubscribes are not included in
          &quot;email-ready&quot; and must still be excluded separately.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportUsersButton;
