'use client';

import React, { forwardRef, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  bordered?: boolean;
  borderColor?: string;
  rounded?: boolean;
  radius?: string;
  background?: string;
  shadow?: string;
  padding?: string;
  width?: string;
  height?: string;
  overflow?: boolean;
  overflowType?: 'auto' | 'scroll' | 'hidden' | 'visible';
  header?: ReactNode;
  footer?: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  cardTitle?: ReactNode; 
  subtitle?: ReactNode;
  headerProps?: React.HTMLAttributes<HTMLDivElement>;
  footerProps?: React.HTMLAttributes<HTMLDivElement>;
  onClick?: () => void;
  active?: boolean;
  hoverable?: boolean;
  disabled?: boolean;
  testId?: string;
  skin?: 'default' | 'bordered';
  isSemiDarkEnabled?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      contentClassName = '',
      bordered,
      borderColor = 'border-gray-200 dark:border-gray-700',
      rounded = true,
      radius = 'rounded-lg',
      background = 'bg-white dark:bg-[#1d1f20]',
      shadow = '',
      padding = 'p-4',
      width = 'w-full',
      height = 'h-auto',
      overflow = false,
      overflowType = 'auto',
      header,
      footer,
      leftContent,
      rightContent,
      badge,
      icon,
      cardTitle,
      subtitle,
      headerProps = {},
      footerProps = {},
      onClick,
      active = false,
      hoverable = false,
      disabled = false,
      testId,
      skin = 'bordered',
      isSemiDarkEnabled = false,
      ...rest
    },
    ref
  ) => {

    const shouldBeBordered =
      bordered !== undefined ? bordered : skin === 'bordered';

    const appliedShadow = shadow || (skin === 'default' ? 'shadow' : '');

    const isSidebarCard = className?.includes('sidebar') || false;
    const shouldApplySemiDark = isSemiDarkEnabled && isSidebarCard;

    const cardClasses = clsx(
      'flex flex-col',
      width,
      height,
      shouldApplySemiDark ? 'bg-gray-800 text-white' : background,
      rounded && (radius || 'rounded-xl'),
      shouldBeBordered && ['border', borderColor],
      appliedShadow,
      onClick && 'cursor-pointer',
      active && 'ring-2 ring-blue-500',
      hoverable && 'hover:shadow-md transition-shadow duration-200',
      disabled && 'opacity-60 pointer-events-none',
      !shouldApplySemiDark && 'text-gray-900 dark:text-white',
      className
    );

    const contentClasses = clsx(
      padding,
      overflow && [
        `overflow-y-${overflowType}`,
        'scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700',
      ],
      contentClassName
    );

    const headerClasses = clsx(
      'flex items-center justify-between',
      padding,
      headerProps.className || ''
    );

    const footerClasses = clsx(
      'mt-auto',
      padding,
      footerProps.className || ''
    );

    const defaultHeader =
      cardTitle || subtitle || icon || badge ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            {(cardTitle || subtitle) && (
              <div>
                {cardTitle && (
                  <h3
                    className={`font-semibold ${
                      shouldApplySemiDark
                        ? 'text-white'
                        : 'text-gray-800 dark:text-white'
                    }`}
                  >
                    {cardTitle}
                  </h3>
                )}
                {subtitle && (
                  <p
                    className={`text-sm ${
                      shouldApplySemiDark
                        ? 'text-gray-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          {badge && <div>{badge}</div>}
        </div>
      ) : null;

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={onClick}
        data-testid={testId}
        {...rest}
      >
        {(header || defaultHeader) && (
          <div className={headerClasses} {...headerProps}>
            {header || defaultHeader}
          </div>
        )}

        {leftContent || rightContent ? (
          <div className={`flex ${contentClasses}`}>
            {leftContent && <div className="flex-shrink-0">{leftContent}</div>}
            <div className={clsx('flex-grow', !padding && 'p-4')}>
              {children}
            </div>
            {rightContent && (
              <div className="flex-shrink-0">{rightContent}</div>
            )}
          </div>
        ) : (
          <div className={contentClasses}>{children}</div>
        )}

        {footer && (
          <div className={footerClasses} {...footerProps}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
