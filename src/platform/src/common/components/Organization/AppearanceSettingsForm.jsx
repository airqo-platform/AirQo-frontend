import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  AqPalette,
  AqSun,
  AqMoon02,
  AqExpand06,
  AqMonitor01,
  AqMinimize02,
} from '@airqo/icons-react';
import { useDispatch } from 'react-redux';
import CardWrapper from '@/common/components/CardWrapper';
import NotificationService from '@/core/utils/notificationService';
import { useOrganizationTheme } from '@/core/hooks/useOrganizationTheme';
import { setOrganizationTheme } from '@/lib/store/services/organizationTheme/OrganizationThemeSlice';
import AppearanceSettingsFormSkeleton from './AppearanceSettingsFormSkeleton';
import logger from '@/lib/logger';

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    icon: AqSun,
    description: 'Clean, bright interface',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: AqMoon02,
    description: 'Easy on the eyes',
  },
  {
    value: 'system',
    label: 'System',
    icon: AqMonitor01,
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
  (
    {
      onAppearanceChange = () => {},
      onSave = () => {},
      onUnsavedChanges = () => {},
    },
    ref,
  ) => {
    const dispatch = useDispatch();
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

    // Track if there are unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const handleSave = async () => {
      try {
        const updatedTheme = await updateTheme(formData);

        // Ensure we have proper data format for Redux
        const themeDataForRedux =
          updatedTheme?.data || updatedTheme || formData;
        const formattedThemeData = {
          primaryColor: themeDataForRedux.primaryColor || formData.primaryColor,
          mode: themeDataForRedux.mode || formData.mode,
          interfaceStyle:
            themeDataForRedux.interfaceStyle || formData.interfaceStyle,
          contentLayout:
            themeDataForRedux.contentLayout || formData.contentLayout,
        };

        // Store organization theme in Redux after successful update
        dispatch(setOrganizationTheme(formattedThemeData));
        NotificationService.success(
          201,
          'Appearance settings updated successfully',
        );

        // Reset unsaved changes after successful save
        setHasUnsavedChanges(false);
        onUnsavedChanges(false);

        onSave(); // Call parent save handler
      } catch (error) {
        NotificationService.handleApiError(
          error,
          'Failed to update appearance settings',
        );
      }
    }; // Expose handleSave, isUpdating, and hasUnsavedChanges to parent component - MUST be before any conditional returns
    useImperativeHandle(ref, () => ({
      handleSave,
      isUpdating,
      hasUnsavedChanges,
    })); // Update form data when theme data is loaded (only once)
    useEffect(() => {
      if (themeData && !isInitialized) {
        const formattedData = {
          primaryColor: themeData.primaryColor || '#3B82F6',
          mode: themeData.mode || 'light',
          interfaceStyle: themeData.interfaceStyle || 'bordered',
          contentLayout: themeData.contentLayout || 'compact',
        };

        if (process.env.NODE_ENV === 'development') {
          logger.debug(
            'Loading theme data in AppearanceSettingsForm:',
            formattedData,
          );
        }

        setFormData(formattedData);
        setIsInitialized(true);

        // Store organization theme in Redux for use in other parts of the app
        dispatch(setOrganizationTheme(formattedData));
      }
    }, [themeData, dispatch, isInitialized]);

    // Update Redux when hasActiveGroup changes (only if not initialized yet)
    useEffect(() => {
      if (hasActiveGroup && themeData && !isInitialized) {
        const formattedData = {
          primaryColor: themeData.primaryColor || '#3B82F6',
          mode: themeData.mode || 'light',
          interfaceStyle: themeData.interfaceStyle || 'bordered',
          contentLayout: themeData.contentLayout || 'compact',
        };

        if (process.env.NODE_ENV === 'development') {
          logger.debug(
            'Updating Redux on hasActiveGroup change:',
            formattedData,
          );
        }

        dispatch(setOrganizationTheme(formattedData));
      }
    }, [hasActiveGroup, themeData, dispatch, isInitialized]);

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
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Changing ${field} to:`, value);
      }

      setFormData((prev) => {
        const newData = {
          ...prev,
          [field]: value,
        };

        if (process.env.NODE_ENV === 'development') {
          logger.debug('New formData:', newData);
        }

        return newData;
      });

      // Mark as having unsaved changes
      setHasUnsavedChanges(true);
      onUnsavedChanges(true);

      // Call the parent callback for backward compatibility
      onAppearanceChange(field, value);
    };

    const handleColorChange = (color) => {
      handleFieldChange('primaryColor', color);
    };

    return (
      <CardWrapper>
        <div className="space-y-6">
          {/* Compact Header */}
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{
              background: `linear-gradient(135deg, ${formData.primaryColor}15 0%, ${formData.primaryColor}05 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <div
                    className="p-2 rounded-lg mr-3"
                    style={{ backgroundColor: `${formData.primaryColor}20` }}
                  >
                    <AqPalette
                      className="text-lg"
                      style={{ color: formData.primaryColor }}
                    />
                  </div>
                  Appearance Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Customize your organization&apos;s visual identity
                </p>
              </div>
            </div>
          </div>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Settings */}
            <div className="space-y-6">
              {/* Primary Color */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-left">
                  Primary Color
                </h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                    title="Choose primary color"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.primaryColor.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Brand color
                    </p>
                  </div>
                </div>

                {/* Color Suggestions */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-left">
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colorSuggestions.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorChange(color)}
                        className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
                          formData.primaryColor === color
                            ? 'border-gray-400 dark:border-gray-500 ring-2 ring-gray-300 dark:ring-gray-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Theme Mode */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-left">
                  Theme Mode
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((theme) => {
                    const Icon = theme.icon;
                    const isSelected = formData.mode === theme.value;

                    return (
                      <button
                        key={theme.value}
                        onClick={() => handleFieldChange('mode', theme.value)}
                        className={`
                          flex flex-col items-center p-3 rounded-lg transition-all duration-200
                          ${
                            isSelected
                              ? 'shadow-md ring-2 ring-opacity-30'
                              : 'shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700'
                          }
                        `}
                        style={{
                          backgroundColor: isSelected
                            ? `${formData.primaryColor}10`
                            : undefined,
                          borderColor: isSelected
                            ? formData.primaryColor
                            : undefined,
                          '--tw-ring-color': isSelected
                            ? `${formData.primaryColor}30`
                            : undefined,
                        }}
                      >
                        <Icon
                          className="w-5 h-5 mb-1"
                          style={{
                            color: isSelected
                              ? formData.primaryColor
                              : '#6b7280',
                          }}
                        />
                        <span
                          className={`text-xs font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                          {theme.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Interface Style */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-left">
                  Interface Style
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['bordered', 'default'].map((style) => (
                    <button
                      key={style}
                      onClick={() => handleFieldChange('interfaceStyle', style)}
                      className={`
                        p-3 rounded-lg transition-all duration-200 text-left
                        ${
                          formData.interfaceStyle === style
                            ? 'shadow-md ring-2 ring-opacity-30'
                            : 'shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700'
                        }
                      `}
                      style={{
                        backgroundColor:
                          formData.interfaceStyle === style
                            ? `${formData.primaryColor}10`
                            : undefined,
                        borderColor:
                          formData.interfaceStyle === style
                            ? formData.primaryColor
                            : undefined,
                        '--tw-ring-color':
                          formData.interfaceStyle === style
                            ? `${formData.primaryColor}30`
                            : undefined,
                      }}
                    >
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white capitalize">
                        {style}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {style === 'bordered'
                          ? 'Enhanced borders'
                          : 'Clean minimal'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>{' '}
              {/* Content Layout */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-left">
                  Content Layout
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'compact', label: 'Compact', icon: AqMinimize02 },
                    {
                      value: 'wide',
                      label: 'Wide',
                      icon: AqExpand06,
                    },
                  ].map((layout) => (
                    <button
                      key={layout.value}
                      onClick={() =>
                        handleFieldChange('contentLayout', layout.value)
                      }
                      className={`
                        flex flex-col items-center p-3 rounded-lg transition-all duration-200
                        ${
                          formData.contentLayout === layout.value
                            ? 'shadow-md ring-2 ring-opacity-30'
                            : 'shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700'
                        }
                      `}
                      style={{
                        backgroundColor:
                          formData.contentLayout === layout.value
                            ? `${formData.primaryColor}10`
                            : undefined,
                        borderColor:
                          formData.contentLayout === layout.value
                            ? formData.primaryColor
                            : undefined,
                        '--tw-ring-color':
                          formData.contentLayout === layout.value
                            ? `${formData.primaryColor}30`
                            : undefined,
                      }}
                    >
                      <layout.icon
                        className="w-5 h-5 mb-1"
                        style={{
                          color:
                            formData.contentLayout === layout.value
                              ? formData.primaryColor
                              : '#6b7280',
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {layout.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>{' '}
            {/* Right Column: Live Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-left">
                Live Preview
              </h3>
              <div className="space-y-4">
                {/* Light Theme Preview */}
                <div
                  className={`
                    relative overflow-hidden rounded-lg transition-all duration-200
                    ${formData.mode === 'light' || formData.mode === 'system' ? 'ring-2 ring-opacity-30' : ''}
                    ${formData.interfaceStyle === 'bordered' ? 'border-2' : 'border border-gray-200 dark:border-gray-700'}
                  `}
                  style={{
                    borderColor:
                      formData.mode === 'light' || formData.mode === 'system'
                        ? formData.primaryColor
                        : formData.interfaceStyle === 'bordered'
                          ? '#d1d5db'
                          : undefined,
                    '--tw-ring-color':
                      formData.mode === 'light' || formData.mode === 'system'
                        ? `${formData.primaryColor}30`
                        : undefined,
                  }}
                >
                  <div className="bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          Light Mode
                        </span>
                      </div>
                      {(formData.mode === 'light' ||
                        formData.mode === 'system') && (
                        <div
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          Active
                        </div>
                      )}
                    </div>

                    {/* Content Layout Preview */}
                    <div
                      className={`space-y-3 transition-all duration-200 ${
                        formData.contentLayout === 'wide'
                          ? 'w-full'
                          : 'max-w-[280px] mx-auto'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between p-2 bg-gray-50 rounded ${
                          formData.interfaceStyle === 'bordered'
                            ? 'border border-gray-200'
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded bg-gray-200"></div>
                          <div className="h-2 bg-gray-300 rounded w-16"></div>
                        </div>
                        <div
                          className="h-4 w-12 rounded"
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>

                      <div className="flex space-x-2">
                        <div
                          className={`h-6 w-16 rounded ${
                            formData.interfaceStyle === 'bordered'
                              ? 'border border-gray-200'
                              : ''
                          }`}
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                        <div
                          className={`h-6 w-12 bg-gray-200 rounded ${
                            formData.interfaceStyle === 'bordered'
                              ? 'border border-gray-300'
                              : ''
                          }`}
                        ></div>
                      </div>

                      {/* Layout indicator */}
                      <div className="text-center">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formData.contentLayout === 'wide'
                            ? 'Wide Layout'
                            : 'Compact Layout'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark Theme Preview */}
                <div
                  className={`
                    relative overflow-hidden rounded-lg transition-all duration-200
                    ${formData.mode === 'dark' || formData.mode === 'system' ? 'ring-2 ring-opacity-30' : ''}
                    ${formData.interfaceStyle === 'bordered' ? 'border-2 border-gray-600' : 'border border-gray-600'}
                  `}
                  style={{
                    borderColor:
                      formData.mode === 'dark' || formData.mode === 'system'
                        ? formData.primaryColor
                        : formData.interfaceStyle === 'bordered'
                          ? '#4b5563'
                          : undefined,
                    '--tw-ring-color':
                      formData.mode === 'dark' || formData.mode === 'system'
                        ? `${formData.primaryColor}30`
                        : undefined,
                  }}
                >
                  <div className="bg-gray-900 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                        <span className="text-sm font-medium text-white">
                          Dark Mode
                        </span>
                      </div>
                      {(formData.mode === 'dark' ||
                        formData.mode === 'system') && (
                        <div
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          Active
                        </div>
                      )}
                    </div>

                    {/* Content Layout Preview */}
                    <div
                      className={`space-y-3 transition-all duration-200 ${
                        formData.contentLayout === 'wide'
                          ? 'w-full'
                          : 'max-w-[280px] mx-auto'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between p-2 bg-gray-800 rounded ${
                          formData.interfaceStyle === 'bordered'
                            ? 'border border-gray-600'
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded bg-gray-700"></div>
                          <div className="h-2 bg-gray-600 rounded w-16"></div>
                        </div>
                        <div
                          className="h-4 w-12 rounded"
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-2 bg-gray-700 rounded w-full"></div>
                        <div className="h-2 bg-gray-800 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      </div>

                      <div className="flex space-x-2">
                        <div
                          className={`h-6 w-16 rounded ${
                            formData.interfaceStyle === 'bordered'
                              ? 'border border-gray-600'
                              : ''
                          }`}
                          style={{ backgroundColor: formData.primaryColor }}
                        ></div>
                        <div
                          className={`h-6 w-12 bg-gray-700 rounded ${
                            formData.interfaceStyle === 'bordered'
                              ? 'border border-gray-600'
                              : ''
                          }`}
                        ></div>
                      </div>

                      {/* Layout indicator */}
                      <div className="text-center">
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {formData.contentLayout === 'wide'
                            ? 'Wide Layout'
                            : 'Compact Layout'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>{' '}
          {/* Compact Summary */}
          <div
            className="relative overflow-hidden rounded-lg p-4"
            style={{
              background: `linear-gradient(135deg, ${formData.primaryColor}10 0%, ${formData.primaryColor}05 50%, transparent 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${formData.primaryColor}20` }}
                >
                  <AqPalette
                    className="text-sm"
                    style={{ color: formData.primaryColor }}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Current Configuration
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formData.primaryColor.toUpperCase()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formData.mode.charAt(0).toUpperCase() +
                        formData.mode.slice(1)}{' '}
                      Mode
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formData.interfaceStyle.charAt(0).toUpperCase() +
                        formData.interfaceStyle.slice(1)}{' '}
                      Style
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formData.contentLayout.charAt(0).toUpperCase() +
                        formData.contentLayout.slice(1)}{' '}
                      Layout
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  },
);

AppearanceSettingsForm.displayName = 'AppearanceSettingsForm';

export default AppearanceSettingsForm;
