'use client';
import { createContext, ReactNode, useContext } from 'react';

// Define the context
const ForumDataContext = createContext<any>(null);

// Create a custom hook to access the context
export const useForumData = () => {
  return useContext(ForumDataContext);
};

// Define the provider to wrap your layout
export const ForumDataProvider = ({
  children,
  data,
}: {
  children: ReactNode;
  data: any;
}) => {
  return (
    <ForumDataContext.Provider value={data}>
      {children}
    </ForumDataContext.Provider>
  );
};
