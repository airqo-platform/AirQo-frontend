import React from 'react';
import { motion } from 'framer-motion';
import InfoMessage from '@/components/Messages/InfoMessage';
import LocationCard from '../../components/LocationCard';
import { sidebarVariants, itemVariants } from '../animations';

export const SidebarContent = ({
  loading,
  filteredSites,
  sidebarSites,
  handleToggleSite,
  selectedSites,
}) => {
  if (loading) {
    return (
      <div className="text-gray-500 w-full text-sm h-auto flex flex-col justify-start items-center space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="animate-pulse h-10 w-full bg-gray-200 rounded"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  if (!filteredSites.length) {
    return (
      <InfoMessage
        title="No data available"
        description="The system couldn't retrieve location data. Please try again later."
        variant="info"
      />
    );
  }

  if (sidebarSites.length === 0) {
    return (
      <InfoMessage
        title="No locations selected"
        description="Select a location from the table to add it here."
        variant="info"
      />
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {sidebarSites.map((site) => (
        <motion.div key={site._id} variants={itemVariants} layout>
          <LocationCard
            site={site}
            onToggle={() => handleToggleSite(site)}
            isLoading={false}
            isSelected={selectedSites.some((s) => s._id === site._id)}
            disableToggle={false}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
