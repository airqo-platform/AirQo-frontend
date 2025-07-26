'use client';
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import { useSession } from 'next-auth/react';
import CustomJoyride from '@/features/tours/components/CustomJoyride';
import { usePathname } from 'next/navigation';
import {
  routeTourConfig,
  globalTourConfig,
} from '@/features/tours/config/tourSteps';
import { STATUS } from 'react-joyride';
import * as tourStorage from '@/features/tours/utils/tourStorage';

export const TourContext = createContext(undefined);

const tourReducer = (state, action) => {
  switch (action.type) {
    case 'START_TOUR':
      return {
        ...state,
        run: true,
        currentTourKey: action.payload.tourKey,
        currentTourType: action.payload.tourType || 'route', // 'route' or 'global'
        currentTourConfig: action.payload.tourConfig || null, // Store the full config
      };
    case 'STOP_TOUR':
    case 'TOUR_ENDED':
      return {
        ...state,
        run: false,
        currentTourKey: null,
        currentTourType: null,
        currentTourConfig: null,
      };
    case 'RESET_TOUR':
      return { ...state, run: false };
    default:
      return state;
  }
};

const initialTourState = {
  run: false,
  currentTourKey: null,
  currentTourType: null, // 'route' or 'global'
  currentTourConfig: null, // Holds the config for the currently running tour
};

export const TourProvider = ({ children, allowRestart = false }) => {
  const [state, dispatch] = useReducer(tourReducer, initialTourState);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // --- START TOUR FUNCTIONS ---

  // Starts a tour based on the current route (existing logic)
  const startTourForCurrentPath = useCallback(
    ({ force = false } = {}) => {
      const config = routeTourConfig[pathname];
      if (config && config.steps.length > 0) {
        const tourKey = config.key;
        if (!userId) {
          console.warn(
            `TourProvider: User ID not available for route tour '${tourKey}'.`,
          );
          return;
        }
        const seen = tourStorage.isTourSeen(tourKey, userId);
        if (force || (!seen && !state.run)) {
          console.log(
            `TourProvider: Starting route tour '${tourKey}' for path '${pathname}' for user '${userId}'.`,
          );
          dispatch({
            type: 'START_TOUR',
            payload: {
              tourKey,
              tourType: 'route',
              tourConfig: config, // Pass the full config
            },
          });
        } else if (seen && !allowRestart) {
          console.log(
            `TourProvider: Route tour '${tourKey}' already seen for user '${userId}'.`,
          );
        } else if (state.run) {
          console.log(
            `TourProvider: A tour is already running for user '${userId}'.`,
          );
        }
      }
    },
    [pathname, state.run, userId, allowRestart],
  );

  // Starts a global tour by its key
  const startGlobalTour = useCallback(
    (tourKey, { force = false } = {}) => {
      const config = globalTourConfig[tourKey];
      if (config && config.steps.length > 0) {
        if (!userId) {
          console.warn(
            `TourProvider: User ID not available for global tour '${tourKey}'.`,
          );
          return;
        }
        const seen = tourStorage.isTourSeen(tourKey, userId);
        if (force || (!seen && !state.run)) {
          console.log(
            `TourProvider: Starting global tour '${tourKey}' for user '${userId}'.`,
          );
          dispatch({
            type: 'START_TOUR',
            payload: {
              tourKey,
              tourType: 'global',
              tourConfig: config, // Pass the full config
            },
          });
        } else if (seen && !allowRestart) {
          console.log(
            `TourProvider: Global tour '${tourKey}' already seen for user '${userId}'.`,
          );
        } else if (state.run) {
          console.log(
            `TourProvider: A tour is already running for user '${userId}'.`,
          );
        }
      } else {
        console.warn(
          `TourProvider: Global tour '${tourKey}' not found or has no steps.`,
        );
      }
    },
    [state.run, userId, allowRestart],
  );

  // --- CONTROL FUNCTIONS ---

  const stopTour = useCallback(() => {
    console.log('TourProvider: stopTour called');
    dispatch({ type: 'STOP_TOUR' });
  }, []);

  const resetTour = useCallback(() => {
    dispatch({ type: 'RESET_TOUR' });
  }, []);

  // --- JOYRIDE CALLBACK ---

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
            `TourProvider: Tour '${finishedTourKey}' finished, but user ID not available.`,
          );
        }
      }
    },
    [state.currentTourKey, userId],
  );

  // --- DETERMINE CURRENT TOUR CONFIGURATION ---

  // Get config for route-based tours (used as fallback if one starts automatically)
  const routeBasedTourConfig = useMemo(
    () => routeTourConfig[pathname] || { steps: [], options: {} },
    [pathname],
  );

  // Determine the config for the tour that should be rendered
  // Priority: 1. Currently running tour (from state), 2. Route-based tour (if auto-started in the future)
  const effectiveTourConfig = state.currentTourConfig || routeBasedTourConfig;

  // Ensure critical options are enforced for the running tour
  const enforcedOptions = useMemo(
    () => ({
      continuous: true,
      showSkipButton: true,
      showProgress: true,
      disableOverlayClose: true,
      ...effectiveTourConfig.options,
      disableOverlayClose: true, // Always enforce
    }),
    [effectiveTourConfig.options],
  );

  return (
    <TourContext.Provider
      value={{
        ...state, // Includes run, currentTourKey, currentTourType, currentTourConfig
        startTourForCurrentPath,
        startGlobalTour, // Expose the new function
        stopTour,
        resetTour,
      }}
    >
      {children}
      {state.run && userId && effectiveTourConfig.steps?.length > 0 && (
        <CustomJoyride
          key={state.currentTourKey} // Force re-mount on tour change
          steps={effectiveTourConfig.steps}
          run={state.run}
          callback={handleJoyrideCallback}
          continuous={enforcedOptions.continuous}
          showSkipButton={enforcedOptions.showSkipButton}
          showProgress={enforcedOptions.showProgress}
          disableOverlayClose={enforcedOptions.disableOverlayClose}
          // Spread any remaining options from the tour config
          {...(() => {
            const { ...restOptions } = enforcedOptions;
            return restOptions;
          })()}
        />
      )}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
