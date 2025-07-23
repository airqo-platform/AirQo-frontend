"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Palette, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { AirQOIconsUtils } from "@airqo/icons-react";

const modernBlue = "#0A84FF";

// Color palette for icon customization
const colorPalette = [
  "#0A84FF",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D92",
  "#FF3B30",
  "#FF9500",
  "#FFCC02",
  "#32D74B",
  "#30D158",
  "#66D4CF",
  "#40C8E0",
  "#000000",
  "#1C1C1E",
  "#48484A",
  "#6D6D70",
  "#8E8E93",
  "#AEAEB2",
  "#C7C7CC",
  "#FFFFFF",
];

// Mock icon component for demo
const MockIcon = ({ size = 24, color = "#000000" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ color }}
  >
    <path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12 22V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 7L12 12L2 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface IconMetadata {
  name: string;
  component: React.ComponentType<{
    size?: number;
    color?: string;
    className?: string;
  }>;
}

interface Props {
  icon: IconMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IconPreviewDialog({ icon, isOpen, onClose }: Props) {
  const [size, setSize] = useState(48);
  const [color, setColor] = useState(modernBlue);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Mock icon data for demo
  const mockIcon = {
    name: "Calibration",
    component: MockIcon,
  };

  const currentIcon = icon || mockIcon;

  const copy = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        toast.success("Copied!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  const reactCode = `import { ${currentIcon.name} } from '@airqo/icons-react';

<${currentIcon.name} size={${size}} color="${color}" />`;

  const flutterCode = `Icon(
  AirqoIcons.${currentIcon.name.toLowerCase()},
  size: ${size}.0,
  color: Color(0xFF${color.replace("#", "")}),
)`;

  const sizePresets = [
    { label: "XS", value: 16 },
    { label: "SM", value: 24 },
    { label: "MD", value: 32 },
    { label: "LG", value: 48 },
    { label: "XL", value: 64 },
    { label: "2XL", value: 96 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:h-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentIcon.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customize and export your icon
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 p-4">
              {/* Preview Section */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Preview</h4>

                {/* Icon Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center min-h-[180px]">
                  <div style={{ width: size, height: size, color }}>
                    <currentIcon.component size={size} color={color} />
                  </div>
                </div>

                {/* Size Controls */}
                <div className="mt-8 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">
                      Size: <span className="font-semibold">{size}px</span>
                    </label>
                    <div className="flex gap-1">
                      {sizePresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setSize(preset.value)}
                          className={`px-2 py-1 text-xs rounded transition-colors duration-150 ${
                            size === preset.value
                              ? "bg-blue-500 text-white dark:bg-blue-400 dark:text-gray-900 shadow"
                              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative flex items-center mt-4">
                    <input
                      type="range"
                      min="16"
                      max="128"
                      value={size}
                      onChange={(e) => setSize(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-blue-200 dark:bg-blue-900/30 accent-blue-500"
                      style={{ accentColor: modernBlue }}
                    />
                    <span className="absolute right-0 -top-6 text-xs text-gray-400 dark:text-gray-500">
                      {size}
                    </span>
                  </div>
                </div>

                {/* Color Controls */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">Color</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 cursor-pointer shadow"
                      style={{ minWidth: 32, minHeight: 32 }}
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-24 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800"
                      maxLength={7}
                    />
                    <button
                      className="ml-2 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                      onClick={() => setShowColorPicker((v) => !v)}
                    >
                      <Palette className="inline-block w-4 h-4 mr-1 align-text-bottom" />
                      Palette
                    </button>
                  </div>
                  {showColorPicker && (
                    <div className="mt-2 grid grid-cols-10 gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-xs">
                      {colorPalette.map((c) => (
                        <button
                          key={c}
                          className={`w-5 h-5 rounded-full border-2 ${
                            color === c
                              ? "border-blue-500"
                              : "border-transparent"
                          } focus:outline-none`}
                          style={{ backgroundColor: c }}
                          onClick={() => {
                            setColor(c);
                            setShowColorPicker(false);
                          }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Section */}
              <div>
                <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
                  Usage
                </h4>

                <div className="space-y-4">
                  {/* React Code */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          React
                        </span>
                      </div>
                      <button
                        onClick={() => copy(reactCode)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <div className="p-4">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        <code>{reactCode}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Flutter Code */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Flutter
                        </span>
                      </div>
                      <button
                        onClick={() => copy(flutterCode)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <div className="p-4">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                        <code>{flutterCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Only Copy Name button now */}
            <div className="flex justify-end items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => copy(currentIcon.name)}
                className="px-4 py-2 text-sm text-white rounded-lg shadow-sm hover:shadow transition-shadow"
                style={{ backgroundColor: modernBlue }}
              >
                Copy Name
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
