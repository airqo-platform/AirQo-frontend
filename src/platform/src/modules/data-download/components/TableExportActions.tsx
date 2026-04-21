'use client';

import React, { useCallback } from 'react';
import { AqDownload01 } from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui';
import { ColumnConfig, TableItem } from '../types/dataExportTypes';
import { exportTableAsCsv, exportTableAsPdf } from '../utils/tableExport';

interface TableExportActionsProps {
  title: string;
  exportData: TableItem[];
  columns: ColumnConfig[];
  disabled?: boolean;
  tooltipText?: string;
}

export const TableExportActions: React.FC<TableExportActionsProps> = ({
  title,
  exportData,
  columns,
  disabled = false,
  tooltipText = 'Includes selected rows from all pages. Air quality data excluded.',
}) => {
  const isDisabled = disabled || exportData.length === 0;

  const handleExport = useCallback(
    (format: 'csv' | 'pdf') => {
      if (isDisabled) {
        return;
      }

      if (format === 'csv') {
        exportTableAsCsv({ title, data: exportData, columns });
        return;
      }

      exportTableAsPdf({ title, data: exportData, columns });
    },
    [columns, exportData, isDisabled, title]
  );

  return (
    <DropdownMenu>
      <Tooltip content={tooltipText} placement="top">
        <span className="inline-flex">
          <DropdownMenuTrigger asChild>
            <Button
              variant="outlined"
              size="sm"
              Icon={AqDownload01}
              showTextOnMobile
              disabled={isDisabled}
              className="whitespace-nowrap"
            >
              Export as CSV/PDF
            </Button>
          </DropdownMenuTrigger>
        </span>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-[260px] z-[10010]">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-sm font-medium text-foreground">
            Export table view
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Exports selected rows across pages.
          </p>
        </div>

        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          className="cursor-pointer flex flex-col items-start gap-1"
          disabled={isDisabled}
        >
          <span className="text-sm font-medium text-foreground">CSV</span>
          <span className="text-xs text-muted-foreground">
            Best for spreadsheets, analysis, and bulk sharing.
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          className="cursor-pointer flex flex-col items-start gap-1"
          disabled={isDisabled}
        >
          <span className="text-sm font-medium text-foreground">PDF</span>
          <span className="text-xs text-muted-foreground">
            Styled report export for presentation and review.
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
