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
        title="No Sites Selected"
        description="Select sites to view chart data."
        variant="info"
        className="w-full h-full flex items-center justify-center"
      />
    );

  if (!seriesKeys.length)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
        <MdSearchOff className="text-5xl mb-3" />
        <h4 className="mb-2 text-lg font-semibold">No Data Available</h4>
        <p className="text-center">
          We couldn’t find any data matching your current selections.
        </p>
      </div>
    );

  if (!refreshChart) return null;
  return (
    <InfoMessage
      title="No Data"
      description="Try refreshing or adjusting filters."
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
