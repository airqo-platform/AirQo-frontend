'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
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
    },
    [state.currentTourKey, userId],
  );

  const currentTourConfig = tourConfig[pathname] || { steps: [], options: {} };

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
          {...currentTourConfig.options}
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

// Example on how we shall use this custom tool
// const { startTourForCurrentPath, run } = useTour();

//   useEffect(() => {
//     if (!run) {
//       const timer = setTimeout(() => {
//         console.log('HomePage: Requesting tour start for /user/Home');
//         // Call without force to respect localStorage check
//         startTourForCurrentPath(); // { force: true } to override seen check (e.g., for dev/testing)
//       }, 1000); // Adjust delay as needed

//       return () => clearTimeout(timer);
//     }
//   }, [startTourForCurrentPath, run]);
