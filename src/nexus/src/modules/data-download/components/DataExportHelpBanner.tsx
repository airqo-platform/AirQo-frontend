import React from 'react';
import { InfoBanner } from '@/shared/components/ui';
import { AqPlayCircle, AqBookOpen01 } from '@airqo/icons-react';
import { Button } from '@/shared/components/ui';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';

const DATA_EXPORT_DOCS_URL =
  'https://platform.airqo.net/docs/nexus/exporting-data/data-export/';

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
    <div className="flex items-center gap-2">
      <Button
        variant="filled"
        onClick={onShowTutorial}
        Icon={AqPlayCircle}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Watch Tutorial
      </Button>
      <Button
        variant="outlined"
        Icon={AqBookOpen01}
        onClick={() =>
          window.open(
            getEnvironmentAwareUrl(DATA_EXPORT_DOCS_URL),
            '_blank',
            'noopener,noreferrer'
          )
        }
      >
        Read Docs
      </Button>
    </div>
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
