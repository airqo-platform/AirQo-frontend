'use client';
import { createContext, ReactNode, useContext } from 'react';

// Define the context
const ForumDataContext = createContext<any | undefined>(undefined);

// Create a custom hook to access the context
export const useForumData = () => {
  const context = useContext(ForumDataContext);
  // Instead of throwing an error, return undefined or a default value
  if (!context) {
    console.warn(
      'useForumData was called outside of ForumDataProvider. Returning default value.',
    );
    return {};
  }
  return context;
};

// Define the provider to wrap your layout
export const ForumDataProvider = ({
  children,
  data,
}: {
  children: ReactNode;
  data: any;
}) => {
  const safeData = data || {};
  return (
    <ForumDataContext.Provider value={safeData}>
      {children}
    </ForumDataContext.Provider>
  );
};
