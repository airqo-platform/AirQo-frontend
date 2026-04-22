'use client';

import React, { useEffect, useState } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import Checkbox from '@/shared/components/ui/checkbox';
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

            return (
              <div
                key={card.format}
                onClick={() => {
                  if (!isSaving) {
                    setSelectedFormat(card.format);
                  }
                }}
                className={`group flex h-full flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${card.accentClassName} ${isSelected ? 'ring-2 ring-primary/40 shadow-lg shadow-primary/10' : 'hover:-translate-y-0.5'} ${isSaving && !isCurrentSaving ? 'opacity-80' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      disabled={isSaving && !isCurrentSaving}
                      onCheckedChange={() => {
                        if (!isSaving) {
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
