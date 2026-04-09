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

import BannerSection from '../../../../views/cleanairforum/BannerSection';

type ForumEventLayoutProps = {
  children: ReactNode;
};

const ForumEventLayout: React.FC<ForumEventLayoutProps> = ({ children }) => {
  const params = useParams();
  const uniqueTitle = params.uniqueTitle as string;

  const {
    data: forumEventData,
    isLoading: detailsLoading,
    error: detailsError,
  } = useForumEventDetails(uniqueTitle);

  const selectedEvent = React.useMemo(() => {
    if (!forumEventData) return null;

    if (Array.isArray((forumEventData as any).results)) {
      return (forumEventData as any).results[0] || null;
    }

    return forumEventData as unknown as ForumEventDetail;
  }, [forumEventData]);

  const normalizedData = React.useMemo(() => {
    return null;
  }, []);

  const forumData = React.useMemo(
    () => ({
      selectedEvent,
      normalizedData,
      eventTitles: [],
      isLoading: false,
      isError: !!detailsError,
      error: detailsError ? 'Failed to load forum event' : undefined,
    }),
    [selectedEvent, normalizedData, detailsError],
  );

  if (detailsLoading) {
    return (
      <MainLayout>
        <ForumDetailSkeleton />
      </MainLayout>
    );
  }

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

  return (
    <ForumDataProvider data={forumData}>
      <MainLayout>
        <BannerSection data={selectedEvent} />
        <div className="w-full">{children}</div>
      </MainLayout>
    </ForumDataProvider>
  );
};

export default ForumEventLayout;
