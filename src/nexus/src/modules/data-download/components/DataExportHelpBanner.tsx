import React from 'react';
import { InfoBanner } from '@/shared/components/ui';
import { AqPlayCircle } from '@airqo/icons-react';
import { Button } from '@/shared/components/ui';

interface DataExportHelpBannerProps {
  onShowTutorial: () => void;
  onDismiss?: () => void;
}

/**
 * Help banner component for the data export page
 * Provides a prominent call-to-action to watch the tutorial video
 * Uses the existing InfoBanner component for consistency
 */
export const DataExportHelpBanner: React.FC<DataExportHelpBannerProps> = ({
  onShowTutorial,
  onDismiss,
}) => {
  const actions = (
    <Button
      variant="filled"
      onClick={onShowTutorial}
      Icon={AqPlayCircle}
      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
    >
      Watch Tutorial
    </Button>
  );

  return (
    <InfoBanner
      title="How to use Data Download"
      message="Use the checkboxes to choose locations for export. Click a site or device row to open its air quality details, or use Customize Sites for country and city selections."
      actions={actions}
      dismissible={!!onDismiss}
      onDismiss={onDismiss}
      icon={<AqPlayCircle className="w-5 h-5" />}
      className="mb-4"
    />
  );
};
