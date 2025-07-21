import React from 'react';
import MoreInsightsChart from '../../MoreInsightsChart';
import SkeletonLoader from '../components/SkeletonLoader';
import ChartErrorOverlay from './ChartErrorOverlay';

const ChartContentWrapper = ({
  chartContentRef,
  data,
  chartSites,
  chartType,
  timeFrame,
  id,
  pollutionType,
  onRefresh,
  isRefreshing,
  error,
  showSkeleton,
  chartStyle,
  className = '',
}) => {
  const renderContent = () => {
    if (showSkeleton) {
      return (
        <SkeletonLoader width={chartStyle.width} height={chartStyle.height} />
      );
    }

    return (
      <div
        ref={chartContentRef}
        className="w-full h-full chart-content"
        style={chartStyle}
      >
        <MoreInsightsChart
          data={data}
          selectedSites={chartSites}
          chartType={chartType}
          frequency={timeFrame}
          id={id}
          pollutantType={pollutionType}
          refreshChart={onRefresh}
          isRefreshing={isRefreshing}
          width="100%"
          height="100%"
        />
      </div>
    );
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <ChartErrorOverlay
        error={error}
        onRetry={onRefresh}
        isDark={false} // This should be passed as prop
      />
      {renderContent()}
    </div>
  );
};

export default React.memo(ChartContentWrapper);
