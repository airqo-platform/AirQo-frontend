'use client';

import * as React from 'react';
import { AqMenu02 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';
import { Card } from './card';
import { OrganizationSelector } from '@/shared/components/header/components';
import { OrgCohortSwitcher } from '@/shared/components/cohorts/OrgCohortSwitcher';
import { useAppDispatch } from '@/shared/hooks/redux';
import { toggleMobileSidebar } from '@/shared/store/uiSlice';

interface SecondaryNavigationProps {
  className?: string;
}

export const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({
  className,
}) => {
  const dispatch = useAppDispatch();

  const handleSidebarToggle = () => {
    dispatch(toggleMobileSidebar());
  };

  return (
    <div className={cn('relative', className)}>
      <Card className="p-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <OrganizationSelector />
            <OrgCohortSwitcher
              className="min-w-0 flex-1"
              containerClassName="mb-0 min-w-0 flex-1"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSidebarToggle}
            className="ml-2"
            aria-label="Toggle sidebar"
          >
            <AqMenu02 className="h-4 w-4 text-foreground" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
