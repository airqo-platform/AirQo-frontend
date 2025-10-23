'use client';

import React from 'react';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { AqCopy06 } from '@airqo/icons-react';
import { formatDate } from '@/shared/utils';

interface TokenDisplayProps {
  token: string;
  expiresAt: string;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ token, expiresAt }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Token copied to clipboard');
    } catch {
      toast.error('Failed to copy token');
    }
  };

  const maskedToken = `${token.slice(0, 8)}...${token.slice(-8)}`;

  return (
    <div className="space-y-1 max-w-[320px]">
      <div className="flex items-center gap-2">
        <code className="font-mono text-xs truncate max-w-[220px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border">
          {maskedToken}
        </code>
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
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Expires:{' '}
        {formatDate(expiresAt, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </div>
  );
};

export default TokenDisplay;
