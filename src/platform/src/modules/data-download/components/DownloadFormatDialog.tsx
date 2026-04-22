'use client';

import React, { useEffect, useState } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import Radio from '@/shared/components/ui/radio';
import { InfoBanner } from '@/shared/components/ui/banner';

type SaveFormat = 'csv' | 'pdf';

interface DownloadFormatDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  savingFormat: SaveFormat | null;
  onClose: () => void;
  onSave: (format: SaveFormat) => void;
}

const formatCards: Array<{
  format: SaveFormat;
  title: string;
  description: string;
  accentClassName: string;
  badge: string;
}> = [
  {
    format: 'csv',
    title: 'Save as CSV',
    description:
      'Best for Excel, analysis, and reusing the data in other tools.',
    accentClassName:
      'border-sky-200 bg-sky-50/70 text-sky-900 hover:border-sky-400 hover:bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-50',
    badge: 'Spreadsheet',
  },
  {
    format: 'pdf',
    title: 'Save as PDF',
    description:
      'Creates a polished report with a title, summary, table, and page numbers.',
    accentClassName:
      'border-slate-200 bg-slate-50/80 text-slate-900 hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50',
    badge: 'Report',
  },
];

export const DownloadFormatDialog: React.FC<DownloadFormatDialogProps> = ({
  isOpen,
  isSaving,
  savingFormat,
  onClose,
  onSave,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<SaveFormat>('csv');

  useEffect(() => {
    if (isOpen) {
      setSelectedFormat('csv');
    }
  }, [isOpen]);

  const selectedLabel =
    formatCards.find(card => card.format === selectedFormat)?.title ||
    'Save as CSV';

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
      title="Choose Save Format"
      subtitle="Pick the file format for the final save step."
      size="lg"
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
      <div className="space-y-5">
        <InfoBanner
          title="Ready to save"
          message="Select CSV for spreadsheets or PDF for a polished report."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {formatCards.map(card => {
            const isSelected = selectedFormat === card.format;
            const isCurrentSaving = isSaving && savingFormat === card.format;
            const isDisabled = isSaving && !isCurrentSaving;

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
                className={`group flex h-full flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${card.accentClassName} ${isDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:-translate-y-0.5'} ${isSelected ? 'ring-2 ring-primary/40 shadow-lg shadow-primary/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
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
                    <div>
                      <p className="text-base font-semibold">{card.title}</p>
                      <p className="mt-1 text-xs leading-5 opacity-80">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-current px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] opacity-90">
                    {card.format}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] opacity-75">
                  <span>{card.badge}</span>
                  <span>{isSelected ? 'Selected' : 'Available'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ReusableDialog>
  );
};
