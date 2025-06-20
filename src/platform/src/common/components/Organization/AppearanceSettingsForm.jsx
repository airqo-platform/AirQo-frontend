import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { FaPalette, FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import CardWrapper from '@/common/components/CardWrapper';
import CustomToast from '@/common/components/Toast/CustomToast';
import { useOrganizationTheme } from '@/core/hooks/useOrganizationTheme';
import AppearanceSettingsFormSkeleton from './AppearanceSettingsFormSkeleton';

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    icon: FaSun,
    description: 'Clean, bright interface',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: FaMoon,
    description: 'Easy on the eyes',
  },
  {
    value: 'system',
    label: 'System',
    icon: FaDesktop,
    description: 'Follows device settings',
  },
];

// Predefined color suggestions
const colorSuggestions = [
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#10B981', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
];

const AppearanceSettingsForm = forwardRef(
  ({ onAppearanceChange = () => {}, onSave = () => {} }, ref) => {
    const {
      themeData,
      error,
      isLoading,
      isUpdating,
      updateTheme,
      hasActiveGroup,
    } = useOrganizationTheme();

    // Local state for form data
    const [formData, setFormData] = useState({
      primaryColor: '#3B82F6',
      mode: 'light',
      interfaceStyle: 'bordered',
      contentLayout: 'compact',
    });

    const handleSave = async () => {
      try {
        await updateTheme(formData);
        CustomToast({
          message: 'Appearance settings updated successfully',
          type: 'success',
        });
        onSave(); // Call parent save handler
      } catch (error) {
        CustomToast({
          message: error.message || 'Failed to update appearance settings',
          type: 'error',
        });
      }
    };

    // Expose handleSave to parent component - MUST be before any conditional returns
    useImperativeHandle(ref, () => ({
      handleSave,
    })); // Update form data when theme data is loaded
    useEffect(() => {
      if (themeData) {
        setFormData({
          primaryColor: themeData.primaryColor || '#3B82F6',
          mode: themeData.mode || 'light',
          interfaceStyle: themeData.interfaceStyle || 'bordered',
          contentLayout: themeData.contentLayout || 'compact',
        });
      }
    }, [themeData]);

    // Show loading skeleton while fetching data
    if (isLoading) {
      return (
        <CardWrapper>
          <AppearanceSettingsFormSkeleton />
        </CardWrapper>
      );
    }

    // Show error if no active group
    if (!hasActiveGroup) {
      return (
        <CardWrapper>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No active organization found. Please select an organization to
              manage appearance settings.
            </p>
          </div>
        </CardWrapper>
      );
    }

    // Show error if failed to load
    if (error) {
      return (
        <CardWrapper>
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-2">
              Failed to load appearance settings
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error.message || 'Please try again later'}
            </p>
          </div>
        </CardWrapper>
      );
    }
    const handleFieldChange = (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Call the parent callback for backward compatibility
      onAppearanceChange(field, value);
    };

    const handleColorChange = (color) => {
      handleFieldChange('primaryColor', color);
    };

    // Map mode to theme for backward compatibility
    const appearanceData = {
      theme: formData.mode,
      primaryColor: formData.primaryColor,
      ...formData,
    };

    return (
      <CardWrapper>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <FaPalette className="mr-2 text-primary" />
              Appearance Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize the visual appearance of your organization's interface
            </p>
          </div>
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Theme
            </label>{' '}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {' '}
              {themeOptions.map((theme) => {
                const Icon = theme.icon;
                const isSelected = formData.mode === theme.value;

                return (
                  <div
                    key={theme.value}
                    onClick={() => handleFieldChange('mode', theme.value)}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? 'bg-gray-50 dark:bg-gray-800/50'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                    style={{
                      borderColor: isSelected
                        ? formData.primaryColor
                        : undefined,
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Icon
                        className={`w-8 h-8 mb-2`}
                        style={{
                          color: isSelected ? formData.primaryColor : '#9CA3AF',
                        }}
                      />
                      <h3
                        className={`font-medium`}
                        style={{
                          color: isSelected ? formData.primaryColor : undefined,
                        }}
                      >
                        {theme.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {theme.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>{' '}
          {/* Theme Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Preview
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Light Theme Preview */}
              <div
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                  formData.mode === 'light'
                    ? 'ring-2 ring-opacity-50'
                    : 'border-gray-200'
                }`}
                style={{
                  borderColor:
                    formData.mode === 'light'
                      ? formData.primaryColor
                      : undefined,
                  '--tw-ring-color':
                    formData.mode === 'light'
                      ? `${formData.primaryColor}40`
                      : undefined,
                }}
              >
                <div className="bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">
                      Light Theme
                    </span>
                    <div
                      className="w-3 h-3 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor:
                          formData.mode === 'light' ||
                          formData.mode === 'system'
                            ? formData.primaryColor
                            : '#D1D5DB',
                      }}
                    ></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <div
                      className="h-6 rounded w-16 transition-all duration-200"
                      style={{ backgroundColor: formData.primaryColor }}
                    ></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                  {formData.mode === 'light' && (
                    <div className="absolute top-2 right-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        <svg
                          className="w-2 h-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dark Theme Preview */}
              <div
                className={`relative border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                  formData.mode === 'dark'
                    ? 'ring-2 ring-opacity-50'
                    : 'border-gray-600'
                }`}
                style={{
                  borderColor:
                    formData.mode === 'dark'
                      ? formData.primaryColor
                      : undefined,
                  '--tw-ring-color':
                    formData.mode === 'dark'
                      ? `${formData.primaryColor}40`
                      : undefined,
                }}
              >
                <div className="bg-gray-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">
                      Dark Theme
                    </span>
                    <div
                      className="w-3 h-3 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor:
                          formData.mode === 'dark' || formData.mode === 'system'
                            ? formData.primaryColor
                            : '#6B7280',
                      }}
                    ></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded-full"></div>
                    <div className="h-3 bg-gray-600 rounded-full w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded-full w-1/2"></div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <div
                      className="h-6 rounded w-16 transition-all duration-200"
                      style={{ backgroundColor: formData.primaryColor }}
                    ></div>
                    <div className="h-6 bg-gray-600 rounded w-12"></div>
                  </div>
                  {formData.mode === 'dark' && (
                    <div className="absolute top-2 right-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        <svg
                          className="w-2 h-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Primary Color
            </label>{' '}
            {/* Color Picker Input */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  disabled={isUpdating}
                  className={`w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Choose primary color"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Custom Color
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.primaryColor.toUpperCase()}
                </p>
              </div>
            </div>
            {/* Color Suggestions */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {' '}
                {colorSuggestions.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorChange(color)}
                    disabled={isUpdating}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                      formData.primaryColor === color
                        ? 'border-gray-400 dark:border-gray-500 ring-2 ring-gray-300 dark:ring-gray-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            {/* Color Preview Card */}{' '}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-lg"
                  style={{ backgroundColor: formData.primaryColor }}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Selected Color
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.primaryColor.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This color will be used for buttons, links, and accents
                  </p>
                </div>
              </div>{' '}
            </div>{' '}
          </div>
        </div>
        {/* Loading overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Updating appearance settings...
              </span>
            </div>
          </div>
        )}{' '}
      </CardWrapper>
    );
  },
);

export default AppearanceSettingsForm;
