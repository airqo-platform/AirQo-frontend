import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AqArrowNarrowLeft } from '@airqo/icons-react';

/**
 * Reusable page header component.
 *
 * Props:
 * - title: string | React.node
 * - subtitle: string | React.node
 * - icon: React component (optional)
 * - right: React node to render on the right side (optional)
 * - actions: React node(s) to render below the title (optional)
 * - showBack: boolean - whether to show a back button
 * - onBack: function - back button handler
 * - className: additional classes
 * - divider: boolean - show a bottom divider
 */
const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  imageSrc = null,
  imageAlt = '',
  iconClassName = 'w-8 h-8 text-primary dark:text-primary',
  imageClassName = 'w-8 h-8 object-contain',
  iconBg = true,
  right = null,
  actions = null,
  showBack = false,
  onBack = null,
  className = '',
  divider = false,
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const mq =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

    const check = () =>
      setIsDark(root.classList.contains('dark') || !!(mq && mq.matches));

    check();
    if (mq && mq.addEventListener) mq.addEventListener('change', check);

    const obs = new MutationObserver(() => check());
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', check);
      obs.disconnect();
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start space-x-4 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center w-9 h-9 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <AqArrowNarrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Render either an image (raster) or an icon (svg component). Images get a dark-mode invert filter
              so logos designed for light backgrounds remain visible in dark mode. */}
          {(imageSrc || Icon) && (
            <div
              className={`flex-shrink-0 mt-0.5 ${iconBg ? 'p-1 rounded-full bg-gray-100 dark:bg-gray-800' : ''}`}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className={`${imageClassName} rounded dark:invert`}
                />
              ) : (
                Icon && <Icon className={iconClassName} />
              )}
            </div>
          )}

          <div className="min-w-0">
            {title && (
              <h1
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate"
                style={isDark ? { color: '#ffffff' } : undefined}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {right && <div className="flex-shrink-0 ml-4">{right}</div>}
      </div>

      {actions && <div className="mt-4">{actions}</div>}

      {children}

      {divider && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-800" />
      )}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  icon: PropTypes.elementType,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  iconClassName: PropTypes.string,
  imageClassName: PropTypes.string,
  iconBg: PropTypes.bool,
  right: PropTypes.node,
  actions: PropTypes.node,
  showBack: PropTypes.bool,
  onBack: PropTypes.func,
  className: PropTypes.string,
  divider: PropTypes.bool,
  children: PropTypes.node,
};

export default React.memo(PageHeader);
