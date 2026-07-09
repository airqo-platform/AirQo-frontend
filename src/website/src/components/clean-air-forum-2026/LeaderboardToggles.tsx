import LeaderboardToggle from './LeaderboardToggle';

type LeaderboardTogglesProps = {
  activeIndex: number;
};

export default function LeaderboardToggles({
  activeIndex,
}: LeaderboardTogglesProps) {
  return (
    <div
      className="mx-auto flex w-fit items-center gap-[10px]"
      aria-label="Leaderboard pagination indicators"
      role="presentation"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <LeaderboardToggle
          key={`toggle-${index}`}
          active={activeIndex === index}
          width={activeIndex === index ? 'long' : 'short'}
        />
      ))}
    </div>
  );
}
