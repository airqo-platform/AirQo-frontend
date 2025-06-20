import React from 'react';
import { FaPalette, FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import CardWrapper from '@/common/components/CardWrapper';

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

const AppearanceSettingsForm = ({ appearanceData, onAppearanceChange }) => {
  // Default to blue if no color is set
  const currentColor = appearanceData.primaryColor || '#3B82F6';

  const handleColorChange = (color) => {
    onAppearanceChange('primaryColor', color);
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
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((theme) => {
              const Icon = theme.icon;
              const isSelected = appearanceData.theme === theme.value;

              return (
                <div
                  key={theme.value}
                  onClick={() => onAppearanceChange('theme', theme.value)}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <Icon
                      className={`w-8 h-8 mb-2 ${isSelected ? 'text-primary' : 'text-gray-400'}`}
                    />
                    <h3
                      className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'}`}
                    >
                      {theme.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {theme.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
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
        </div>

        {/* Theme Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Preview
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Light Theme Preview */}
            <div className="relative border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">
                    Light Theme
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        appearanceData.theme === 'light'
                          ? currentColor
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
                    className="h-6 rounded w-16"
                    style={{ backgroundColor: currentColor }}
                  ></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>

            {/* Dark Theme Preview */}
            <div className="relative border border-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">
                    Dark Theme
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        appearanceData.theme === 'dark'
                          ? currentColor
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
                    className="h-6 rounded w-16"
                    style={{ backgroundColor: currentColor }}
                  ></div>
                  <div className="h-6 bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Primary Color
          </label>
          {/* Color Picker Input */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
                title="Choose primary color"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Custom Color
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentColor.toUpperCase()}
              </p>
            </div>
          </div>
          {/* Color Suggestions */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Quick suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              {colorSuggestions.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    currentColor === color
                      ? 'border-gray-400 dark:border-gray-500 ring-2 ring-gray-300 dark:ring-gray-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          {/* Color Preview Card */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-lg"
                style={{ backgroundColor: currentColor }}
              ></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Selected Color
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentColor.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This color will be used for buttons, links, and accents
                </p>
              </div>
            </div>
          </div>{' '}
        </div>
      </div>
    </CardWrapper>
  );
};

export default AppearanceSettingsForm;
