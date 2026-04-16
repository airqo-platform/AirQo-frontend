'use client';

import React from 'react';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { AqCopy06 } from '@airqo/icons-react';
import { formatDate, parseDate } from '@/shared/utils';

interface TokenDisplayProps {
  token: string;
  expiresAt?: string | null;
  tokenStatus?: 'active' | 'expired';
  showStatusBadge?: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({
  token,
  expiresAt,
  tokenStatus,
  showStatusBadge = true,
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard');
    } catch {
      toast.error('Failed to copy token');
    }
  };
  const maskedToken = token
    ? token.length > 4
      ? `••••••••${token.slice(-4)}`
      : '••••••••'
    : '—';

  const now = Date.now();
  // Parse and validate expiry date safely; treat epoch 0 as valid
  const expiryDate = expiresAt != null ? parseDate(expiresAt) : null;
  const isExpiryValid = expiryDate !== null;
  const expiresAtTime = isExpiryValid ? expiryDate!.getTime() : null;

  // Prefer server-provided `tokenStatus` when available; otherwise infer from expiry date
  let expired = false;
  let expiringSoon = false;

  if (typeof tokenStatus === 'string') {
    // Respect server-provided status but always fallback to expiry date when present
    expired =
      tokenStatus === 'expired' ||
      (expiresAtTime !== null ? expiresAtTime <= now : false);
    expiringSoon =
      expiresAtTime !== null &&
      expiresAtTime > now &&
      expiresAtTime - now <= 7 * 24 * 60 * 60 * 1000;
  } else {
    expired = expiresAtTime !== null ? expiresAtTime <= now : false;
    expiringSoon =
      expiresAtTime !== null &&
      expiresAtTime > now &&
      expiresAtTime - now <= 7 * 24 * 60 * 60 * 1000;
  }

  const containerCodeClass = expired
    ? 'font-mono text-sm truncate min-w-0 bg-red-50 text-red-800 px-2 py-1 rounded border border-red-200'
    : expiringSoon
      ? 'font-mono text-sm truncate min-w-0 bg-yellow-50 text-yellow-800 px-2 py-1 rounded border border-yellow-200'
      : 'font-mono text-sm truncate min-w-0 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border';

  return (
    <div className="max-w-full min-w-0">
      <div className="flex flex-col items-start gap-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0 w-full">
          <code className={`${containerCodeClass} truncate`}>
            {maskedToken}
          </code>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              className="p-1 h-6 w-6 flex-shrink-0"
              aria-label="Copy token"
            >
              <AqCopy06 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {showStatusBadge &&
            (expired ? (
              <span className="inline-flex items-center whitespace-nowrap px-3 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                Expired
              </span>
            ) : expiringSoon ? (
              <span className="inline-flex items-center whitespace-nowrap px-3 py-0.5 rounded-full text-xs font-semibold bg-yellow-600 text-white">
                Expires soon
              </span>
            ) : null)}

          <p
            className={`${expired ? 'text-red-700' : 'text-gray-500 dark:text-gray-400'} text-xs whitespace-nowrap`}
          >
            {expired ? 'Expired:' : 'Expires:'}{' '}
            {isExpiryValid
              ? formatDate(expiryDate, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenDisplay;
