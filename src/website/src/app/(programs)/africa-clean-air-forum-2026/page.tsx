import { redirect } from 'next/navigation';

import { CLEAN_AIR_FORUM_2026_QUIZ_ROUTE } from '@/features/clean-air-forum-2026/constants/learn';
import {
  generateMetadata as createMetadata,
  generateViewport,
} from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Africa Clean Air Forum 2026',
  description:
    'Live event experience for the Africa Clean Air Forum 2026 stall.',
  url: '/africa-clean-air-forum-2026',
});

export const viewport = generateViewport();

const page = () => {
  redirect(CLEAN_AIR_FORUM_2026_QUIZ_ROUTE);
};

export default page;
