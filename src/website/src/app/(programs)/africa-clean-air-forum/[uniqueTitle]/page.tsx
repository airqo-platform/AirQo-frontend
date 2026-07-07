'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ForumEventPage = () => {
  const params = useParams();
  const router = useRouter();
  const uniqueTitle = params.uniqueTitle as string;

  useEffect(() => {
    const encodedTitle = encodeURIComponent(uniqueTitle);
    router.replace(`/africa-clean-air-forum/${encodedTitle}/about`);
  }, [uniqueTitle, router]);

  return null;
};

export default ForumEventPage;
