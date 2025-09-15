'use client';

import { useSearchParams } from 'next/navigation';
import React, { ReactNode } from 'react';

import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import NewsLetter from '@/components/layouts/NewsLetter';
import { ForumLoading, NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { ForumDataProvider } from '@/context/ForumDataContext';
import { useForumEventDetails, useForumEventTitles } from '@/hooks/useApiHooks';
import logger from '@/utils/logger';

import BannerSection from '../../views/cleanairforum/BannerSection';

type CleanAirLayoutProps = {
  children: ReactNode;
};

const CleanAirLayout: React.FC<CleanAirLayoutProps> = ({ children }) => {
  const searchParams = useSearchParams();
  // Get the slug query parameter; if missing, the hook returns the "latest" event.
  const slug = searchParams.get('slug');

  // Get the details for the selected (or latest) event.
  const {
    data: selectedEvent,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useForumEventDetails(slug);

  // Get the list of event titles (with unique_title values).
  const {
    data: eventTitles,
    isLoading: titlesLoading,
    isError: titlesError,
  } = useForumEventTitles();

  // Log forum access only on errors
  React.useEffect(() => {
    // Only log if there are actual errors, not for normal access
    if (detailsError || titlesError) {
      logger.error('Clean Air Forum data loading failed', undefined, {
        slug,
        detailsError: !!detailsError,
        titlesError: !!titlesError,
      });
    }
  }, [slug, detailsError, titlesError]);

  // Handle loading states
  if (detailsLoading || titlesLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50">
          <Navbar />
        </header>
        <main className="flex-1">
          <ForumLoading message="Loading Clean Air Forum..." />
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    );
  }

  // Handle errors
  if (detailsError || titlesError) {
    let err: Error | undefined;
    if (detailsError instanceof Error) {
      err = detailsError;
    } else if (titlesError instanceof Error) {
      err = titlesError;
    } else {
      err = undefined;
    }

    logger.error('Error loading forum data', err, {
      slug,
      detailsError,
      titlesError,
    });

    return (
      <div className="min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50">
          <Navbar />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <NoData message="Error loading Clean Air Forum. Please try again later." />
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    );
  }

  // Handle no event found
  if (!selectedEvent) {
    logger.warn('No forum event found', { slug });
    return (
      <div className="min-h-screen w-full flex flex-col">
        <header className="sticky top-0 z-50">
          <Navbar />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <NoData message="No forum event found" />
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    );
  }

  // Provide both the selected event and the list of event titles to the context.
  const forumData = {
    selectedEvent,
    eventTitles,
    isLoading: false,
    isError: !!(detailsError || titlesError),
    error:
      detailsError || titlesError ? 'Failed to load forum data' : undefined,
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
