'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ForumEventPage = () => {
  const params = useParams();
  const router = useRouter();
  const uniqueTitle = params.uniqueTitle as string;

  useEffect(() => {
    // Redirect to the about page of the selected forum event
    router.replace(`/clean-air-forum/${uniqueTitle}/about`);
  }, [uniqueTitle, router]);

  return null; // This component only handles redirection
};

export default ForumEventPage;
