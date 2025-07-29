import Card from '@/components/CardWrapper';
import { Skeleton } from '@/common/components/Skeleton';

const SkeletonCard = () => (
  <Card width="w-full" padding="py-8 px-3" contentClassName="space-y-4">
    <Skeleton className="w-14 h-14" variant="circular" />
    <div className="space-y-2">
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-2/3 h-3" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-10 h-4" />
    </div>
  </Card>
);

const ChecklistSkeleton = () => (
  <div>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      {' '}
      <div className="w-full md:w-1/2 space-y-2">
        <Skeleton className="w-64 h-7" />
        <Skeleton className="w-80 h-5" />
      </div>
      <div className="w-full md:w-1/2 mt-4 md:mt-0 flex justify-end">
        <Skeleton
          className="w-24 h-24 border-4 border-gray-200"
          variant="circular"
        />
      </div>
    </div>
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill()
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </div>
  </div>
);

export default ChecklistSkeleton;
