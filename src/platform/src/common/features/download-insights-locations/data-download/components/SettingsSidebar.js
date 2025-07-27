import {
  AqSliders02,
  AqWind01,
  AqClockFastForward,
  AqFileCheck02,
} from '@airqo/icons-react';

import CustomFields from './CustomFields';
import { motion } from 'framer-motion';

import {
  POLLUTANT_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
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
