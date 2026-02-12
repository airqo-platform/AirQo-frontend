import React from 'react';

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
          {infoLine && (
            <blockquote className="mt-2 text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3 leading-relaxed">
              {infoLine}
            </blockquote>
          )}
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
