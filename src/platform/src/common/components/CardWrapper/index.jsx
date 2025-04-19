import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

/**
 * A highly flexible card wrapper component for use across the entire application
 * that automatically applies the current theme skin settings
 */
const Card = forwardRef(
  (
    {
      children,
      className = '',
      contentClassName = '',
      bordered,
      borderColor = 'border-gray-200 dark:border-gray-700',
      rounded = true,
      radius = 'rounded-xl',
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
    // Get theme context to apply skin settings
    const { skin, isSemiDarkEnabled } = useTheme();

    // Determine if card should be bordered based on skin if not explicitly set
    const shouldBeBordered =
      bordered !== undefined ? bordered : skin === 'bordered';

    // Determine shadow based on skin if not explicitly set
    const appliedShadow = shadow || (skin === 'default' ? 'shadow-sm' : '');

    // Determine if we need to apply semi-dark styles
    const isSidebarCard = className?.includes('sidebar') || false;
    const shouldApplySemiDark = isSemiDarkEnabled && isSidebarCard;

    const cardClasses = clsx(
      // Base classes
      'flex flex-col',
      width,
      height,

      // Apply background with conditional semi-dark mode for sidebar
      shouldApplySemiDark ? 'bg-gray-800 text-white' : background,

      // Conditional classes
      rounded && (radius || 'rounded-xl'),
      shouldBeBordered && ['border', borderColor],
      appliedShadow,
      onClick && 'cursor-pointer',
      active && 'ring-2 ring-blue-500',
      hoverable && 'hover:shadow-md transition-shadow duration-200',
      disabled && 'opacity-60 pointer-events-none',

      // Ensure text is properly colored in dark/light mode
      !shouldApplySemiDark && 'text-gray-900 dark:text-white',

      className,
    );

    const contentClasses = clsx(
      padding,
      overflow && [
        'overflow-y-' + overflowType,
        'scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700',
      ],
      contentClassName,
    );

    const headerClasses = clsx(
      'flex items-center justify-between',
      padding,
      headerProps.className || '',
    );

    const footerClasses = clsx('mt-auto', padding, footerProps.className || '');

    // Create default header if title is provided
    const defaultHeader =
      title || subtitle || icon || badge ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            {(title || subtitle) && (
              <div>
                {title && (
                  <h3
                    className={`font-semibold ${shouldApplySemiDark ? 'text-white' : 'text-gray-800 dark:text-white'}`}
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p
                    className={`text-sm ${shouldApplySemiDark ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}
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
  },
);

// Add display name for better debugging
Card.displayName = 'Card';

export default Card;
