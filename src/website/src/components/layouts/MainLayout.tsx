'use client';
import React from 'react';

import GitHubRibbon from '@/components/GitHubRibbon';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';

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
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pb-8 pt-28">
        <PageTransitionWrapper>
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
        </PageTransitionWrapper>
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
