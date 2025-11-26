import React, { memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { useSelector } from 'react-redux';
import { FILTER_TYPES } from '@/common/features/download-insights-locations/data-download/constants';
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
  visibleSiteIds = [],
  dataLoadingSites,
  isValidating,
  handleSiteAction,
  currentPage,
}) {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state) => state.modal || {});
  const sidebarRef = useRef(null);

  // Auto-scroll to visualized sites when pagination changes
  useEffect(() => {
    if (visibleSiteIds.length > 0 && sidebarRef.current) {
      // Find the first visualized site card
      const firstVisualizedSiteId = visibleSiteIds[0];
      const siteCard = sidebarRef.current.querySelector(
        `[data-site-id="${firstVisualizedSiteId}"]`,
      );

      if (siteCard) {
        // Smooth scroll to the first visualized site
        siteCard.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }
  }, [currentPage, visibleSiteIds]);

  return (
    <motion.div
      ref={sidebarRef}
      variants={variants}
      initial="hidden"
      animate="visible"
      className="space-y-3 p-4 h-full overflow-y-auto"
    >
      {allSites.map((site) => (
        <motion.div
          key={site._id}
          variants={variants.item}
          transition={{ duration: 0.2 }}
          data-site-id={site._id}
        >
          <LocationCard
            site={site}
            onToggle={() => handleSiteAction(site._id, 'toggle')}
            isSelected={visibleSites.includes(site._id)}
            isVisualized={visibleSiteIds.includes(site._id)}
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
      {/* Hide Add Location button when More Insights visualization is active for devices */}
      {!(
        modalType?.type === 'inSights' &&
        modalType?.filterType === FILTER_TYPES.DEVICES
      ) && (
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
      )}
    </motion.div>
  );
}

export default memo(Sidebar);
