'use client';

import React from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { useEnvironmentAwareUrl } from '@/shared/hooks';

interface DataAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * "Data Access & Usage" dialog shared by the adaptive and legacy homepages.
 */
export const DataAccessDialog = ({
  isOpen,
  onClose,
}: DataAccessDialogProps) => {
  const fairUsagePolicyUrl = useEnvironmentAwareUrl(
    'https://platform.airqo.net/docs/data-access/fair-usage-policy/'
  );
  const researchersGuideUrl = useEnvironmentAwareUrl(
    'https://platform.airqo.net/docs/data-access/researchers-guide/'
  );

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Data Access & Usage"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Access guidance on how to use and share AirQo data responsibly.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <a
              href={fairUsagePolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Fair Usage Policy
            </a>
          </li>
          <li>
            <a
              href={researchersGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Researchers Guide
            </a>
          </li>
        </ul>
      </div>
    </ReusableDialog>
  );
};
