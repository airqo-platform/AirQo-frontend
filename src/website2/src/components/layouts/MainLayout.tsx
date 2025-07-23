'use client';
import React from 'react';

import ActionButtons from './ActionButtons';
import Footer from './Footer';
import Highlight from './Highlight';
import Navbar from './Navbar';
import NewsLetter from './NewsLetter';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-8">
        <div className="lg:px-0 text-gray-700">{children}</div>

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
