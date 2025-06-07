import CalibrateIcon from '@/icons/Analytics/calibrateIcon';
import FileTypeIcon from '@/icons/Analytics/fileTypeIcon';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import WindIcon from '@/icons/Analytics/windIcon';
import CustomFields from '../CustomFields';
import { motion } from 'framer-motion';

import {
  POLLUTANT_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
} from '../../constants';

/**
 * SettingsSidebar component for DataDownload
 */
const SettingsSidebar = ({
  formData,
  handleOptionSelect,
  edit,
  filteredDataTypeOptions,
  durationGuidance,
  handleSubmit,
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
    <motion.form
      className="w-[280px] h-full min-h-[400px] max-h-[658px] relative space-y-3 px-5 pt-5 pb-14 border-r dark:border-gray-700 flex-shrink-0 overflow-y-auto overflow-x-hidden"
      style={{ backgroundColor: sidebarBg }}
      onSubmit={handleSubmit}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Form Fields */}
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
            />
          </div>
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Data type"
            options={filteredDataTypeOptions}
            id="dataType"
            icon={<CalibrateIcon />}
            defaultOption={formData.dataType}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Pollutant"
            options={POLLUTANT_OPTIONS}
            id="pollutant"
            icon={<WindIcon />}
            defaultOption={formData.pollutant}
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
            <div className="text-xs text-blue-600 -mt-2 ml-1">
              {durationGuidance}
            </div>
          )}
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Frequency"
            options={FREQUENCY_OPTIONS}
            id="frequency"
            icon={<FrequencyIcon />}
            defaultOption={formData.frequency}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="File type"
            options={FILE_TYPE_OPTIONS}
            id="fileType"
            icon={<FileTypeIcon />}
            defaultOption={formData.fileType}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>
      </motion.div>
    </motion.form>
  );
};

export default SettingsSidebar;
