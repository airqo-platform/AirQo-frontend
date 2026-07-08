import LeaderboardRow from './LeaderboardRow';

const leaderboardRows = [
  { rank: 1, name: 'Hakim Luyima', points: '15,000pts', tone: 'light' },
  { rank: 2, name: 'Hassan Kulubya', points: '15,000pts', tone: 'tint' },
  { rank: 3, name: 'Hakim Luyima', points: '15,000pts', tone: 'light' },
  { rank: 4, name: 'Martin Bbaale', points: '15,000pts', tone: 'tint' },
  { rank: 5, name: 'Paul Ochieng', points: '15,000pts', tone: 'light' },
] as const satisfies Array<{
  rank: number;
  name: string;
  points: string;
  tone: 'light' | 'tint';
}>;

export default function LeaderboardRowsBlock() {
  return (
    <div className="mx-auto flex w-full max-w-[75.125rem] flex-col gap-3 sm:gap-4 lg:gap-4">
      {leaderboardRows.map((row) => (
        <LeaderboardRow
          key={row.rank}
          rank={row.rank}
          name={row.name}
          points={row.points}
          tone={row.tone}
        />
      ))}
    </div>
  );
}
