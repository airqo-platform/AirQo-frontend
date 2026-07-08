import LeaderboardToggle from './LeaderboardToggle';

const toggles: Array<{
  active?: boolean;
  width: 'long' | 'medium' | 'short';
}> = [
  { active: true, width: 'long' },
  { width: 'short' },
  { width: 'short' },
  { width: 'short' },
];

export default function LeaderboardToggles() {
  return (
    <div
      className="mx-auto flex w-fit items-center gap-[10px]"
      aria-label="Leaderboard pagination indicators"
      role="presentation"
    >
      {toggles.map((toggle, index) => (
        <LeaderboardToggle
          key={`${toggle.width}-${index}`}
          active={toggle.active}
          width={toggle.width}
        />
      ))}
    </div>
  );
}
