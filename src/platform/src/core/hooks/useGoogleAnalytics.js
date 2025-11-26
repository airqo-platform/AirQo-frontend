import logger from '@/lib/logger';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const event = ({ action, category, label, value }) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
      });
    }
  } catch (error) {
    logger.error('Google Analytics event error:', error);
  }
};
