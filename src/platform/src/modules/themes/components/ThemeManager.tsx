import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AqSettings02,
  AqPalette,
  AqSun,
  AqMoon02,
  AqDotsGrid,
  AqGrid01,
  AqMonitor01,
  AqLayoutGrid01,
  AqLayoutGrid02,
  AqXClose,
  AqRefreshCcw02,
} from '@airqo/icons-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { HexColorPicker } from 'react-colorful';
import { useUser } from '@/shared/hooks/useUser';
import { useGroupTheme } from '@/shared/hooks/usePreferences';
import { Tooltip } from 'flowbite-react';

const presetColors = [
  { name: 'Blue', value: '#1649e5' },
  { name: 'Teal', value: '#005757' },
  { name: 'Green', value: '#059669' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Orange', value: '#ea580c' },
];

const ThemeManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#1649e5');
  const { theme, updateTheme } = useTheme();
  const { activeGroup } = useUser();
  const { data: groupThemeData } = useGroupTheme(activeGroup?.id || '');

  // Check if current theme matches group theme
  const themesMatch =
    groupThemeData?.success && groupThemeData.data
      ? theme.primaryColor === groupThemeData.data.primaryColor &&
        theme.mode === groupThemeData.data.mode &&
        theme.interfaceStyle === groupThemeData.data.interfaceStyle &&
        theme.contentLayout === groupThemeData.data.contentLayout
      : true; // If no group theme, consider matched

  const handlePrimaryColorChange = async (color: string) => {
    await updateTheme({ primaryColor: color });
    setCustomColor(color);
  };

  const handleModeChange = async (mode: 'light' | 'dark' | 'system') => {
    await updateTheme({ mode });
  };

  const handleInterfaceStyleChange = async (style: 'default' | 'bordered') => {
    await updateTheme({ interfaceStyle: style });
  };

  const handleContentLayoutChange = async (layout: 'compact' | 'wide') => {
    await updateTheme({ contentLayout: layout });
  };

  const applyCustomColor = async () => {
    await handlePrimaryColorChange(customColor);
    setShowColorPicker(false);
  };

  const handleResetDefaults = async () => {
    if (!themesMatch && groupThemeData?.success && groupThemeData.data) {
      // Use group theme
      const groupTheme = groupThemeData.data;
      await updateTheme({
        primaryColor: groupTheme.primaryColor,
        mode: groupTheme.mode === 'light' ? 'light' : 'dark', // API doesn't have system
        interfaceStyle: groupTheme.interfaceStyle,
        contentLayout: groupTheme.contentLayout,
      });
    } else {
      // Reset to defaults
      const defaults = {
        primaryColor: '#1649e5',
        mode: 'light' as const,
        interfaceStyle: 'default' as const,
        contentLayout: 'wide' as const,
      };
      await updateTheme(defaults);
    }
    setCustomColor(theme.primaryColor);
    setShowColorPicker(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={`fixed right-6 bottom-6 bg-primary text-primary-foreground p-3 rounded-md shadow-lg hover:shadow-xl transition-shadow ${
          isOpen ? 'z-30' : 'z-50'
        }`}
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <AqSettings02 size={24} />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (use same style as shared Dialog) */}
            <motion.div
              className="fixed inset-0 z-[10000] bg-black/40 dark:bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed right-0 top-0 h-full w-[420px] bg-background border-l border-border z-[10001] overflow-hidden flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <AqPalette size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Customize</h2>
                      <p className="text-xs text-muted-foreground">
                        Personalize your experience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip
                      content={
                        !themesMatch ? 'Use default theme' : 'Reset to defaults'
                      }
                      placement="bottom"
                    >
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetDefaults}
                          className="h-9 w-9 p-0"
                          aria-label={
                            !themesMatch ? 'Use default theme' : 'Reset'
                          }
                        >
                          <AqRefreshCcw02 size={16} />
                        </Button>
                        {!themesMatch && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                        )}
                      </div>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-9 w-9 p-0"
                      aria-label="Close"
                    >
                      <AqXClose size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Color Palette */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Color Palette
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose your brand color
                    </p>
                  </div>

                  {/* Color Grid: 5 presets + custom button */}
                  <div className="grid grid-cols-6 gap-3">
                    {presetColors.map(color => (
                      <motion.button
                        key={color.value}
                        className="relative aspect-square"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrimaryColorChange(color.value)}
                      >
                        <div
                          className={`w-full h-full rounded-md transition-all ${
                            theme.primaryColor === color.value
                              ? 'ring-2 ring-offset-2 ring-primary'
                              : 'ring-1 ring-border hover:ring-2'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                        {theme.primaryColor === color.value && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M10 3L4.5 8.5L2 6"
                                  stroke={color.value}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}

                    {/* Custom Color Button - Same size as color swatches */}
                    <motion.button
                      className="relative aspect-square"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      <div className="w-full h-full rounded-md border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex items-center justify-center transition-all">
                        <AqPalette
                          size={20}
                          className="text-muted-foreground"
                        />
                      </div>
                    </motion.button>
                  </div>

                  {/* Color Picker */}
                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      >
                        <Card className="p-4 space-y-3">
                          <HexColorPicker
                            color={customColor}
                            onChange={setCustomColor}
                            style={{ width: '100%', height: '160px' }}
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className="w-10 h-10 rounded-md border border-border flex-shrink-0"
                              style={{ backgroundColor: customColor }}
                            />
                            <input
                              type="text"
                              value={customColor}
                              onChange={e => setCustomColor(e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                            />
                          </div>
                          <Button onClick={applyCustomColor} className="w-full">
                            Apply
                          </Button>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* Appearance */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Appearance
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select your preferred theme
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: AqSun },
                      { value: 'dark', label: 'Dark', icon: AqMoon02 },
                      { value: 'system', label: 'Auto', icon: AqDotsGrid },
                    ].map(mode => {
                      const Icon = mode.icon;
                      const isActive = theme.mode === mode.value;
                      return (
                        <motion.button
                          key={mode.value}
                          className={`flex flex-col items-center gap-2 py-4 rounded-md transition-all ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-muted/30 text-muted-foreground hover:bg-muted'
                          }`}
                          onClick={() =>
                            handleModeChange(
                              mode.value as 'light' | 'dark' | 'system'
                            )
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon size={20} />
                          <span className="text-xs font-medium">
                            {mode.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                {/* Interface Style */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Interface Style
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      How components should look
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        value: 'default',
                        label: 'Default',
                        description: 'Clean and minimal design',
                        icon: AqMonitor01,
                      },
                      {
                        value: 'bordered',
                        label: 'Bordered',
                        description: 'Defined boundaries',
                        icon: AqGrid01,
                      },
                    ].map(style => {
                      const Icon = style.icon;
                      const isActive = theme.interfaceStyle === style.value;
                      return (
                        <motion.button
                          key={style.value}
                          className={`w-full text-left p-4 rounded-md border-2 transition-all ${
                            isActive
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                          onClick={() =>
                            handleInterfaceStyleChange(
                              style.value as 'default' | 'bordered'
                            )
                          }
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-muted/60">
                              <Icon size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {style.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {style.description}
                              </div>
                            </div>
                            {isActive && (
                              <motion.div
                                className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <svg
                                  width="12"
                                  height="12"
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
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                {/* Content Layout */}
                <section>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Content Layout
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Spacing and density
                    </p>
                  </div>

                  <div className="space-y-3">
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
                      const isActive = theme.contentLayout === layout.value;
                      return (
                        <motion.button
                          key={layout.value}
                          className={`w-full text-left p-4 rounded-md border-2 transition-all ${
                            isActive
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                          onClick={() =>
                            handleContentLayoutChange(
                              layout.value as 'compact' | 'wide'
                            )
                          }
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-muted/60">
                              <Icon size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {layout.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {layout.description}
                              </div>
                            </div>
                            {isActive && (
                              <motion.div
                                className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <svg
                                  width="12"
                                  height="12"
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
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeManager;
