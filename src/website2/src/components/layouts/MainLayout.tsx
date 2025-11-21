'use client';
import React from 'react';

import GitHubRibbon from '@/components/GitHubRibbon';

import ActionButtons from './ActionButtons';
import Footer from './Footer';
import Highlight from './Highlight';
import Navbar from './Navbar';
import NewsLetter from './NewsLetter';

interface MainLayoutProps {
  children: React.ReactNode;
  // Optional full-width element rendered above the centered container (e.g., full-width hero)
  topFullWidth?: React.ReactNode;
}

const MainLayout = ({ children, topFullWidth }: MainLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* GitHub Ribbon */}
      <GitHubRibbon />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white">
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-8">
        {/* Optional full-width area inserted before the centered container */}
        {topFullWidth}

        <div className="text-gray-700 w-full px-4 lg:px-0">{children}</div>

        {/* Highlight Section */}
        <section className="mt-32 mb-8">
          <Highlight />
        </section>

        {/* Action Buttons Section */}
        <section className="my-8">
          <ActionButtons />
        </section>
      </main>

      <footer>
        {/* Newsletter Section */}
        <section className="my-16">
          <NewsLetter />
        </section>

        {/* Footer Section */}
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
