'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getFlagUrl, Language, languages } from '@/utils/languages';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (lang: Language) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.country.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden notranslate">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Select Language
          </DialogTitle>
          <div className="relative mt-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search language or country..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50"
                aria-label={`Select ${lang.name} language`}
              >
                <span
                  className="flex items-center justify-center w-8 h-5 overflow-hidden rounded border border-gray-200"
                  role="img"
                  aria-label={lang.country}
                >
                  <Image
                    src={getFlagUrl(lang.flag)}
                    alt={`${lang.country} flag`}
                    width={32}
                    height={20}
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="flex items-center justify-center w-full h-full bg-blue-100 text-blue-600 font-semibold text-xs rounded border border-blue-200">${lang.code.split('-')[0].toUpperCase()}</span>`;
                      }
                    }}
                  />
                </span>
                <span className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
          {filteredLanguages.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No languages found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
        <div className="p-4 text-right text-xs text-gray-400">
          Powered by Google Translate
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageModal;
