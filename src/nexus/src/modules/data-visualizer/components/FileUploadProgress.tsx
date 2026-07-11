import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface FileUploadProgressItem {
  id: string;
  file: File;
  progress: number; // 0-100
  status: 'parsing' | 'complete' | 'error' | 'cancelled' | 'retrying';
  errorMessage?: string;
}

interface FileUploadProgressProps {
  files: FileUploadProgressItem[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getStatusColor = (status: FileUploadProgressItem['status']): string => {
  switch (status) {
    case 'parsing':
      return 'text-primary';
    case 'complete':
      return 'text-green-600';
    case 'error':
      return 'text-destructive';
    case 'cancelled':
      return 'text-muted-foreground';
    case 'retrying':
      return 'text-amber-600';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusText = (status: FileUploadProgressItem['status']): string => {
  switch (status) {
    case 'parsing':
      return 'Parsing...';
    case 'complete':
      return 'Complete';
    case 'error':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    case 'retrying':
      return 'Retrying...';
    default:
      return '';
  }
};

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  files,
  onCancel,
  onRetry,
  className,
}) => {
  if (files.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {files.map(item => (
        <div
          key={item.id}
          className={cn(
            'rounded-lg border p-3 transition-colors',
            item.status === 'error'
              ? 'border-destructive/50 bg-destructive/5'
              : item.status === 'complete'
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                : 'border-border bg-background'
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(item.file.size)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    getStatusColor(item.status)
                  )}
                >
                  {getStatusText(item.status)}
                </span>
                {item.status === 'parsing' && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(item.progress)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.status === 'parsing' && onCancel && (
                <button
                  onClick={() => onCancel(item.id)}
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
              )}
              {item.status === 'error' && onRetry && (
                <button
                  onClick={() => onRetry(item.id)}
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
          {/* Progress bar */}
          {(item.status === 'parsing' || item.status === 'retrying') && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, item.progress))}%`,
                }}
              />
            </div>
          )}
          {item.status === 'error' && item.errorMessage && (
            <p className="mt-2 text-xs text-destructive">{item.errorMessage}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileUploadProgress;
