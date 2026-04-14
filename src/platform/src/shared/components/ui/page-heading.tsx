import React from 'react';

import { InfoBanner } from '@/shared/components/ui/banner';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  infoLine?: string;
  className?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  subtitle,
  infoLine,
  className = '',
  children,
  action,
}) => {
  return (
    <div className={`${infoLine ? 'mb-4' : 'mb-6'} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl">{title}</h1>
          {infoLine && <InfoBanner title={infoLine} className="mt-3" />}
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default PageHeading;
