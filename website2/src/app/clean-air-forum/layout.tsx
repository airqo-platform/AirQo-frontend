'use client';
import { useSearchParams } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';

import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/Navbar';
import NewsLetter from '@/components/layouts/NewsLetter';
import Loading from '@/components/loading';
import { NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { ForumDataProvider } from '@/context/ForumDataContext';
import { useDispatch, useSelector } from '@/hooks/reduxHooks';
import { useForumEvents } from '@/hooks/useApiHooks';
import { selectEvent, setEvents } from '@/store/slices/forumSlice';
import BannerSection from '@/views/Forum/BannerSection';

type CleanAirLayoutProps = {
  children: ReactNode;
};

const CleanAirLayout: React.FC<CleanAirLayoutProps> = ({ children }) => {
  // Fetch forum events from the API.
  const { data: forumEvents, isLoading } = useForumEvents();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // When events are fetched, update the Redux slice.
  useEffect(() => {
    if (forumEvents && forumEvents.length > 0) {
      dispatch(setEvents(forumEvents));
    }
  }, [forumEvents, dispatch]);

  // Get the slug query parameter.
  const slug = searchParams.get('slug');
  const events = useSelector((state) => state.forum.events);
  const selectedEventIndex = useSelector(
    (state) => state.forum.selectedEventIndex,
  );

  // Only run the slug-based selection if a slug is provided.
  useEffect(() => {
    if (slug && events.length > 0) {
      // Normalize the slug by replacing hyphens with spaces and lowercasing.
      const normalizedSlug = slug.replace(/-/g, ' ').toLowerCase();
      // Find the event whose title (taking the part before a comma) matches.
      const index = events.findIndex((event) => {
        const cleanTitle = event.title
          .split(',')[0]
          .trim()
          .toLowerCase()
          .replace(/-/g, ' ');
        return cleanTitle === normalizedSlug;
      });
      if (index !== -1 && index !== selectedEventIndex) {
        dispatch(selectEvent(index));
      }
      // If no slug match is found, you may choose to do nothing
      // rather than resetting to index 0.
    }
    // Note: we do not reset the index if slug is missing.
  }, [slug, events, selectedEventIndex, dispatch]);

  const selectedEvent = events[selectedEventIndex];

  if (isLoading) {
    return <Loading />;
  }

  if (!selectedEvent) {
    return <NoData message="No event found" />;
  }

  return (
    <ForumDataProvider data={selectedEvent}>
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
