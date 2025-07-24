import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import LocationCard from '@/features/download-insights-locations/components/LocationCard';

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  item: { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } },
};

function Sidebar({
  allSites,
  visibleSites,
  dataLoadingSites,
  isValidating,
  handleSiteAction,
}) {
  const dispatch = useDispatch();
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className="space-y-3 p-4 h-full"
    >
      {allSites.map((site) => (
        <motion.div
          key={site._id}
          variants={variants.item}
          transition={{ duration: 0.2 }}
        >
          <LocationCard
            site={site}
            onToggle={() => handleSiteAction(site._id, 'toggle')}
            isSelected={visibleSites.includes(site._id)}
            isLoading={
              isValidating &&
              dataLoadingSites.includes(site._id) &&
              !visibleSites.includes(site._id)
            }
            disableToggle={
              dataLoadingSites.length <= 1 &&
              dataLoadingSites.includes(site._id)
            }
          />
        </motion.div>
      ))}

      {/* Add locations button at the end of the list */}
      <div className="flex justify-center mt-4">
        <button
          className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md group"
          onClick={() => {
            dispatch(setModalType({ type: 'addLocationForMoreInsights' }));
            dispatch(setOpenModal(true));
          }}
          aria-label="Add locations for analysis"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <span className="text-sm font-medium">Add Location</span>
        </button>
      </div>
    </motion.div>
  );
}

export default memo(Sidebar);
