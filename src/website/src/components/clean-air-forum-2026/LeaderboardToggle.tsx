import { cn } from '@/lib/utils/cn';

type LeaderboardToggleProps = {
  active?: boolean;
  width?: 'long' | 'medium' | 'short';
};

const widthClassMap = {
  long: 'w-[57px]',
  medium: 'w-[55px]',
  short: 'w-[23px]',
} as const;

export default function LeaderboardToggle({
  active = false,
  width = 'short',
}: LeaderboardToggleProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block h-[14px] rounded-[16px]',
        widthClassMap[width],
        active ? 'bg-[#40C1C9]' : 'bg-[#DEE6E6]',
      )}
    />
  );
}
