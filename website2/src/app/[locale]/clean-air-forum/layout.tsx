// components/layouts/CleanAirLayout.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import React, { ReactNode } from 'react';

import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import NewsLetter from '@/components/layouts/NewsLetter';
import Loading from '@/components/loading';
import { NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { ForumDataProvider } from '@/context/ForumDataContext';
import { useForumEventDetails, useForumEventTitles } from '@/hooks/useApiHooks';
import BannerSection from '@/views/Forum/BannerSection';

type CleanAirLayoutProps = {
  children: ReactNode;
};

const CleanAirLayout: React.FC<CleanAirLayoutProps> = ({ children }) => {
  const searchParams = useSearchParams();
  // Get the slug query parameter; if missing, the hook returns the "latest" event.
  const slug = searchParams.get('slug');

  // Get the details for the selected (or latest) event.
  const { data: selectedEvent, isLoading: detailsLoading } =
    useForumEventDetails(slug);
  // Get the list of event titles (with unique_title values).
  const { data: eventTitles, isLoading: titlesLoading } = useForumEventTitles();

  if (detailsLoading || titlesLoading) {
    return <Loading />;
  }

  if (!selectedEvent) {
    return <NoData message="No event found" />;
  }

  // Provide both the selected event and the list of event titles to the context.
  const forumData = {
    selectedEvent,
    eventTitles,
  };

  return (
    <ForumDataProvider data={forumData}>
      <div className="min-h-screen w-full flex flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-50">
          <Navbar />
        </header>

        {/* Banner Section */}
        <BannerSection data={selectedEvent} />

        {/* Main Content */}
        <main className={`${mainConfig.containerClass} w-full flex-1 pb-8`}>
          {children}
        </main>

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
