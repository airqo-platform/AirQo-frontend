import React from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  subtitle,
  className = '',
  children,
  action,
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl">{title}</h1>
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
