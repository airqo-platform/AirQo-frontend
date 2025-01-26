'use client';

import React, { ReactNode } from 'react';

import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import NewsLetter from '@/components/layouts/NewsLetter';
import Loading from '@/components/loading';
import { ForumDataProvider } from '@/context/ForumDataContext';
import { useForumEvents } from '@/hooks/useApiHooks';
import BannerSection from '@/views/Forum/BannerSection';

type CleanAirLayoutProps = {
  children: ReactNode;
};

const CleanAirLayout: React.FC<CleanAirLayoutProps> = ({ children }) => {
  // Using the `useForumEvents` hook
  const { forumEvents, isLoading } = useForumEvents();

  // Extract the first event (if available)
  const eventData = forumEvents?.[0] || null;

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  return (
    <ForumDataProvider data={eventData}>
      <div className="min-h-screen w-full flex flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-50">
          <Navbar />
        </header>

        {/* Banner Section */}
        <BannerSection data={eventData} />

        {/* Main Content */}
        <main className="flex-1 pb-8">{children}</main>

        {/* Newsletter Section */}
        <section className="my-16">
          <NewsLetter />
        </section>

        {/* Footer */}
        <footer>
          <Footer />
        </footer>
      </div>
    </ForumDataProvider>
  );
};

export default CleanAirLayout;
