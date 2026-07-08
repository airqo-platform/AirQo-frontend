import LeaderboardScreen from '@/features/clean-air-forum-2026/screens/LeaderboardScreen';
import {
  generateMetadata as createMetadata,
  generateViewport,
} from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Leaderboard | Africa Clean Air Forum 2026',
  description: 'Leaderboard screen for the Africa Clean Air Forum 2026 quiz.',
  url: '/africa-clean-air-forum-2026/leaderboard',
});

export const viewport = generateViewport();

export default function page() {
  return <LeaderboardScreen />;
}
