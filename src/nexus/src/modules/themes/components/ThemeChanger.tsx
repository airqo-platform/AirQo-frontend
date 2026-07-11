'use client';

import { useTheme } from '@/modules/themes/hooks/useTheme';
import { Button } from '@/shared/components/ui/button';

const ThemeChanger = () => {
  const { theme, updateThemeMode, updatePrimaryColor, isLoading, error } =
    useTheme();

  const handleThemeChange = async (newMode: 'light' | 'dark' | 'system') => {
    try {
      await updateThemeMode(newMode);
    } catch (err) {
      console.error('Failed to update theme mode:', err);
    }
  };

  const handlePrimaryColorChange = async (color: string) => {
    try {
      await updatePrimaryColor(color);
    } catch (err) {
      console.error('Failed to update primary color:', err);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg">Theme</h3>
        <div className="flex gap-2">
          <Button
            variant={theme.mode === 'light' ? 'filled' : 'outlined'}
            onClick={() => handleThemeChange('light')}
            disabled={isLoading}
          >
            Light
          </Button>
          <Button
            variant={theme.mode === 'dark' ? 'filled' : 'outlined'}
            onClick={() => handleThemeChange('dark')}
            disabled={isLoading}
          >
            Dark
          </Button>
          <Button
            variant={theme.mode === 'system' ? 'filled' : 'outlined'}
            onClick={() => handleThemeChange('system')}
            disabled={isLoading}
          >
            System
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-lg">Primary Color</h3>
        <div className="flex gap-2">
          <button
            className="w-8 h-8 rounded-full border-2 border-gray-300 disabled:opacity-50"
            style={{ backgroundColor: '#1649e5' }}
            onClick={() => handlePrimaryColorChange('#1649e5')}
            disabled={isLoading}
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-gray-300 disabled:opacity-50"
            style={{ backgroundColor: '#10b981' }}
            onClick={() => handlePrimaryColorChange('#10b981')}
            disabled={isLoading}
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-gray-300 disabled:opacity-50"
            style={{ backgroundColor: '#f59e0b' }}
            onClick={() => handlePrimaryColorChange('#f59e0b')}
            disabled={isLoading}
          />
          <button
            className="w-8 h-8 rounded-full border-2 border-gray-300 disabled:opacity-50"
            style={{ backgroundColor: '#ef4444' }}
            onClick={() => handlePrimaryColorChange('#ef4444')}
            disabled={isLoading}
          />
        </div>
      </div>
      {isLoading && (
        <div className="text-sm text-gray-500">Updating theme...</div>
      )}
    </div>
  );
};

export default ThemeChanger;
