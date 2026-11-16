import type { Metadata } from 'next';

import NotFoundContent from '@/components/NotFoundContent';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: {
    index: false,
    follow: true,
  },
};

const NotFoundPage = () => {
  return <NotFoundContent />;
};

export default NotFoundPage;
