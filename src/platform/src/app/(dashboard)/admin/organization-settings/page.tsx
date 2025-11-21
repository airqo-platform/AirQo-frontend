'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
} from '@airqo/icons-react';
import { Card, LoadingSpinner } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { HexColorPicker } from 'react-colorful';
import { useUser } from '@/shared/hooks/useUser';
import {
  useGroupTheme,
  useUpdateOrganizationGroupTheme,
} from '@/shared/hooks/usePreferences';
import { Tooltip } from 'flowbite-react';
import SettingsLayout from '@/modules/user-profile/components/SettingsLayout';
import { AdminPageGuard } from '@/shared/components';
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
      toast.error('Failed to update theme', errorMessage);
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
          <LoadingSpinner size={32} />
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
        {/* Primary Color */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Primary Color
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
            {presetColors.map(color => (
              <Tooltip
                key={color.value}
                content={color.name}
                className="bg-black"
              >
                <button
                  onClick={() =>
                    updateDraftTheme({ primaryColor: color.value })
                  }
                  disabled={isUpdatingTheme}
                  className={`w-10 h-10 rounded-md border-2 transition-all ${
                    displayTheme.primaryColor === color.value
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Select ${color.name} color`}
                />
              </Tooltip>
            ))}
            <Tooltip content="Custom color" className="bg-black">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={isUpdatingTheme}
                className={`w-10 h-10 rounded-md border-2 transition-all flex items-center justify-center ${
                  showColorPicker
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Open custom color picker"
              >
                <AqPalette size={16} />
              </button>
            </Tooltip>
          </div>

          {showColorPicker && (
            <Card className="p-3 mb-3">
              <HexColorPicker
                color={customColor}
                onChange={setCustomColor}
                className="w-full"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => {
                    updateDraftTheme({ primaryColor: customColor });
                    setShowColorPicker(false);
                  }}
                  disabled={isUpdatingTheme}
                  size="sm"
                  Icon={AqPalette}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => setShowColorPicker(false)}
                  variant="outlined"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Theme Mode */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Theme Mode
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light' as const, label: 'Light', icon: AqSun },
              { value: 'dark' as const, label: 'Dark', icon: AqMoon02 },
              { value: 'system' as const, label: 'System', icon: AqMonitor01 },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateDraftTheme({ mode: value })}
                disabled={isUpdatingTheme}
                className={`p-3 rounded-lg border-2 transition-all ${
                  displayTheme.mode === value
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interface Style */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Interface Style
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'default' as const, label: 'Default', icon: AqDotsGrid },
              { value: 'bordered' as const, label: 'Bordered', icon: AqGrid01 },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateDraftTheme({ interfaceStyle: value })}
                disabled={isUpdatingTheme}
                className={`p-3 rounded-lg border-2 transition-all ${
                  displayTheme.interfaceStyle === value
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Content Layout
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: 'compact' as const,
                label: 'Compact',
                icon: AqLayoutGrid01,
              },
              { value: 'wide' as const, label: 'Wide', icon: AqLayoutGrid02 },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateDraftTheme({ contentLayout: value })}
                disabled={isUpdatingTheme}
                className={`p-3 rounded-lg border-2 transition-all ${
                  displayTheme.contentLayout === value
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${isUpdatingTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Live Preview
          </h3>
          <Card className="p-6">
            <div className="space-y-6">
              {/* Color Preview */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Primary Color
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-3 py-1.5 text-sm font-medium rounded-md text-white transition-all"
                    style={{
                      backgroundColor: displayTheme.primaryColor,
                      borderColor: displayTheme.primaryColor,
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all"
                    style={{
                      color: displayTheme.primaryColor,
                      borderColor: displayTheme.primaryColor,
                      backgroundColor: 'transparent',
                    }}
                  >
                    Secondary Button
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                    style={{
                      color: displayTheme.primaryColor,
                      backgroundColor: 'transparent',
                    }}
                  >
                    Ghost Button
                  </button>
                </div>
              </div>

              {/* Layout Preview */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Content Layout
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {displayTheme.contentLayout === 'wide'
                        ? 'Wide Layout (max-w-7xl)'
                        : 'Compact Layout (max-w-5xl)'}
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                      {/* Container showing the layout width difference */}
                      <div
                        className={`mx-auto transition-all duration-300 ${
                          displayTheme.contentLayout === 'wide'
                            ? 'max-w-7xl'
                            : 'max-w-5xl'
                        }`}
                        style={{
                          backgroundColor:
                            displayTheme.mode === 'dark'
                              ? '#1f2937'
                              : '#ffffff',
                        }}
                      >
                        <div className="px-4 py-6 md:px-6 lg:px-8">
                          <div className="flex items-center justify-between mb-4">
                            <h5
                              className={`text-lg font-medium ${
                                displayTheme.mode === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              Page Content Area
                            </h5>
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1.5 text-sm font-medium rounded-md text-white transition-all"
                                style={{
                                  backgroundColor: displayTheme.primaryColor,
                                  borderColor: displayTheme.primaryColor,
                                }}
                              >
                                Action
                              </button>
                            </div>
                          </div>

                          {/* Content grid showing the layout difference */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div
                              className={`p-4 rounded-lg border ${
                                displayTheme.interfaceStyle === 'bordered'
                                  ? displayTheme.mode === 'dark'
                                    ? 'border-gray-600 bg-gray-800'
                                    : 'border-gray-200 bg-gray-50'
                                  : displayTheme.mode === 'dark'
                                    ? 'border-transparent bg-gray-800'
                                    : 'border-transparent bg-gray-50'
                              }`}
                            >
                              <h6
                                className={`text-sm font-medium mb-2 ${
                                  displayTheme.mode === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                Content Block 1
                              </h6>
                              <p
                                className={`text-xs ${
                                  displayTheme.mode === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-600'
                                }`}
                              >
                                Sample content showing layout width differences.
                              </p>
                            </div>

                            <div
                              className={`p-4 rounded-lg border ${
                                displayTheme.interfaceStyle === 'bordered'
                                  ? displayTheme.mode === 'dark'
                                    ? 'border-gray-600 bg-gray-800'
                                    : 'border-gray-200 bg-gray-50'
                                  : displayTheme.mode === 'dark'
                                    ? 'border-transparent bg-gray-800'
                                    : 'border-transparent bg-gray-50'
                              }`}
                            >
                              <h6
                                className={`text-sm font-medium mb-2 ${
                                  displayTheme.mode === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                Content Block 2
                              </h6>
                              <p
                                className={`text-xs ${
                                  displayTheme.mode === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-600'
                                }`}
                              >
                                Notice how the container width changes between
                                compact and wide.
                              </p>
                            </div>

                            <div
                              className={`p-4 rounded-lg border ${
                                displayTheme.interfaceStyle === 'bordered'
                                  ? displayTheme.mode === 'dark'
                                    ? 'border-gray-600 bg-gray-800'
                                    : 'border-gray-200 bg-gray-50'
                                  : displayTheme.mode === 'dark'
                                    ? 'border-transparent bg-gray-800'
                                    : 'border-transparent bg-gray-50'
                              }`}
                            >
                              <h6
                                className={`text-sm font-medium mb-2 ${
                                  displayTheme.mode === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                Content Block 3
                              </h6>
                              <p
                                className={`text-xs ${
                                  displayTheme.mode === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-600'
                                }`}
                              >
                                The max-width constraint affects the overall
                                page layout.
                              </p>
                            </div>
                          </div>

                          {/* Action buttons at bottom */}
                          <div className="flex gap-3 justify-end">
                            <button
                              className="px-4 py-2 text-sm font-medium rounded-md border transition-all"
                              style={{
                                color: displayTheme.primaryColor,
                                borderColor: displayTheme.primaryColor,
                                backgroundColor: 'transparent',
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 text-sm font-medium rounded-md text-white transition-all"
                              style={{
                                backgroundColor: displayTheme.primaryColor,
                                borderColor: displayTheme.primaryColor,
                              }}
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Mode Preview */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Theme Mode: {displayTheme.mode}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-white text-gray-900">
                    <div className="flex items-center gap-2 mb-3">
                      <AqSun size={16} />
                      <span className="text-xs font-medium">Light Mode</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Dashboard</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={{ color: '#374151' }}
                        >
                          Settings
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="h-2 bg-gray-300 rounded mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="h-2 bg-gray-300 rounded mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: displayTheme.primaryColor,
                            borderColor: displayTheme.primaryColor,
                            color: 'white',
                          }}
                        >
                          Primary Action
                        </Button>
                        <Button size="sm" variant="outlined">
                          Secondary
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-900 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <AqMoon02 size={16} />
                      <span className="text-xs font-medium">Dark Mode</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Dashboard</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          style={{ color: '#ffffff' }}
                        >
                          Settings
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <div className="h-2 bg-gray-600 rounded mb-2"></div>
                          <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                          <div className="h-2 bg-gray-600 rounded mb-2"></div>
                          <div className="h-2 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 text-sm font-medium rounded-md text-white transition-all"
                          style={{
                            backgroundColor: displayTheme.primaryColor,
                            borderColor: displayTheme.primaryColor,
                          }}
                        >
                          Primary Action
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm font-medium rounded-md border transition-all"
                          style={{
                            color: displayTheme.primaryColor,
                            borderColor: displayTheme.primaryColor,
                            backgroundColor: 'transparent',
                          }}
                        >
                          Secondary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interface Style Preview */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Interface Style: {displayTheme.interfaceStyle}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-white text-gray-900">
                    <h5 className="text-sm font-medium mb-3">Default Style</h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded">
                        <h6 className="text-xs font-medium mb-1 text-gray-900">
                          Card Title
                        </h6>
                        <p className="text-xs text-gray-600">
                          Content without visible borders
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <h6 className="text-xs font-medium mb-1 text-gray-900">
                          Another Card
                        </h6>
                        <p className="text-xs text-gray-600">
                          More content here
                        </p>
                      </div>
                      <button
                        className="px-3 py-1.5 text-sm font-medium rounded-md text-white transition-all"
                        style={{
                          backgroundColor: displayTheme.primaryColor,
                          borderColor: displayTheme.primaryColor,
                        }}
                      >
                        Action Button
                      </button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-900 text-white">
                    <h5 className="text-sm font-medium mb-3">Bordered Style</h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-800 border border-gray-700 rounded">
                        <h6 className="text-xs font-medium mb-1 text-white">
                          Card Title
                        </h6>
                        <p className="text-xs text-gray-300">
                          Content with visible borders
                        </p>
                      </div>
                      <div className="p-3 bg-gray-800 border border-gray-700 rounded">
                        <h6 className="text-xs font-medium mb-1 text-white">
                          Another Card
                        </h6>
                        <p className="text-xs text-gray-300">
                          More bordered content
                        </p>
                      </div>
                      <button
                        className="px-3 py-1.5 text-sm font-medium rounded-md text-white transition-all"
                        style={{
                          backgroundColor: displayTheme.primaryColor,
                          borderColor: displayTheme.primaryColor,
                        }}
                      >
                        Action Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button
            onClick={handleSaveChanges}
            disabled={isUpdatingTheme || !hasUnsavedChanges}
            loading={isUpdatingTheme}
            size="sm"
            Icon={AqCheck}
          >
            {isUpdatingTheme ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={resetToDefaults}
            disabled={isUpdatingTheme}
            variant="outlined"
            size="sm"
            Icon={AqRefreshCcw02}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
};
const AdminSettingsPage: React.FC = () => {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState(0);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size={48} className="mx-auto mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 0,
      title: 'Theme',
      component: () => <ThemeSettings />,
    },
  ];

  return (
    <AdminPageGuard requiredPermissionsInActiveGroup={['GROUP_MANAGEMENT']}>
      <div>
        {/* Tab Navigation */}
        <Card className="mb-6">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                } cursor-pointer`}
              >
                <span className="flex gap-2 items-center">
                  <AqPalette size={16} />
                  {tab.title}
                </span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Tab Content */}
        <div>{tabs.find(tab => tab.id === activeTab)?.component?.()}</div>
      </div>
    </AdminPageGuard>
  );
};

export default AdminSettingsPage;
