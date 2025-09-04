'use client';
import { createContext, ReactNode, useContext } from 'react';

import { ForumEvent, ForumTitlesResponse } from '@/types/forum';
import logger from '@/utils/logger';

export interface ForumData {
  selectedEvent: ForumEvent | null;
  // eventTitles can be an array of ForumEvent or a ForumTitlesResponse object.
  eventTitles: ForumEvent[] | ForumTitlesResponse | null;
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error?: string;
}

const ForumDataContext = createContext<ForumData | undefined>(undefined);

export const useForumData = () => {
  const context = useContext(ForumDataContext);
  if (!context) {
    logger.warn(
      'useForumData called outside ForumDataProvider. Falling back to error state.',
    );
    return {
      selectedEvent: null,
      eventTitles: null,
      isLoading: false,
      isError: true,
      error: 'ForumDataProvider is missing in the component tree.',
    };
  }
  return context;
};

export const ForumDataProvider = ({
  children,
  data,
}: {
  children: ReactNode;
  data: ForumData;
}) => {
  return (
    <ForumDataContext.Provider value={data}>
      {children}
    </ForumDataContext.Provider>
  );
};
