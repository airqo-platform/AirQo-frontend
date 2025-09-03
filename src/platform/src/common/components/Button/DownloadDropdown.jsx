import { useState, useRef, useEffect } from 'react';
import { AqChevronDown } from '@airqo/icons-react';
import CardWrapper from '@/components/CardWrapper';
import Spinner from '@/components/Spinner';

const ReusableDropdown = ({
  options = [],
  onSelect,
  loading = false,
  disabled = false,
  className = '',
  buttonText = 'Select Option',
  loadingText = 'Loading...',
  placeholder = 'Select an option',
  showCount = false,
  countValue = 0,
  tooltip = '',
  showTooltipOnDisabled = true,
  icon: ButtonIcon = null,
  buttonVariant = 'primary', // 'primary', 'secondary', 'outline'
  size = 'md', // 'sm', 'md', 'lg'
  fullWidth = false,
  closeOnSelect = true,
  multiSelect = false,
  selectedValues = [],
  renderOption = null, // Custom option renderer
  renderButton = null, // Custom button content renderer
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  const isDisabled = disabled || loading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleOptionSelect(options[focusedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, options]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleOptionSelect = (option) => {
    if (multiSelect) {
      const isSelected = selectedValues.some(
        (val) => val.value === option.value,
      );
      const newSelectedValues = isSelected
        ? selectedValues.filter((val) => val.value !== option.value)
        : [...selectedValues, option];
      onSelect(newSelectedValues, option);
    } else {
      onSelect(option);
      if (closeOnSelect) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
  };

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(-1);
      }
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs min-w-32',
    md: 'px-4 py-3 text-sm min-w-40',
    lg: 'px-6 py-4 text-base min-w-48',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  // Button variant styles
  const getButtonStyles = () => {
    const baseStyles = `
      relative flex items-center gap-3 font-medium rounded-xl 
      transition-all duration-200
      ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}
    `;

    if (isDisabled) {
      return `${baseStyles} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }

    switch (buttonVariant) {
      case 'secondary':
        return `${baseStyles} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300`;
      case 'outline':
        return `${baseStyles} border-2 border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-300`;
      default: // primary
        return `${baseStyles} bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 active:bg-primary/90`;
    }
  };

  const getDisplayText = () => {
    if (loading) return loadingText;
    if (showCount && countValue > 0) {
      return `${buttonText} (${countValue})`;
    }
    if (multiSelect && selectedValues.length > 0) {
      return selectedValues.length === 1
        ? selectedValues[0].label
        : `${selectedValues.length} selected`;
    }
    return buttonText || placeholder;
  };

  const renderDefaultOption = (option, index) => {
    const isSelected = multiSelect
      ? selectedValues.some((val) => val.value === option.value)
      : false;
    const isFocused = focusedIndex === index;

    return (
      <button
        key={option.value}
        ref={(el) => (optionRefs.current[index] = el)}
        onClick={() => handleOptionSelect(option)}
        role="option"
        aria-selected={isFocused}
        className={`
          w-full flex items-start gap-3 px-4 py-3 text-left
          transition-all duration-150 focus:outline-none
          ${
            isFocused
              ? 'bg-primary/10 text-primary border-l-4 border-primary'
              : 'text-gray-700 hover:bg-gray-50'
          }
          ${isSelected ? 'bg-primary/5' : ''}
        `}
      >
        {option.icon && (
          <div
            className={`flex-shrink-0 p-1 rounded-lg ${
              isFocused ? 'bg-primary/20' : 'bg-gray-100'
            }`}
          >
            {typeof option.icon === 'string' ? (
              <span className="text-sm">{option.icon}</span>
            ) : (
              <option.icon size={iconSizes[size]} />
            )}
          </div>
        )}
        <div className="flex-1">
          <div className="font-medium text-sm flex items-center gap-2">
            {option.label}
            {multiSelect && isSelected && (
              <span className="text-primary">✓</span>
            )}
          </div>
          {option.description && (
            <div
              className={`text-xs mt-0.5 ${
                isFocused ? 'text-primary/80' : 'text-gray-500'
              }`}
            >
              {option.description}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className={`relative inline-block ${fullWidth ? 'w-full' : ''}`}>
      {/* Tooltip */}
      {isDisabled && showTooltipOnDisabled && tooltip && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Main Button */}
      <div className="group relative">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          disabled={isDisabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={tooltip || 'Open dropdown menu'}
          className={`${getButtonStyles()} ${className}`}
        >
          {renderButton ? (
            renderButton({
              loading,
              getDisplayText,
              ButtonIcon,
              iconSizes,
              size,
            })
          ) : (
            <>
              {/* Loading Spinner or Icon */}
              <div className="flex-shrink-0">
                {loading ? (
                  <Spinner size={iconSizes[size]} />
                ) : ButtonIcon ? (
                  <ButtonIcon size={iconSizes[size]} />
                ) : null}
              </div>

              {/* Button Text */}
              <span className="flex-1 text-center font-medium">
                {getDisplayText()}
              </span>

              {/* Chevron Icon */}
              <AqChevronDown
                size={iconSizes[size]}
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && options.length > 0 && (
          <div
            className={`absolute top-full left-0 ${fullWidth ? 'right-0' : 'min-w-full'} mt-2 z-50`}
          >
            <CardWrapper shadow="shadow" padding="p-0">
              <div
                ref={dropdownRef}
                role="listbox"
                className="max-h-64 overflow-y-auto"
              >
                {options.map((option, index) =>
                  renderOption
                    ? renderOption(option, index, {
                        isSelected: multiSelect
                          ? selectedValues.some(
                              (val) => val.value === option.value,
                            )
                          : false,
                        isFocused: focusedIndex === index,
                        onSelect: () => handleOptionSelect(option),
                        ref: (el) => (optionRefs.current[index] = el),
                      })
                    : renderDefaultOption(option, index),
                )}
              </div>
            </CardWrapper>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusableDropdown;
