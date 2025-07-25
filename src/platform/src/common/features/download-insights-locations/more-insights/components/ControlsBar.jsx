import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import Button from '@/components/Button';
import { Tooltip } from 'flowbite-react';
import {
  AqDownload02,
  AqRefreshCcw02,
  AqLineChartUp01,
  AqClockFastForward,
} from '@airqo/icons-react';
import { TIME_OPTIONS, CHART_TYPE } from '../constants/options';

const variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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
        <Tooltip
          content={
            !visibleSites.length
              ? 'Select at least one site'
              : `Download (${visibleSites.length})`
          }
        >
          <Button
            onClick={download}
            disabled={downloadLoading}
            Icon={<AqDownload02 />}
          >
            {downloadLoading
              ? 'Downloading...'
              : `Download ${visibleSites.length ? `(${visibleSites.length})` : 'Data'}`}
          </Button>
        </Tooltip>
      </div>
    </motion.div>
  );
}

export default memo(ControlsBar);
