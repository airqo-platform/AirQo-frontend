const DashboardPageSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Welcome Section Skeleton */}
    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-80"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Growth Analytics Skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-12 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Role Distribution Skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-8"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DashboardPageSkeleton;
