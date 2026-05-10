'use client';

import React, { useEffect, useState } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import Radio from '@/shared/components/ui/radio';
import { InfoBanner } from '@/shared/components/ui/banner';

type SaveFormat = 'csv' | 'xlsx' | 'pdf';

interface DownloadFormatDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  savingFormat: SaveFormat | null;
  locationCount: number;
  onClose: () => void;
  onSave: (format: SaveFormat) => void;
}

const formatCards: Array<{
  format: SaveFormat;
  title: string;
  actionLabel: string;
  description: string;
  badge: string;
  requiresMultipleLocations?: boolean;
}> = [
  {
    format: 'csv',
    title: 'CSV spreadsheet',
    actionLabel: 'Download CSV',
    description:
      'Download one spreadsheet file with all rows together. Best for analysis, sharing, and importing into other tools.',
    badge: 'Single file',
  },
  {
    format: 'xlsx',
    title: 'Excel workbook',
    actionLabel: 'Download Excel workbook',
    description:
      'Download an Excel file where each selected location has its own sheet.',
    badge: 'Separate sheets',
    requiresMultipleLocations: true,
  },
  {
    format: 'pdf',
    title: 'PDF report',
    actionLabel: 'Download PDF',
    description:
      'Download a formatted report with a summary, table, and page numbers.',
    badge: 'Report',
  },
];

export const DownloadFormatDialog: React.FC<DownloadFormatDialogProps> = ({
  isOpen,
  isSaving,
  savingFormat,
  locationCount,
  onClose,
  onSave,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<SaveFormat>('csv');
  const hasMultipleLocations = locationCount > 1;

  useEffect(() => {
    if (isOpen) {
      setSelectedFormat('csv');
    }
  }, [isOpen]);

  const selectedLabel =
    formatCards.find(card => card.format === selectedFormat)?.actionLabel ||
    'Download CSV';

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    format: SaveFormat,
    isDisabled: boolean
  ) => {
    if (isDisabled) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedFormat(format);
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Select Download Format"
      subtitle="Choose the file type that works best for this export."
      size="xl"
      showCloseButton={!isSaving}
      preventBackdropClose={isSaving}
      primaryAction={{
        label: isSaving ? 'Saving...' : selectedLabel,
        onClick: () => onSave(selectedFormat),
        disabled: isSaving,
        loading: isSaving,
        padding: 'px-5 py-2.5',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: isSaving,
        variant: 'outlined',
        padding: 'px-4 py-2',
      }}
    >
      <div className="space-y-3">
        <InfoBanner
          dense
          title={
            hasMultipleLocations
              ? 'Export includes multiple locations'
              : 'Choose a format'
          }
          message={
            hasMultipleLocations
              ? 'Excel can place each location on a separate sheet. CSV keeps all rows in one file.'
              : 'CSV and PDF are available for this export. Excel sheets are available when two or more locations are selected.'
          }
        />

        <div className="space-y-2">
          {formatCards.map(card => {
            const isSelected = selectedFormat === card.format;
            const isCurrentSaving = isSaving && savingFormat === card.format;
            const isUnavailable =
              card.requiresMultipleLocations && !hasMultipleLocations;
            const isDisabled = isUnavailable || (isSaving && !isCurrentSaving);

            return (
              <div
                key={card.format}
                role="radio"
                tabIndex={isDisabled ? -1 : 0}
                aria-checked={isSelected}
                aria-disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    setSelectedFormat(card.format);
                  }
                }}
                onKeyDown={event =>
                  handleCardKeyDown(event, card.format, isDisabled)
                }
                className={`group rounded-lg border px-3 py-3 text-left transition-colors duration-200 ${isDisabled ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-500' : 'cursor-pointer border-gray-200 bg-white text-gray-900 hover:border-primary/50 hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-primary/60'} ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/30 dark:border-primary/80' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Radio
                    checked={isSelected}
                    tabIndex={-1}
                    disabled={isDisabled}
                    onChange={() => {
                      if (!isDisabled) {
                        setSelectedFormat(card.format);
                      }
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{card.title}</p>
                      <span className="rounded-full border border-current px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
                        {card.format}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {card.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                      {isUnavailable
                        ? 'Available when two or more locations are selected.'
                        : card.description}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {isSelected
                      ? 'Selected'
                      : isUnavailable
                        ? 'Unavailable'
                        : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ReusableDialog>
  );
};
