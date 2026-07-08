import { cn } from '@/lib/utils/cn';

type LeaderboardRowProps = {
  name: string;
  points: string;
  rank: number;
  tone?: 'light' | 'tint';
};

export default function LeaderboardRow({
  name,
  points,
  rank,
  tone = 'light',
}: LeaderboardRowProps) {
  return (
    <div
      className={cn(
        'flex h-16 w-full items-center rounded-[14px] px-4 sm:h-[4.5rem] sm:px-5 lg:h-20 lg:px-7',
        tone === 'light' ? 'bg-white' : 'bg-[#CBF6F6]',
      )}
    >
      <div className="h-11 w-11 shrink-0 rounded-full bg-[#D9D9D9] sm:h-12 sm:w-12 lg:h-[3rem] lg:w-[3rem]" />
      <p className="ml-4 truncate text-[clamp(1.2rem,2.9vw,2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-black sm:ml-5">
        {rank}. {name}
      </p>
      <p className="ml-auto shrink-0 pl-4 text-right text-[clamp(1.2rem,2.8vw,2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-black">
        {points}
      </p>
    </div>
  );
}
