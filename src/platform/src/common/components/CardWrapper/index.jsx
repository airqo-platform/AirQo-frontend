import React, { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * A highly flexible card wrapper component for use across the entire application
 */
const Card = forwardRef(
  (
    {
      children,
      className = '',
      contentClassName = '',
      bordered = true,
      borderColor = 'border-grey-750',
      rounded = true,
      radius = 'rounded-xl',
      background = 'bg-white',
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
      title,
      subtitle,
      headerProps = {},
      footerProps = {},
      onClick,
      active = false,
      hoverable = false,
      disabled = false,
      testId,
      ...rest
    },
    ref,
  ) => {
    const cardClasses = clsx(
      // Base classes
      'flex flex-col',
      width,
      height,
      background,

      // Conditional classes
      rounded && (radius || 'rounded-xl'),
      bordered && ['border', borderColor],
      shadow && shadow,
      onClick && 'cursor-pointer',
      active && 'ring-2 ring-blue-500',
      hoverable && 'hover:shadow-md transition-shadow duration-200',
      disabled && 'opacity-60 pointer-events-none',
      className,
    );

    const contentClasses = clsx(
      padding,
      overflow && [
        'overflow-y-' + overflowType,
        'scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200',
      ],
      contentClassName,
    );

    const headerClasses = clsx(
      'flex items-center justify-between',
      headerProps.className || '',
    );

    const footerClasses = clsx('mt-auto', footerProps.className || '');

    // Create default header if title is provided
    const defaultHeader =
      title || subtitle || icon || badge ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3 className="font-semibold text-gray-800">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
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
  },
);

// Add display name for better debugging
Card.displayName = 'Card';

export default Card;
