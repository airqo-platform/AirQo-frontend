'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import CustomJoyride from '@/features/tours/components/CustomJoyride';
import { usePathname } from 'next/navigation';
import { tourConfig } from '@/features/tours/config/tourSteps';
import { STATUS } from 'react-joyride';
import * as tourStorage from '@/features/tours/utils/tourStorage';

// --- Context Setup ---
export const TourContext = createContext(undefined);

// --- Reducer for Tour State ---
const tourReducer = (state, action) => {
  switch (action.type) {
    case 'START_TOUR':
      return { ...state, run: true, currentTourKey: action.payload.tourKey };
    case 'STOP_TOUR':
    case 'TOUR_ENDED':
      return { ...state, run: false, currentTourKey: null };
    case 'RESET_TOUR':
      return { ...state, run: false };
    default:
      return state;
  }
};

const initialTourState = {
  run: false,
  currentTourKey: null,
};

// --- Provider Component ---
export const TourProvider = ({ children, allowRestart = false }) => {
  const [state, dispatch] = useReducer(tourReducer, initialTourState);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const startTourForCurrentPath = useCallback(
    ({ force = false } = {}) => {
      const config = tourConfig[pathname];

      if (config && config.steps.length > 0) {
        const tourKey = config.key;

        if (!userId) {
          console.warn(
            `TourProvider: User ID not available. Cannot check if tour '${tourKey}' was seen.`,
          );
          return;
        }

        const seen = tourStorage.isTourSeen(tourKey, userId);

        if (force || (!seen && !state.run)) {
          console.log(
            `TourProvider: Starting tour '${tourKey}' for path '${pathname}' for user '${userId}'.`,
          );
          dispatch({ type: 'START_TOUR', payload: { tourKey } });
        } else if (seen && !allowRestart) {
          console.log(
            `TourProvider: Tour '${tourKey}' already seen for user '${userId}'. Not starting.`,
          );
        } else if (state.run) {
          console.log(
            `TourProvider: Tour '${tourKey}' already running for user '${userId}'.`,
          );
        }
      }
    },
    [pathname, state.run, userId, allowRestart],
  );

  const stopTour = useCallback(() => {
    console.log('TourProvider: stopTour called');
    dispatch({ type: 'STOP_TOUR' });
  }, []);

  const resetTour = useCallback(() => {
    dispatch({ type: 'RESET_TOUR' });
  }, []);

  // Internal handler for Joyride lifecycle events
  const handleJoyrideCallback = useCallback(
    (data) => {
      const { status } = data;

      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        console.log('TourProvider: Tour truly finished or skipped.');
        const finishedTourKey = state.currentTourKey;
        dispatch({ type: 'TOUR_ENDED' });

        if (finishedTourKey && userId) {
          tourStorage.markTourAsSeen(finishedTourKey, userId);
        } else if (finishedTourKey && !userId) {
          console.warn(
            `TourProvider: Tour '${finishedTourKey}' finished, but user ID not available. Not marking as seen.`,
          );
        }
      }
      // If you need to handle other events like STEP_AFTER in the future,
      // you can destructure 'type' here:
      // const { status, type } = data;
      // if (type === 'step:after') { ... }
    },
    [state.currentTourKey, userId],
  );

  // Get steps and options for the current path
  const currentTourConfig = tourConfig[pathname] || { steps: [], options: {} };

  // Ensure disableOverlayClose is always true for tours started by this provider
  // Use defaults from tourConfig if they exist, then enforce disableOverlayClose
  const enforcedOptions = {
    continuous: true,
    showSkipButton: true,
    showProgress: true,
    disableOverlayClose: true,
    ...currentTourConfig.options,
    disableOverlayClose: true,
  };

  return (
    <TourContext.Provider
      value={{ ...state, startTourForCurrentPath, stopTour, resetTour }}
    >
      {children}
      {state.run && userId && currentTourConfig.steps.length > 0 && (
        <CustomJoyride
          steps={currentTourConfig.steps}
          run={state.run}
          callback={handleJoyrideCallback}
          continuous={enforcedOptions.continuous}
          showSkipButton={enforcedOptions.showSkipButton}
          showProgress={enforcedOptions.showProgress}
          disableOverlayClose={enforcedOptions.disableOverlayClose}
          {...(() => {
            const { ...restOptions } = enforcedOptions;
            return restOptions;
          })()}
        />
      )}
    </TourContext.Provider>
  );
};

// --- Hook to use the Tour Context ---
export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

/* Usage Example */
// Destructure the functions you need from the tour context
/*
  import { useTour } from '@/features/tours/contexts/TourProvider';

  const { startTourForCurrentPath, run } = useTour();

  useEffect(() => {
    // Check if the tour is not already running to prevent conflicts
    if (!run) {
      // Optional: Add a small delay to ensure the page content (targets) is fully rendered
      const timer = setTimeout(() => {
        console.log("AnalyticsPage: Attempting to start tour for /user/analytics");
        
        // Call startTourForCurrentPath. It will automatically:
        // 1. Check the current pathname (/user/analytics)
        // 2. Find the corresponding tour config in tourSteps.js (analyticsTour)
        // 3. Get the user ID from the session
        // 4. Check localStorage to see if this user has already seen this tour
        // 5. If not seen (and conditions are met), it will start the tour
        
        // Use { force: true } if you want to start the tour regardless of localStorage
        // (useful for testing or resetting)
        startTourForCurrentPath(); // Default: respects localStorage check
        // startTourForCurrentPath({ force: true }); // Forces start, ignores localStorage

      }, 1500); // 1.5 second delay, adjust as needed

      // Cleanup function to clear the timeout if the component unmounts
      // before the timer finishes (e.g., user navigates away quickly)
      return () => {
        console.log("AnalyticsPage: Cleaning up tour start timer");
        clearTimeout(timer);
      };
    } else {
      console.log("AnalyticsPage: Tour is already running, skipping auto-start.");
    }
  }, [startTourForCurrentPath, run]); 

*/
