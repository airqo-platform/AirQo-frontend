import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import LocationCard from '@/features/download-insights-locations/components/LocationCard';
import { MdAdd } from 'react-icons/md';

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
          className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary dark:border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md group"
          onClick={() => {
            dispatch(setModalType({ type: 'addLocationForMoreInsights' }));
            dispatch(setOpenModal(true));
          }}
          aria-label="Add locations for analysis"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/30 mb-2 group-hover:bg-primary/30 dark:group-hover:bg-primary/40 transition-colors">
            <MdAdd className="w-6 h-6 text-primary dark:text-primary" />
          </div>
          <span className="text-sm font-medium">Add Location</span>
        </button>
      </div>
    </motion.div>
  );
}

export default memo(Sidebar);
