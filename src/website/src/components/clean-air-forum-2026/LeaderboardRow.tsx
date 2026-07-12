import Image from 'next/image';

import { cn } from '@/lib/utils/cn';

type LeaderboardRowProps = {
  avatar?: string;
  avatarImageUrl?: string;
  isEmpty?: boolean;
  name: string;
  points: string;
  rank: number;
  tone?: 'light' | 'tint';
};

export default function LeaderboardRow({
  avatar,
  avatarImageUrl,
  isEmpty = false,
  name,
  points,
  rank,
  tone = 'light',
}: LeaderboardRowProps) {
  return (
    <div
      className={cn(
        'flex h-16 w-full items-center rounded-[14px] px-4 transition-opacity sm:h-[4.5rem] sm:px-5 lg:h-20 lg:px-7',
        tone === 'light' ? 'bg-white' : 'bg-[#CBF6F6]',
        isEmpty && 'opacity-50',
      )}
    >
      <div
        className={cn(
          'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-semibold sm:h-12 sm:w-12 lg:h-[3rem] lg:w-[3rem]',
          isEmpty ? 'bg-white/60' : 'bg-[#D9D9D9]',
        )}
      >
        {avatarImageUrl ? (
          <Image
            src={avatarImageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          avatar || ''
        )}
      </div>
      <p
        className={cn(
          'ml-4 truncate text-[clamp(1.2rem,2.9vw,2rem)] font-bold leading-[1.08] tracking-[-0.02em] sm:ml-5',
          isEmpty ? 'text-black/40 italic' : 'text-black',
        )}
      >
        {rank}. {name}
      </p>
      <p
        className={cn(
          'ml-auto shrink-0 pl-4 text-right text-[clamp(1.2rem,2.8vw,2rem)] font-bold leading-[1.08] tracking-[-0.02em]',
          isEmpty ? 'text-black/40' : 'text-black',
        )}
      >
        {points}
      </p>
    </div>
  );
}
