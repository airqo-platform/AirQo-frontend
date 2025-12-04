'use client';

import React, { useState, useEffect } from 'react';
import {
  AqPalette,
  AqSun,
  AqMoon02,
  AqDotsGrid,
  AqGrid01,
  AqMonitor01,
  AqLayoutGrid01,
  AqLayoutGrid02,
  AqRefreshCcw02,
  AqCheck,
  AqEye,
} from '@airqo/icons-react';
import { Card, LoadingSpinner } from '@/shared/components/ui';
import ReusableDialog from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { HexColorPicker } from 'react-colorful';
import { useUser } from '@/shared/hooks/useUser';
import {
  useGroupTheme,
  useUpdateOrganizationGroupTheme,
} from '@/shared/hooks/usePreferences';
import { Tooltip } from 'flowbite-react';
import SettingsLayout from '@/modules/user-profile/components/SettingsLayout';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

const presetColors = [
  { name: 'Blue', value: '#1649e5' },
  { name: 'Teal', value: '#005757' },
  { name: 'Green', value: '#059669' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Orange', value: '#ea580c' },
];

const ThemeSettings: React.FC = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#1649e5');
  const [showPreview, setShowPreview] = useState(false);
  const { activeGroup } = useUser();
  const { data: groupThemeData, isLoading: isLoadingGroupTheme } =
    useGroupTheme(activeGroup?.id || '');
  const { trigger: updateTheme, isMutating: isUpdatingTheme } =
    useUpdateOrganizationGroupTheme();

  // Draft state for unsaved changes
  const [draftTheme, setDraftTheme] = useState<{
    primaryColor: string;
    mode: 'light' | 'dark' | 'system';
    interfaceStyle: 'default' | 'bordered';
    contentLayout: 'compact' | 'wide';
  } | null>(null);

  const currentTheme = groupThemeData?.success
    ? groupThemeData.data
    : {
        primaryColor: '#1649e5',
        mode: 'light' as const,
        interfaceStyle: 'default' as const,
        contentLayout: 'wide' as const,
      };

  // Initialize draft theme when current theme loads
  useEffect(() => {
    if (groupThemeData?.success && !draftTheme) {
      setDraftTheme(groupThemeData.data);
    }
  }, [groupThemeData, draftTheme]);

  // Get the theme to display (draft if exists, otherwise current)
  const displayTheme = draftTheme || currentTheme;

  useEffect(() => {
    if (displayTheme.primaryColor) {
      setCustomColor(displayTheme.primaryColor);
    }
  }, [displayTheme.primaryColor]);

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    draftTheme && JSON.stringify(draftTheme) !== JSON.stringify(currentTheme);

  const updateDraftTheme = (
    updates: Partial<{
      primaryColor: string;
      mode: 'light' | 'dark' | 'system';
      interfaceStyle: 'default' | 'bordered';
      contentLayout: 'compact' | 'wide';
    }>
  ) => {
    setDraftTheme(prev =>
      prev ? { ...prev, ...updates } : { ...currentTheme, ...updates }
    );
  };

  const handleSaveChanges = async () => {
    if (!activeGroup?.id || !draftTheme) return;

    try {
      await updateTheme({
        groupId: activeGroup.id,
        data: draftTheme,
      });
      // Reset draft after successful save
      setDraftTheme(null);
      toast.success('Theme settings updated successfully');
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error(
        errorMessage
          ? `Failed to update theme: ${errorMessage}`
          : 'Failed to update theme'
      );
      console.error('Failed to update theme:', error);
    }
  };

  const resetToDefaults = () => {
    const defaultTheme = {
      primaryColor: '#1649e5',
      mode: 'light' as const,
      interfaceStyle: 'default' as const,
      contentLayout: 'wide' as const,
    };
    setDraftTheme(defaultTheme);
    setCustomColor('#1649e5');
  };

  if (isLoadingGroupTheme) {
    return (
      <SettingsLayout
        title="Organization Theme Settings"
        description="Customize the appearance and behavior of your organization's interface theme."
      >
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Organization Theme Settings"
      description="Customize the appearance and behavior of your organization's interface theme."
    >
      <div className="space-y-6">
        {/* Reset Button */}
        <div className="flex justify-end">
          <Tooltip
            content="Reset to defaults"
            placement="bottom"
            className="bg-black"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              disabled={isUpdatingTheme}
              className="h-8 w-8 p-0"
              aria-label="Reset to defaults"
            >
              <AqRefreshCcw02 size={14} />
            </Button>
          </Tooltip>
        </div>

        {/* Color Palette */}
        <section>
          <div className="mb-3">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Color Palette
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose your brand color
            </p>
          </div>

          {/* Color Grid: 5 presets + custom button */}
          <div className="grid grid-cols-6 gap-1.5 max-w-xs">
            {presetColors.map(color => (
              <button
                key={color.value}
                className="relative w-8 h-8"
                onClick={() => updateDraftTheme({ primaryColor: color.value })}
                disabled={isUpdatingTheme}
              >
                <div
                  className={`w-full h-full rounded-md transition-all ${
                    displayTheme.primaryColor === color.value
                      ? 'ring-2 ring-offset-1'
                      : 'ring-1 ring-gray-300 dark:ring-gray-600 hover:ring-2'
                  } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    backgroundColor: color.value,
                    ...(displayTheme.primaryColor === color.value && {
                      '--tw-ring-color': displayTheme.primaryColor,
                    }),
                  }}
                />
                {displayTheme.primaryColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke={color.value}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}

            {/* Custom Color Button - Same size as color swatches */}
            <button
              className="relative w-8 h-8"
              onClick={() => setShowColorPicker(!showColorPicker)}
              disabled={isUpdatingTheme}
            >
              <div
                className={`w-full h-full rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary/50 bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-all ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <AqPalette
                  size={12}
                  className="text-gray-500 dark:text-gray-400"
                />
              </div>
            </button>
          </div>

          {/* Color Picker */}
          {showColorPicker && (
            <div className="mt-3">
              <Card className="p-3 space-y-2">
                <HexColorPicker
                  color={customColor}
                  onChange={setCustomColor}
                  style={{ width: '100%', height: '120px' }}
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: customColor }}
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={e => setCustomColor(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                </div>
                <Button
                  onClick={() => {
                    updateDraftTheme({ primaryColor: customColor });
                    setShowColorPicker(false);
                  }}
                  disabled={isUpdatingTheme}
                  size="sm"
                  className="w-full"
                  style={{
                    backgroundColor: displayTheme.primaryColor,
                    borderColor: displayTheme.primaryColor,
                  }}
                >
                  Apply
                </Button>
              </Card>
            </div>
          )}
        </section>

        {/* Appearance */}
        <section>
          <div className="mb-3">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Appearance
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select your preferred theme
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light', label: 'Light', icon: AqSun },
              { value: 'dark', label: 'Dark', icon: AqMoon02 },
              { value: 'system', label: 'Auto', icon: AqMonitor01 },
            ].map(mode => {
              const Icon = mode.icon;
              const isActive = displayTheme.mode === mode.value;
              return (
                <button
                  key={mode.value}
                  className={`flex flex-col items-center gap-2 py-3 rounded-md transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() =>
                    updateDraftTheme({
                      mode: mode.value as 'light' | 'dark' | 'system',
                    })
                  }
                  disabled={isUpdatingTheme}
                  style={
                    isActive
                      ? { backgroundColor: displayTheme.primaryColor }
                      : {}
                  }
                >
                  <Icon size={16} />
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Interface Style */}
        <section>
          <div className="mb-3">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Interface Style
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              How components should look
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                value: 'default',
                label: 'Default',
                description: 'Clean and minimal design',
                icon: AqDotsGrid,
              },
              {
                value: 'bordered',
                label: 'Bordered',
                description: 'Defined boundaries',
                icon: AqGrid01,
              },
            ].map(style => {
              const Icon = style.icon;
              const isActive = displayTheme.interfaceStyle === style.value;
              return (
                <button
                  key={style.value}
                  className={`w-full text-left p-3 rounded-md border-2 transition-all ${
                    isActive
                      ? 'bg-opacity-5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() =>
                    updateDraftTheme({
                      interfaceStyle: style.value as 'default' | 'bordered',
                    })
                  }
                  disabled={isUpdatingTheme}
                  style={
                    isActive
                      ? {
                          borderColor: displayTheme.primaryColor,
                          backgroundColor: displayTheme.primaryColor + '0D', // 5% opacity
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                      <Icon size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {style.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {style.description}
                      </div>
                    </div>
                    {isActive && (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: displayTheme.primaryColor }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Content Layout */}
        <section>
          <div className="mb-3">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Content Layout
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Spacing and density
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                value: 'compact',
                label: 'Compact',
                description: 'Dense, information-rich',
                icon: AqLayoutGrid01,
              },
              {
                value: 'wide',
                label: 'Wide',
                description: 'Spacious and comfortable',
                icon: AqLayoutGrid02,
              },
            ].map(layout => {
              const Icon = layout.icon;
              const isActive = displayTheme.contentLayout === layout.value;
              return (
                <button
                  key={layout.value}
                  className={`w-full text-left p-3 rounded-md border-2 transition-all ${
                    isActive
                      ? 'bg-opacity-5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() =>
                    updateDraftTheme({
                      contentLayout: layout.value as 'compact' | 'wide',
                    })
                  }
                  disabled={isUpdatingTheme}
                  style={
                    isActive
                      ? {
                          borderColor: displayTheme.primaryColor,
                          backgroundColor: displayTheme.primaryColor + '0D', // 5% opacity
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                      <Icon size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {layout.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {layout.description}
                      </div>
                    </div>
                    {isActive && (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: displayTheme.primaryColor }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button
            onClick={handleSaveChanges}
            disabled={isUpdatingTheme || !hasUnsavedChanges}
            loading={isUpdatingTheme}
            Icon={AqCheck}
            className="bg-primary text-white border-primary hover:bg-primary/90"
          >
            {isUpdatingTheme ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={() => setShowPreview(true)}
            disabled={isUpdatingTheme}
            variant="outlined"
            Icon={AqEye}
            style={{
              borderColor: displayTheme.primaryColor,
              color: displayTheme.primaryColor,
            }}
          >
            Preview Changes
          </Button>
        </div>

        {/* Preview Dialog */}
        <ReusableDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Theme Preview"
          subtitle="See how your organization's theme will look"
          icon={AqEye}
          iconColor={displayTheme.primaryColor}
          size="xl"
          maxHeight="max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh]"
          primaryAction={{
            label: 'Apply Changes',
            onClick: () => {
              handleSaveChanges();
              setShowPreview(false);
            },
            disabled: isUpdatingTheme || !hasUnsavedChanges,
            className: 'text-white',
          }}
          secondaryAction={{
            label: 'Close',
            onClick: () => setShowPreview(false),
            variant: 'outlined',
          }}
        >
          <div className="space-y-4">
            {/* Color Showcase */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Primary Color
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-3 py-1.5 text-xs font-medium rounded-md text-white"
                  style={{
                    backgroundColor: displayTheme.primaryColor,
                  }}
                >
                  Primary
                </button>
                <button
                  className="px-3 py-1.5 text-xs font-medium rounded-md border"
                  style={{
                    color: displayTheme.primaryColor,
                    borderColor: displayTheme.primaryColor,
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>

            {/* Layout Demonstration */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Content Layout: {displayTheme.contentLayout}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                <div
                  className={`mx-auto bg-white dark:bg-gray-700 p-3 rounded shadow-sm`}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {displayTheme.contentLayout === 'wide'
                      ? 'Wide Layout (more spacious)'
                      : 'Compact Layout (denser)'}
                  </div>
                  <div
                    className={`grid gap-2 ${
                      displayTheme.contentLayout === 'wide'
                        ? 'grid-cols-2'
                        : 'grid-cols-1'
                    }`}
                  >
                    {Array.from({
                      length: displayTheme.contentLayout === 'wide' ? 2 : 1,
                    }).map((_, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded ${
                          displayTheme.interfaceStyle === 'bordered'
                            ? 'border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                            : 'bg-gray-100 dark:bg-gray-600'
                        }`}
                      >
                        <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-400 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interface Style Demo */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Interface Style: {displayTheme.interfaceStyle}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-2 rounded text-xs ${
                    displayTheme.interfaceStyle === 'bordered'
                      ? 'border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Sample Card
                </div>
                <div
                  className={`p-2 rounded text-xs ${
                    displayTheme.interfaceStyle === 'bordered'
                      ? 'border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Another Card
                </div>
              </div>
            </div>

            {/* Theme Mode Demo */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Theme Mode: {displayTheme.mode}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white border rounded text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <AqSun size={12} className="text-yellow-500" />
                    <span className="font-medium">Light</span>
                  </div>
                  Bright interface
                </div>
                <div className="p-2 bg-gray-900 border border-gray-700 rounded text-xs text-white">
                  <div className="flex items-center gap-1 mb-1">
                    <AqMoon02 size={12} className="text-blue-400" />
                    <span className="font-medium">Dark</span>
                  </div>
                  Easy on eyes
                </div>
              </div>
            </div>

            {/* Theme Settings Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Configuration
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Color:
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <div
                      className="w-2 h-2 rounded"
                      style={{ backgroundColor: displayTheme.primaryColor }}
                    />
                    <span className="font-mono text-xs">
                      {displayTheme.primaryColor}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Mode:
                  </span>
                  <p className="mt-1 font-medium capitalize">
                    {displayTheme.mode}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Interface:
                  </span>
                  <p className="mt-1 font-medium capitalize">
                    {displayTheme.interfaceStyle}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Layout:
                  </span>
                  <p className="mt-1 font-medium capitalize">
                    {displayTheme.contentLayout}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ReusableDialog>
      </div>
    </SettingsLayout>
  );
};

export default ThemeSettings;
