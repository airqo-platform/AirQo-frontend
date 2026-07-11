import LeaderboardToggle from './LeaderboardToggle';

type LeaderboardTogglesProps = {
  activeIndex: number;
  count?: number;
};

export default function LeaderboardToggles({
  activeIndex,
  count = 4,
}: LeaderboardTogglesProps) {
  return (
    <div
      className="mx-auto flex w-fit items-center gap-[10px]"
      aria-label="Leaderboard pagination indicators"
      role="group"
    >
      {Array.from({ length: count }, (_, index) => (
        <LeaderboardToggle
          key={`toggle-${index}`}
          active={activeIndex === index}
          width={activeIndex === index ? 'long' : 'short'}
        />
      ))}
    </div>
  );
}
