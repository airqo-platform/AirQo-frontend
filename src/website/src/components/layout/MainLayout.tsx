'use client';
import React from 'react';

import PageTransitionWrapper from '@/components/PageTransitionWrapper';

import Footer from './Footer';
import Navbar from './Navbar';
import NewsLetter from './NewsLetter';

interface MainLayoutProps {
  children: React.ReactNode;
  // Optional full-width element rendered above the centered container (e.g., full-width hero)
  topFullWidth?: React.ReactNode;
  showNewsletter?: boolean;
}

const MainLayout = ({
  children,
  topFullWidth,
  showNewsletter = false,
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-clip">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pb-8 pt-32">
        <PageTransitionWrapper>
          {/* Optional full-width area inserted before the centered container */}
          {topFullWidth}

          <div className="text-gray-700 w-full">{children}</div>
        </PageTransitionWrapper>
      </main>

      <footer>
        {showNewsletter && (
          /* Newsletter Section */
          <section className="my-16">
            <NewsLetter />
          </section>
        )}

        {/* Footer Section */}
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
