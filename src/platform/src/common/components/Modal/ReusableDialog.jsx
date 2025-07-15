import React, { useEffect, useRef } from 'react';
import Button from '@/common/components/Button';
import { FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Dialog = ({
  // Core props
  isOpen,
  onClose,
  children,

  // Header props
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10 dark:bg-primary/20',
  showCloseButton = true,
  customHeader,

  // Content props
  maxHeight = 'max-h-96',
  contentClassName = '',

  // Footer props
  showFooter = true,
  primaryAction,
  secondaryAction,
  customFooter,

  // Modal props
  size = 'lg',
  preventBackdropClose = false,
  className = '',

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
}) => {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      dialogRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size mapping for dialog widths
  const sizeMap = {
    xs: 'max-w-xs', // ~320px
    sm: 'max-w-sm', // ~384px
    md: 'max-w-md', // ~448px
    lg: 'max-w-lg', // ~512px
    xl: 'max-w-xl', // ~576px
    '2xl': 'max-w-2xl', // ~672px
    '3xl': 'max-w-3xl', // ~768px
    '4xl': 'max-w-4xl', // ~896px
    '5xl': 'max-w-5xl', // ~1024px
    '6xl': 'max-w-6xl', // ~1152px
    '7xl': 'max-w-7xl', // ~1280px
    full: 'max-w-full', // Full width
    screen: 'max-w-screen-xl',
    // Custom responsive breakpoints
    'sm-responsive': 'max-w-xs sm:max-w-sm',
    'md-responsive': 'max-w-sm sm:max-w-md',
    'lg-responsive': 'max-w-md sm:max-w-lg',
    'xl-responsive': 'max-w-lg sm:max-w-xl',
    '2xl-responsive': 'max-w-xl sm:max-w-2xl',
    // Special sizes
    narrow: 'max-w-96', // ~384px - Good for confirmations
    wide: 'max-w-4xl', // ~896px - Good for forms
    ultra: 'max-w-7xl', // ~1280px - Good for dashboards
  };

  // Fallback to custom size if not in map
  const dialogWidth = sizeMap[size] || size;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventBackdropClose) {
      onClose();
    }
  };

  const renderHeader = () => {
    if (customHeader) {
      return customHeader;
    }

    if (!title && !Icon) {
      return null;
    }

    return (
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          )}
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            aria-label="Close dialog"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const renderFooter = () => {
    if (customFooter) {
      return customFooter;
    }

    if (!showFooter) {
      return null;
    }

    return (
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant={secondaryAction.variant || 'outlined'}
            disabled={secondaryAction.disabled}
            className={secondaryAction.className || 'text-sm'}
            padding={secondaryAction.padding || 'px-4 py-2'}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className={
              primaryAction.className ||
              'text-sm bg-primary hover:bg-primary/90 focus:ring-primary text-white disabled:opacity-50'
            }
            padding={primaryAction.padding || 'px-4 py-2'}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/80 transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-label="Close dialog"
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel || title}
          aria-describedby={ariaDescribedBy}
          className={`relative w-full ${dialogWidth} bg-white rounded-2xl shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col overflow-hidden z-[10001] ${className}`}
        >
          {/* Header */}
          {renderHeader()}

          {/* Content */}
          <div
            className={`flex-1 p-6 ${maxHeight} overflow-y-auto ${contentClassName}`}
          >
            {children}
          </div>

          {/* Footer */}
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};

Dialog.propTypes = {
  // Core props
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,

  // Header props
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  iconColor: PropTypes.string,
  iconBgColor: PropTypes.string,
  showCloseButton: PropTypes.bool,
  customHeader: PropTypes.node,

  // Content props
  maxHeight: PropTypes.string,
  contentClassName: PropTypes.string,

  // Footer props
  showFooter: PropTypes.bool,
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    padding: PropTypes.string,
  }),
  secondaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    variant: PropTypes.string,
    className: PropTypes.string,
    padding: PropTypes.string,
  }),
  customFooter: PropTypes.node,

  // Modal props
  size: PropTypes.oneOf([
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
    '6xl',
    '7xl',
    'full',
    'screen',
    'sm-responsive',
    'md-responsive',
    'lg-responsive',
    'xl-responsive',
    '2xl-responsive',
    'narrow',
    'wide',
    'ultra',
  ]),
  preventBackdropClose: PropTypes.bool,
  className: PropTypes.string,

  // Accessibility
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
};

export default Dialog;
