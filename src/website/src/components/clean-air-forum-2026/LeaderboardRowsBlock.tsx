import LeaderboardRow from './LeaderboardRow';

type LeaderboardRowsBlockProps = {
  rows: Array<{
    avatar?: string;
    avatarImageUrl?: string;
    rank: number;
    name: string;
    points: string;
    tone: 'light' | 'tint';
  }>;
};

const placeholderRows: LeaderboardRowsBlockProps['rows'] = Array.from(
  { length: 5 },
  (_, index) => ({
    avatar: '',
    avatarImageUrl: '',
    rank: index + 1,
    name: 'Loading...',
    points: '-- pts',
    tone: index % 2 === 0 ? 'light' : 'tint',
  }),
);

export default function LeaderboardRowsBlock({
  rows,
}: LeaderboardRowsBlockProps) {
  const visibleRows = rows.length > 0 ? rows : placeholderRows;

  return (
    <div className="mx-auto flex w-full max-w-[75.125rem] flex-col gap-3 sm:gap-4 lg:gap-4">
      {visibleRows.map((row) => (
        <LeaderboardRow
          key={`${row.rank}-${row.name}`}
          avatar={row.avatar}
          avatarImageUrl={row.avatarImageUrl}
          rank={row.rank}
          name={row.name}
          points={row.points}
          tone={row.tone}
        />
      ))}
    </div>
  );
}
