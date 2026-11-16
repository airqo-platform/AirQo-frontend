import QuizScreen from '@/features/clean-air-forum-2026/screens/QuizScreen';
import { generateMetadata } from '@/lib/metadata';

export const metadata = {
  ...generateMetadata({
    title: 'Africa Clean Air Forum 2026 quiz | AirQo',
    description:
      'Take part in the Africa Clean Air Forum 2026 interactive quiz.',
    url: '/africa-clean-air-forum-2026/quiz',
  }),
  robots: { index: false, follow: true },
};

const page = () => {
  return <QuizScreen />;
};

export default page;
