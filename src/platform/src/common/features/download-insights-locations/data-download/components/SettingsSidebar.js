import {
  AqSliders02,
  AqWind01,
  AqClockFastForward,
  AqFileCheck02,
  AqAlertTriangle,
} from '@airqo/icons-react';
import { MdDevices } from 'react-icons/md';

import CustomFields from './CustomFields';
import { motion } from 'framer-motion';

import {
  POLLUTANT_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
  DEVICE_CATEGORY_OPTIONS,
} from '../constants';

/**
 * SettingsSidebar component for DataDownload
 */
const SettingsSidebar = ({
  formData,
  handleOptionSelect,
  edit,
  filteredDataTypeOptions,
  durationGuidance,
  handleTitleChange,
  sidebarBg = '#f6f6f7',
  activeFilterKey, // Add this prop to determine current filter
}) => {
  // Animation variants for sidebar
  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-[240px] h-full relative space-y-3 px-5 pt-5 pb-14 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto overflow-x-hidden"
      style={{ backgroundColor: sidebarBg }}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Form Fields - Remove form wrapper to prevent auto-submission */}
      <motion.div className="space-y-4">
        <motion.div variants={formItemVariants}>
          <div className="mb-2">
            <label className="block text-sm font-medium dark:text-white mb-2">
              Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 dark:bg-transparent dark:border-gray-700 rounded-xl focus:outline-none focus:ring-primary"
              value={formData.title.name}
              onChange={handleTitleChange}
              autoFocus
              disabled={edit}
              onKeyDown={(e) => {
                // Prevent Enter key from triggering form submission
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Device categories"
            options={DEVICE_CATEGORY_OPTIONS}
            id="deviceCategory"
            icon={<MdDevices size={16} />}
            defaultOption={formData.deviceCategory}
            handleOptionSelect={handleOptionSelect}
            disabled={activeFilterKey !== 'devices'} // Disable unless devices filter is active
            edit={activeFilterKey === 'devices'} // Only allow editing when devices filter is active
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Data type"
            options={filteredDataTypeOptions}
            id="dataType"
            icon={<AqSliders02 size={16} />}
            defaultOption={formData.dataType}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Pollutants (multi-select)"
            options={POLLUTANT_OPTIONS}
            id="pollutant"
            icon={<AqWind01 size={16} />}
            defaultOption={formData.pollutant}
            multiSelect={true}
            textFormat="capitalize"
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Duration"
            id="duration"
            useCalendar
            required={true}
            requiredText={`${!formData.duration ? 'please select a date range' : ''}`}
            defaultOption={formData.duration}
            handleOptionSelect={handleOptionSelect}
          />

          {durationGuidance && (
            <div className="text-xs text-blue-600 mt-2 ">
              {durationGuidance}
            </div>
          )}

          {/* Warning Banner for Large Data Downloads */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <AqAlertTriangle
                  size={16}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Download Limit Notice</p>
                <p>
                  Annual data downloads must be done in batches. Please select
                  shorter date ranges for optimal performance.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Frequency"
            options={FREQUENCY_OPTIONS}
            id="frequency"
            icon={<AqClockFastForward size={16} />}
            defaultOption={formData.frequency}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="File type"
            options={FILE_TYPE_OPTIONS}
            id="fileType"
            icon={<AqFileCheck02 size={16} />}
            defaultOption={formData.fileType}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsSidebar;
