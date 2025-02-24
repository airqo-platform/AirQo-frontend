'use client';
import { createContext, ReactNode, useContext } from 'react';

import { ForumEvent, ForumTitlesResponse } from '@/types/forum';

export interface ForumData {
  selectedEvent: ForumEvent;
  // eventTitles can be an array of ForumEvent or a ForumTitlesResponse object.
  eventTitles: ForumEvent[] | ForumTitlesResponse;
  // You may add more fields as needed.
}

const ForumDataContext = createContext<ForumData | undefined>(undefined);

export const useForumData = () => {
  const context = useContext(ForumDataContext);
  if (!context) {
    console.warn(
      'useForumData was called outside of ForumDataProvider. Returning empty object.',
    );
    return {} as ForumData;
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
