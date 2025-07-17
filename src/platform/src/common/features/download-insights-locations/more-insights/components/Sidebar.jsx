import React, { memo } from 'react';
import { motion } from 'framer-motion';
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
    </motion.div>
  );
}

export default memo(Sidebar);
