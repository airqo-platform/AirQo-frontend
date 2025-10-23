import { Card, CardContent } from '@/shared/components/ui/card';

const Skeleton = ({
  className,
  variant,
}: {
  className?: string;
  variant?: 'circular' | 'default';
}) => (
  <div
    className={`animate-pulse bg-muted ${
      variant === 'circular' ? 'rounded-full' : 'rounded-md'
    } ${className}`}
  />
);

const CircularProgressSkeleton = () => {
  const radius = 45;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Show about 60% progress for skeleton
  const strokeDashoffset = circumference - 0.6 * circumference;

  return (
    <div className="flex items-center justify-end">
      <svg height={radius * 2} width={radius * 2} className="animate-pulse">
        <defs>
          <mask id="skeleton-progress-mask">
            <rect width="100%" height="100%" fill="#fff" />
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius - stroke / 2}
              fill="#000"
            />
          </mask>
        </defs>

        {/* Background track - slightly darker neutral for skeleton contrast */}
        <circle
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ stroke: '#e6eef8' }}
        />

        {/* Progress indicator skeleton - muted blue arc */}
        <circle
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            stroke: '#7fb1ff',
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          mask="url(#skeleton-progress-mask)"
        />

        {/* Center text skeleton - slightly darker to be visible on white */}
        <circle cx={radius} cy={radius} r="12" style={{ fill: '#f1f5f9' }} />
      </svg>
    </div>
  );
};

const SkeletonCard = () => (
  <Card className="w-full">
    <CardContent className="space-y-4 p-4">
      <Skeleton className="w-14 h-14" variant="circular" />
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-2/3 h-3" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-10 h-4" />
      </div>
    </CardContent>
  </Card>
);

const ChecklistSkeleton = () => (
  <div>
    <div className="flex flex-row justify-between items-center md:items-center mb-6">
      <div className="w-full md:w-1/2 space-y-2">
        <Skeleton className="w-64 bg-primary/10 h-7" />
        <Skeleton className="w-80 bg-primary/10 h-5" />
      </div>
      <div className="w-full md:w-1/2 mt-4 md:mt-0 flex justify-end">
        <CircularProgressSkeleton />
      </div>
    </div>
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </div>
  </div>
);

export default ChecklistSkeleton;
