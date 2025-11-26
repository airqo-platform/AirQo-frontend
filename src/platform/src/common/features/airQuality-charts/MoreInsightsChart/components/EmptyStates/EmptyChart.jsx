import { MdSearchOff, MdRefresh } from 'react-icons/md';
import InfoMessage from '@/components/Messages/InfoMessage';
import Button from '@/components/Button';

export default function EmptyChart({
  normalizedSelectedIds,
  seriesKeys,
  refreshChart,
  isRefreshing,
  handleRefresh,
}) {
  if (!normalizedSelectedIds.length)
    return (
      <InfoMessage
        title="Select Sites to Continue"
        description="Please select one or more sites to display chart information."
        variant="info"
        className="w-full h-full flex items-center justify-center"
      />
    );

  if (!seriesKeys.length)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
        <MdSearchOff className="text-5xl mb-3" />
        <h4 className="mb-2 text-lg font-semibold">Unable to Display Chart</h4>
        <p className="text-center">
          We couldn’t retrieve information for your current selections. Please
          try again in a few moments or adjust your filters.
        </p>
      </div>
    );

  if (!refreshChart) return null;
  return (
    <InfoMessage
      title="Chart Not Available"
      description="You can try refreshing or adjusting your selections to load the chart."
      action={
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 disabled:opacity-50 flex items-center"
        >
          <MdRefresh className="mr-1" /> Refresh
        </Button>
      }
      variant="info"
      className="w-full h-full flex items-center justify-center"
    />
  );
}
