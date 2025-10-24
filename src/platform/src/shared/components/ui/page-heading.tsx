import React from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  subtitle,
  className = '',
  children,
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default PageHeading;
