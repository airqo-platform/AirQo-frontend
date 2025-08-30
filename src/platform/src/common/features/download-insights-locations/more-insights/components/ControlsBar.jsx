import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import ReusableDropdown from '@/components/Button/DownloadDropdown';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import { Tooltip } from 'flowbite-react';
import {
  AqRefreshCcw02,
  AqLineChartUp01,
  AqClockFastForward,
  AqDatabase01,
  AqZap,
  AqDownload02,
} from '@airqo/icons-react';
import { TIME_OPTIONS, CHART_TYPE } from '../constants/options';

const variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const DATA_TYPE_OPTIONS = [
  {
    label: 'Calibrated Data',
    value: 'calibrated',
    description: 'Processed and validated data',
    icon: AqDatabase01,
  },
  {
    label: 'Raw Data',
    value: 'raw',
    description: 'Unprocessed sensor readings',
    icon: AqZap,
  },
];

function ControlsBar({
  frequency,
  setFrequency,
  chartType,
  setChartType,
  dateRange,
  setDateRange,
  handleManualRefresh,
  isValidating,
  download,
  downloadLoading,
  visibleSites,
  isMobile,
  sitesPerPage,
  setSitesPerPage,
  currentPage,
  setCurrentPage,
}) {
  const handleDateChange = useCallback(
    (start, end, label) => {
      if (start && end)
        setDateRange({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          label,
        });
    },
    [setDateRange],
  );

  return (
    <motion.div
      variants={variants}
      className="flex flex-row flex-wrap w-full justify-between gap-2"
    >
      <div className="flex flex-wrap gap-2 items-center">
        <CustomDropdown
          dropdownWidth="150px"
          icon={
            window.innerWidth < 640 ? (
              <AqClockFastForward size={16} />
            ) : undefined
          }
          text={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
        >
          {TIME_OPTIONS.map((opt) => (
            <DropdownItem
              key={opt}
              onClick={() => setFrequency(opt)}
              active={frequency === opt}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </DropdownItem>
          ))}
        </CustomDropdown>

        <CustomCalendar
          initialStartDate={new Date(dateRange.startDate)}
          initialEndDate={new Date(dateRange.endDate)}
          onChange={handleDateChange}
          horizontalOffset={isMobile ? 0 : 60}
          dropdown
          enableTimePicker={isMobile ? false : true}
          showTimePickerToggle={isMobile ? false : true}
        />

        <CustomDropdown
          dropdownWidth="150px"
          icon={
            window.innerWidth < 640 ? <AqLineChartUp01 size={16} /> : undefined
          }
          text={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
        >
          {CHART_TYPE.map((opt) => (
            <DropdownItem
              key={opt.id}
              onClick={() => setChartType(opt.id)}
              active={chartType === opt.id}
            >
              {opt.name}
            </DropdownItem>
          ))}
        </CustomDropdown>

        <Tooltip content="Refresh data">
          <button
            onClick={handleManualRefresh}
            disabled={isValidating}
            className="p-1 md:p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isValidating ? (
              <AqRefreshCcw02 className="animate-spin" />
            ) : (
              <AqRefreshCcw02 />
            )}
          </button>
        </Tooltip>
      </div>

      <div>
        {/* <DownloadDropdown
          onDownload={download}
          downloadLoading={downloadLoading}
          visibleSites={visibleSites}
          disabled={!visibleSites.length}
        /> */}

        <ReusableDropdown
          options={DATA_TYPE_OPTIONS}
          onSelect={download}
          loading={downloadLoading}
          disabled={!visibleSites.length}
          buttonText={downloadLoading ? 'Downloading...' : 'Download Data'}
          loadingText="Downloading..."
          showCount={true}
          countValue={visibleSites.length}
          tooltip={
            visibleSites.length > 0
              ? 'Download data for selected sites'
              : 'No sites selected for download'
          }
          showTooltipOnDisabled={true}
          icon={AqDownload02}
          buttonVariant="primary"
          size="md"
          closeOnSelect={true}
        />
        {/* Sites per page control for More Insights visualization */}
        <div className="inline-flex items-center ml-3">
          <label className="text-sm mr-2">Sites per page</label>
          <select
            value={sitesPerPage}
            onChange={(e) => {
              setSitesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
            aria-label="Sites per page"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <div className="ml-2 text-sm text-gray-600">({visibleSites.length})</div>
        </div>
        {/* Simple pagination */}
        <div className="inline-flex items-center ml-3">
          {/** Compute total pages for pagination */}
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={visibleSites.length}
            pageSize={sitesPerPage}
          />
        </div>
      </div>
    </motion.div>
  );
}

function PaginationControls({ currentPage, setCurrentPage, totalItems, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / (pageSize || 10)));

  return (
    <div className="inline-flex items-center border rounded-md overflow-hidden">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-2 py-1 border-r disabled:opacity-50"
        aria-label="Previous page"
      >
        Prev
      </button>
      <div className="px-3 py-1 text-sm">{currentPage} / {totalPages}</div>
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage >= totalPages}
        className="px-2 py-1 border-l disabled:opacity-50"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

export default memo(ControlsBar);
