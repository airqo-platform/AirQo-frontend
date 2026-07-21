'use client';

import React from 'react';
import {
  AqHelpCircle,
  AqMessageNotificationSquare,
  AqBookOpen01,
} from '@airqo/icons-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { openFeedbackDialog } from '@/modules/feedback/utils/feedbackDialog';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';

interface InfoDropdownProps {
  className?: string;
}

const DOCS_URL = getEnvironmentAwareUrl(
  'https://platform.airqo.net/docs/nexus/intro'
);

const InfoDropdown: React.FC<InfoDropdownProps> = ({ className = '' }) => {
  return (
    <DropdownMenu className={className}>
      <DropdownMenuTrigger
        className="p-2.5 rounded-full transition hover:bg-muted focus:outline-none"
        aria-label="Help and info"
      >
        <AqHelpCircle className="w-5 h-5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="z-[10000] min-w-[180px]" align="end">
        <DropdownMenuItem onClick={openFeedbackDialog}>
          <AqMessageNotificationSquare className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
          <span>Share Feedback</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(DOCS_URL, '_blank', 'noopener,noreferrer')}
        >
          <AqBookOpen01 className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
          <span>Learn about AirQo Nexus</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InfoDropdown;
