'use client';
import { createContext, ReactNode, useContext } from 'react';

import { ForumEvent, ForumTitlesResponse } from '@/types/forum';

export interface ForumData {
  selectedEvent: ForumEvent | null;
  // eventTitles can be an array of ForumEvent or a ForumTitlesResponse object.
  eventTitles: ForumEvent[] | ForumTitlesResponse | null;
  // Loading states
  isLoading?: boolean;
  isError?: boolean;
  error?: string;
}

const ForumDataContext = createContext<ForumData | undefined>(undefined);

export const useForumData = () => {
  const context = useContext(ForumDataContext);
  if (!context) {
    console.warn(
      'useForumData was called outside of ForumDataProvider. Returning default state.',
    );
    return {
      selectedEvent: null,
      eventTitles: null,
      isLoading: true,
      isError: false,
    } as ForumData;
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
