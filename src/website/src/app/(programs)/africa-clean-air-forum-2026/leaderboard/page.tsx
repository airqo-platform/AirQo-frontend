import LeaderboardScreen from '@/features/clean-air-forum-2026/screens/LeaderboardScreen';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Leaderboard | Air Quality Quiz',
  description:
    'View the top participants on the Air Quality Quiz leaderboard from the Africa Clean Air Forum.',
  url: '/africa-clean-air-forum-2026/leaderboard',
});

export default function LeaderboardRoute() {
  return <LeaderboardScreen />;
}
