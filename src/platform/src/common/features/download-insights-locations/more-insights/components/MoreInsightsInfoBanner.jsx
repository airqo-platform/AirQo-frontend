import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SelectionMessage from '@/features/download-insights-locations/components/SelectionMessage';
import { useLocalStorage } from '@/core/hooks/useOptimizedHooks';

const MoreInsightsInfoBanner = ({ visibleSitesCount, sitesPerPage }) => {
  const [hasSeenBanner, setHasSeenBanner] = useLocalStorage(
    'moreInsightsInfoBannerSeen',
    false,
  );

  const handleCloseBanner = () => {
    setHasSeenBanner(true);
  };

  // Only show for large datasets and first-time users
  const shouldShowBanner = !hasSeenBanner && visibleSitesCount > sitesPerPage;

  if (!shouldShowBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <SelectionMessage type="info" onClear={handleCloseBanner}>
          <div className="space-y-2">
            <p className="font-medium text-sm">
              📊 Large Dataset Visualization
            </p>
            <p className="text-xs leading-relaxed">
              You&apos;ve selected <strong>{visibleSitesCount} sites</strong>{' '}
              for analysis. To optimize chart readability, we&apos;re showing{' '}
              <strong>{sitesPerPage} sites per page</strong>.
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
              <p>
                • Use <strong>pagination controls</strong> below to navigate
                through sites
              </p>
              <p>
                • Adjust <strong>&quot;Sites per page&quot;</strong> to show
                more/fewer sites on the chart
              </p>
              <p>
                • Sites with{' '}
                <strong className="text-green-600">green borders</strong> are
                currently visualized
              </p>
              <p>• Toggle sites on/off using the sidebar checkboxes</p>
              <p>
                • If a selected site does not appear on the chart, try adjusting
                the time period or frequency so its data falls within the
                selected range
              </p>
            </div>
          </div>
        </SelectionMessage>
      </motion.div>
    </AnimatePresence>
  );
};

export default MoreInsightsInfoBanner;
