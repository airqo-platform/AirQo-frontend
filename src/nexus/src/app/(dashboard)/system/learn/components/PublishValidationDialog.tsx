'use client';

import React from 'react';
import { Dialog } from '@/shared/components/ui';
import { AqInfoCircle } from '@airqo/icons-react';

interface PublishValidationDialogProps {
  isOpen: boolean;
  issues: string[];
  onClose: () => void;
}

const PublishValidationDialog: React.FC<PublishValidationDialogProps> = ({
  isOpen,
  issues,
  onClose,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Cannot publish course"
      subtitle="The course does not meet the publishing requirements yet."
      size="md"
      primaryAction={{
        label: 'Got it',
        onClick: onClose,
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Please resolve the following issues before publishing:
        </p>

        <ul className="space-y-2">
          {/* Display-only list — no stable ID available */}
          {issues.map((issue, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-lg bg-muted/15 p-3 text-sm text-foreground"
            >
              <AqInfoCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
};

export default PublishValidationDialog;
