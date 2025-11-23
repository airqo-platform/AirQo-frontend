'use client';

import * as React from 'react';
import { AqMenu02 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';
import { Card } from './card';
import { OrganizationSelector } from '@/shared/components/header/components';
import { useAppDispatch } from '@/shared/hooks/redux';
import { toggleSidebar } from '@/shared/store/uiSlice';

interface SecondaryNavigationProps {
  className?: string;
}

export const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({
  className,
}) => {
  const dispatch = useAppDispatch();

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className={cn('relative', className)}>
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <OrganizationSelector />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSidebarToggle}
            className="ml-2"
            aria-label="Toggle sidebar"
          >
            <AqMenu02 className="text-foreground" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
