'use client';

import { useParams } from 'next/navigation';
import React, { ReactNode } from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import { NoData } from '@/components/ui';
import ForumDetailSkeleton from '@/components/ui/ForumDetailSkeleton';
import { ForumDataProvider } from '@/context/ForumDataContext';
import { useForumEventDetails } from '@/hooks/useApiHooks';
import { ForumEventDetail } from '@/services/types/api';
import logger from '@/utils/logger';

import BannerSection from '../../../views/cleanairforum/BannerSection';

type ForumEventLayoutProps = {
  children: ReactNode;
};

const ForumEventLayout: React.FC<ForumEventLayoutProps> = ({ children }) => {
  const params = useParams();
  const uniqueTitle = params.uniqueTitle as string;

  // Get the details for the selected event using the unique_title
  const {
    data: forumEventData,
    isLoading: detailsLoading,
    error: detailsError,
  } = useForumEventDetails(uniqueTitle);

  // Normalize the response - handle paginated vs single object
  const selectedEvent = React.useMemo(() => {
    if (!forumEventData) return null;

    // If paginated response, take the first result
    if (Array.isArray((forumEventData as any).results)) {
      return (forumEventData as any).results[0] || null;
    }

    // Otherwise assume it's the event object
    return forumEventData as unknown as ForumEventDetail;
  }, [forumEventData]);

  // Normalize the forum event data for easier consumption by child components
  // Note: Most pages now use selectedEvent directly for better performance
  // Only normalize for pages that still require it (like legacy components)
  const normalizedData = React.useMemo(() => {
    // Since most pages now use selectedEvent directly, skip normalization for performance
    // Only enable if specific pages require it
    return null; // selectedEvent ? normalizeForumEventData(selectedEvent) : null;
  }, []);

  // Handle loading states
  if (detailsLoading) {
    return (
      <MainLayout>
        <ForumDetailSkeleton />
      </MainLayout>
    );
  }

  // Handle errors
  if (detailsError) {
    logger.error('Error loading forum event', detailsError, {
      uniqueTitle,
      detailsError,
    });

    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <NoData message="Error loading forum event. Please try again later." />
        </div>
      </MainLayout>
    );
  }

  // Handle no event found
  if (!selectedEvent) {
    logger.warn('No forum event found', { uniqueTitle });
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <NoData message="Forum event not found" />
        </div>
      </MainLayout>
    );
  }

  // Provide the selected event to the context
  const forumData = {
    selectedEvent,
    normalizedData,
    eventTitles: [], // Not needed for individual event pages
    isLoading: false,
    isError: !!detailsError,
    error: detailsError ? 'Failed to load forum event' : undefined,
  };

  return (
    <ForumDataProvider data={forumData}>
      <MainLayout>
        {/* Banner Section */}
        <BannerSection data={selectedEvent} />

        {/* Main Content */}
        <div className="w-full">{children}</div>
      </MainLayout>
    </ForumDataProvider>
  );
};

export default ForumEventLayout;
