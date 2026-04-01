'use client';

import React from 'react';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { AqCopy06 } from '@airqo/icons-react';
import { formatDate } from '@/shared/utils';

interface TokenDisplayProps {
  token: string;
  expiresAt?: string | null;
  onRegenerate?: () => void;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ token, expiresAt, onRegenerate }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard');
    } catch {
      toast.error('Failed to copy token');
    }
  };

  const maskedToken = `${token.slice(0, 8)}...${token.slice(-8)}`;

  // Determine expiry status
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const now = Date.now();
  const expiresAtTime = expiryDate ? expiryDate.getTime() : null;
  const expired = expiresAtTime ? expiresAtTime <= now : false;
  const expiringSoon =
    expiresAtTime && expiresAtTime > now && expiresAtTime - now <= 7 * 24 * 60 * 60 * 1000;

  const containerCodeClass = expired
    ? 'font-mono text-xs truncate max-w-[220px] bg-red-50 text-red-800 px-2 py-1 rounded border border-red-200'
    : expiringSoon
    ? 'font-mono text-xs truncate max-w-[220px] bg-yellow-50 text-yellow-800 px-2 py-1 rounded border border-yellow-200'
    : 'font-mono text-xs truncate max-w-[220px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border';

  return (
    <div className="space-y-1 max-w-[360px]">
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-2">
          <code className={containerCodeClass} title={token}>
            {maskedToken}
          </code>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="p-1 h-6 w-6 flex-shrink-0"
                aria-label="Copy token"
              >
                <AqCopy06 className="w-4 h-4" />
              </Button>
              {expired ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                  Expired
                </span>
              ) : expiringSoon ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-600 text-white">
                  Expires soon
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className={`${expired ? 'text-red-700' : 'text-gray-500 dark:text-gray-400'} text-xs`}>
          Expires:{' '}
          {expiryDate
            ? formatDate(expiryDate.toISOString(), {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '—'}
          {expired && expiryDate ? ` (expired ${Math.floor((now - expiryDate.getTime()) / (1000 * 60 * 60 * 24))}d ago)` : ''}
        </p>

        {expired && onRegenerate ? (
          <Button
            size="sm"
            variant="outlined"
            onClick={onRegenerate}
            className="text-red-700 border-red-200 hover:bg-red-50"
          >
            Regenerate
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default TokenDisplay;
