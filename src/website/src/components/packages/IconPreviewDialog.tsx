'use client';
import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface IconMetadata {
  name: string;
  component: ComponentType<SVGProps<SVGSVGElement>>;
  group: string;
}

interface IconPreviewDialogProps {
  icon: IconMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IconPreviewDialog({
  icon,
  isOpen,
  onClose,
}: IconPreviewDialogProps) {
  const [size, setSize] = useState(48);
  const [color, setColor] = useState('#0284C7');
  const [activeTab, setActiveTab] = useState<'react' | 'vue' | 'flutter'>(
    'react',
  );

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !icon) return null;

  const Icon = icon.component;

  const sizePresets = [
    { label: 'XS', value: 16 },
    { label: 'SM', value: 24 },
    { label: 'MD', value: 32 },
    { label: 'LG', value: 48 },
    { label: 'XL', value: 64 },
    { label: '2XL', value: 96 },
  ];

  const colorPalette = [
    '#0284C7',
    '#2563EB',
    '#7C3AED',
    '#DB2777',
    '#DC2626',
    '#EA580C',
    '#CA8A04',
    '#65A30D',
    '#059669',
    '#0D9488',
    '#475569',
    '#1F2937',
  ];

  const codeSnippets = {
    react: `import { ${icon.name} } from '@airqo/icons-react';

<${icon.name} size={${size}} color="${color}" />`,
    vue: `<template>
  <${icon.name} :size="${size}" color="${color}" />
</template>

<script setup>
import { ${icon.name} } from '@airqo/icons-vue';
</script>`,
    flutter: `import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';

AqIcon.${icon.name.toLowerCase()}(
  size: ${size},
  color: Color(0xFF${color.slice(1)}),
)`,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        toast.success(`${label} copied!`, {
          // keep per-toast style high to be safe, container z-index is primary
          style: { zIndex: 45000 },
        }),
      )
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[20000]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[20000] w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{icon.name}</h2>
            <p className="text-sm text-gray-600">{icon.group}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-12 flex items-center justify-center">
            <Icon width={size} height={size} style={{ color }} />
          </div>

          {/* Customization */}
          <div className="space-y-4">
            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size: {size}px
              </label>
              <div className="flex gap-2">
                {sizePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setSize(preset.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      size === preset.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color: {color}
              </label>
              <div className="flex flex-wrap gap-2">
                {colorPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Code Snippets */}
          <div>
            <div className="flex gap-2 border-b mb-4">
              {(['react', 'vue', 'flutter'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(codeSnippets[activeTab], `${activeTab} code`)
                }
                className="absolute top-3 right-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => copyToClipboard(icon.name, 'Icon name')}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Copy Name
            </button>
            <Link
              href="/packages/icons/docs"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
