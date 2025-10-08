import React from 'react';
import CustomDropdown from '@/components/Button/CustomDropdown';
import ChartDropdownMenu from './ChartDropdownMenu';

const ChartHeader = ({
  title,
  showTitle = true,
  isDark,
  showSkeleton,
  chartContentRef,
  onRefresh,
  isRefreshing,
  onExportStart,
  onExportComplete,
  onExportError,
  dropdownRef,
  className = '',
}) => {
  if (!showTitle) return null;

  const getTitleColor = () => {
    return isDark ? '#F9FAFB' : '#1F2937';
  };

  const getDropdownButtonStyle = () => ({
    fontSize: '0.875rem',
    padding: '0.3rem 0.5rem',
    background: 'transparent',
    color: getTitleColor(),
    border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    transition: 'all 0.2s ease-in-out',
  });

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      <h3
        className="text-lg font-medium truncate pr-4"
        style={{ color: getTitleColor() }}
        title={title}
      >
        {title}
      </h3>

      <div ref={dropdownRef} className="flex-shrink-0">
        <CustomDropdown
          text="More"
          dropdownAlign="right"
          dropdownWidth="180px"
          buttonStyle={getDropdownButtonStyle()}
          loading={showSkeleton}
          disabled={showSkeleton}
          className="chart-header-dropdown"
        >
          <ChartDropdownMenu
            chartContentRef={chartContentRef}
            chartTitle={title}
            isDark={isDark}
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
            onExportStart={onExportStart}
            onExportComplete={onExportComplete}
            onExportError={onExportError}
          />
        </CustomDropdown>
      </div>
    </div>
  );
};

export default React.memo(ChartHeader);
