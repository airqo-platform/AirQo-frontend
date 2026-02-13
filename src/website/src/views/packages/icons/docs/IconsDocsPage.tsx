'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

import { CustomButton } from '@/components/ui';

import ApiReferenceSection from './sections/ApiReferenceSection';
import FlutterSection from './sections/FlutterSection';
import InstallationSection from './sections/InstallationSection';
import QuickStartSection from './sections/QuickStartSection';
import StylingSection from './sections/StylingSection';
import TypeScriptSection from './sections/TypeScriptSection';
import UtilitiesSection from './sections/UtilitiesSection';
import VueSection from './sections/VueSection';

export default function IconsDocsPage() {
  const [activeSection, setActiveSection] = useState('installation');

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'installation',
        'quick-start',
        'styling',
        'api-reference',
        'typescript',
        'flutter',
        'vue',
        'utilities',
      ];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Toaster position="bottom-right" containerStyle={{ zIndex: 40000 }} />
      <div className="min-h-screen bg-gray-50/50">
        {/* Hero Section with Back Button */}
        <div className="bg-gradient-to-r from-[#1651C6] to-[#0D388E] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link
                href="/packages/icons"
                className="inline-flex items-center text-white hover:text-blue-100 font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Icons Library
              </Link>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                <p className="text-xl text-blue-100 max-w-2xl">
                  Everything you need to integrate AirQo icons into your
                  application.
                </p>
              </div>
              <Link href="/packages/icons">
                <CustomButton className="text-sm py-2 px-4 bg-white/10 text-white hover:bg-white/20">
                  Browse Icons
                </CustomButton>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-8 space-y-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-4 custom-scrollbar">
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Getting Started
                  </h5>
                  <nav className="space-y-2">
                    <button
                      onClick={() => scrollToSection('installation')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'installation'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Installation
                    </button>
                    <button
                      onClick={() => scrollToSection('quick-start')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'quick-start'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Quick Start
                    </button>
                  </nav>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Usage
                  </h5>
                  <nav className="space-y-2">
                    <button
                      onClick={() => scrollToSection('styling')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'styling'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Styling
                    </button>
                    <button
                      onClick={() => scrollToSection('api-reference')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'api-reference'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      API Reference
                    </button>
                    <button
                      onClick={() => scrollToSection('typescript')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'typescript'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      TypeScript
                    </button>
                  </nav>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Other Frameworks
                  </h5>
                  <nav className="space-y-2">
                    <button
                      onClick={() => scrollToSection('flutter')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'flutter'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Flutter
                    </button>
                    <button
                      onClick={() => scrollToSection('vue')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'vue'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Vue.js
                    </button>
                  </nav>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Resources
                  </h5>
                  <nav className="space-y-2">
                    <button
                      onClick={() => scrollToSection('utilities')}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'utilities'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Utilities
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="space-y-16">
                <InstallationSection />
                <div className="border-t border-gray-200" />
                <QuickStartSection />
                <div className="border-t border-gray-200" />
                <StylingSection />
                <div className="border-t border-gray-200" />
                <ApiReferenceSection />
                <div className="border-t border-gray-200" />
                <TypeScriptSection />
                <div className="border-t border-gray-200" />
                <FlutterSection />
                <div className="border-t border-gray-200" />
                <VueSection />
                <div className="border-t border-gray-200" />
                <UtilitiesSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
