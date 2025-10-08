import { useMemo } from 'react';
import { MESSAGE_TYPES, MAX_LOCATIONS } from '../constants';

/**
 * Derives footer message & type from current state.
 */
export const useFooterInfo = ({
  selectionError,
  statusMessage,
  messageType,
  selectedSites,
}) =>
  useMemo(() => {
    if (selectionError)
      return { message: selectionError, type: MESSAGE_TYPES.ERROR };
    if (statusMessage) return { message: statusMessage, type: messageType };

    if (selectedSites.length === 0) {
      return {
        message: 'Please select at least one location to save',
        type: MESSAGE_TYPES.WARNING,
      };
    }
    if (selectedSites.length === MAX_LOCATIONS) {
      return {
        message: `Maximum of ${MAX_LOCATIONS} locations selected`,
        type: MESSAGE_TYPES.WARNING,
      };
    }
    return {
      message: `${selectedSites.length} ${
        selectedSites.length === 1 ? 'location' : 'locations'
      } selected`,
      type: MESSAGE_TYPES.INFO,
    };
  }, [selectionError, statusMessage, messageType, selectedSites]);
