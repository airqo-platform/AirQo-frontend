'use client';
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useSession } from 'next-auth/react';
import CustomJoyride from '@/features/tours/components/CustomJoyride';
import { usePathname } from 'next/navigation';
import {
  routeTourConfig,
  globalTourConfig,
  standalonePopupConfig,
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
        currentTourType: action.payload.tourType || 'route', // 'route', 'global', or 'standalone'
        currentTourConfig: action.payload.tourConfig || null,
        awaitedAction: action.payload.awaitedAction || null,
        actionCompleted: false,
      };
    case 'STOP_TOUR':
    case 'TOUR_ENDED':
      return {
        ...state,
        run: false,
        currentTourKey: null,
        currentTourType: null,
        currentTourConfig: null,
        awaitedAction: null,
        actionCompleted: false,
      };
    case 'RESET_TOUR':
      return { ...state, run: false };
    case 'ACTION_COMPLETED':
      return {
        ...state,
        actionCompleted: true,
        awaitedAction: null,
      };
    default:
      return state;
  }
};

const initialTourState = {
  run: false,
  currentTourKey: null,
  currentTourType: null, // 'route', 'global', or 'standalone'
  currentTourConfig: null,
  awaitedAction: null,
  actionCompleted: false,
};

export const TourProvider = ({
  children,
  allowRestart = false,
  prioritizeGlobal = true,
}) => {
  const [state, dispatch] = useReducer(tourReducer, initialTourState);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // --- START TOUR FUNCTIONS ---

  const startTourForCurrentPath = useCallback(
    ({ force = false } = {}) => {
      const config = routeTourConfig[pathname];
      if (config && config.steps?.length > 0) {
        // Check steps array
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
              tourConfig: config,
              awaitedAction: config.awaitedAction || null,
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

  const startGlobalTour = useCallback(
    (tourKey, { force = false } = {}) => {
      const config = globalTourConfig[tourKey];
      if (config && config.steps?.length > 0) {
        // Check steps array
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
              tourConfig: config,
              awaitedAction: config.awaitedAction || null,
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

  // --- NEW: START STANDALONE POPUP ---
  const startStandalonePopup = useCallback(
    (popupKey, { force = false } = {}) => {
      const config = standalonePopupConfig[popupKey];
      if (config && config.step) {
        // Check for single step object
        if (!userId) {
          console.warn(
            `TourProvider: User ID not available for standalone popup '${popupKey}'.`,
          );
          return;
        }
        // Use a different storage key prefix for popups to separate them from tours
        const popupSeenKey = `popup_${popupKey}`;
        const seen = tourStorage.isTourSeen(popupSeenKey, userId); // Reuse storage function
        if (force || (!seen && !state.run)) {
          console.log(
            `TourProvider: Showing standalone popup '${popupKey}' for user '${userId}'.`,
          );
          // Wrap the single step in an array for CustomJoyride
          const popupConfig = {
            ...config,
            steps: [config.step], // Convert single step to steps array
          };
          dispatch({
            type: 'START_TOUR',
            payload: {
              tourKey: popupKey,
              tourType: 'standalone', // New type
              tourConfig: popupConfig,
              awaitedAction: config.step.awaitedAction || null, // Check step for action
            },
          });
        } else if (seen) {
          console.log(
            `TourProvider: Standalone popup '${popupKey}' already shown for user '${userId}'.`,
          );
        } else if (state.run) {
          console.log(
            `TourProvider: A tour/popup is already running for user '${userId}'.`,
          );
        }
      } else {
        console.warn(
          `TourProvider: Standalone popup '${popupKey}' not found or has no step.`,
        );
      }
    },
    [state.run, userId],
  );

  // --- ENHANCED START LOGIC: Prioritize Global Tours ---
  const attemptStartTours = useCallback(
    ({ force = false } = {}) => {
      if (state.run) {
        console.log(
          'TourProvider: A tour is already running, skipping auto-start checks.',
        );
        return;
      }

      if (!userId) {
        console.warn(
          'TourProvider: User ID not available, cannot check tours.',
        );
        return;
      }

      const globalOnboardingConfig = globalTourConfig['globalOnboarding'];
      let globalOnboardingStarted = false;

      // 1. Check and start Global Onboarding if eligible and prioritized
      if (prioritizeGlobal && globalOnboardingConfig) {
        const globalKey = globalOnboardingConfig.key;
        const globalSeen = tourStorage.isTourSeen(globalKey, userId);
        if (force || (!globalSeen && !state.run)) {
          console.log(
            `TourProvider: Prioritizing and starting global onboarding tour '${globalKey}'.`,
          );
          dispatch({
            type: 'START_TOUR',
            payload: {
              tourKey: globalKey,
              tourType: 'global',
              tourConfig: globalOnboardingConfig,
              awaitedAction: globalOnboardingConfig.awaitedAction || null,
            },
          });
          globalOnboardingStarted = true;
        } else if (globalSeen) {
          console.log(
            `TourProvider: Global onboarding tour '${globalKey}' already seen.`,
          );
        }
      }

      // 2. If Global Onboarding wasn't started, check route tour
      if (!globalOnboardingStarted) {
        const routeConfig = routeTourConfig[pathname];
        if (routeConfig && routeConfig.steps?.length > 0) {
          const routeKey = routeConfig.key;
          const routeSeen = tourStorage.isTourSeen(routeKey, userId);
          if (force || (!routeSeen && !state.run)) {
            console.log(
              `TourProvider: Starting route tour '${routeKey}' for path '${pathname}'.`,
            );
            dispatch({
              type: 'START_TOUR',
              payload: {
                tourKey: routeKey,
                tourType: 'route',
                tourConfig: routeConfig,
                awaitedAction: routeConfig.awaitedAction || null,
              },
            });
          } else if (routeSeen) {
            console.log(
              `TourProvider: Route tour '${routeKey}' already seen for path '${pathname}'.`,
            );
          }
        }
      }
    },
    [state.run, userId, pathname, prioritizeGlobal],
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
      const { status, type, step } = data;

      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        console.log('TourProvider: Tour/Popup truly finished or skipped.');
        const finishedTourKey = state.currentTourKey;
        const finishedTourType = state.currentTourType; // Get the type
        dispatch({ type: 'TOUR_ENDED' });
        if (finishedTourKey && userId) {
          // If it was a standalone popup, mark it with a different key
          if (finishedTourType === 'standalone') {
            const popupSeenKey = `popup_${finishedTourKey}`;
            tourStorage.markTourAsSeen(popupSeenKey, userId);
          } else {
            // Standard tour
            tourStorage.markTourAsSeen(finishedTourKey, userId);
          }
        } else if (finishedTourKey && !userId) {
          console.warn(
            `TourProvider: Tour/Popup '${finishedTourKey}' finished, but user ID not available.`,
          );
        }
      }

      // --- Handle Step Changes (for Action Triggers) ---
      if (
        type === 'step:before' &&
        state.awaitedAction &&
        !state.actionCompleted
      ) {
        if (
          step.awaitedAction ||
          state.currentTourConfig?.steps?.[step?.index]?.awaitedAction
        ) {
          console.log(
            'TourProvider: Current step awaits an action:',
            state.awaitedAction,
          );
        }
      }
    },
    [
      state.currentTourKey,
      userId,
      state.awaitedAction,
      state.actionCompleted,
      state.currentTourConfig,
      state.currentTourType,
    ], // Add type dependency
  );

  // --- ACTION TRIGGER LISTENER LOGIC ---
  useEffect(() => {
    if (!state.run || !state.awaitedAction || state.actionCompleted) {
      return;
    }

    const handlePotentialAction = (event) => {
      if (
        state.awaitedAction.type === 'CUSTOM_EVENT' &&
        event.type === state.awaitedAction.payload
      ) {
        console.log('TourProvider: Detected awaited custom event:', event.type);
        dispatch({ type: 'ACTION_COMPLETED' });
      }
    };

    if (state.awaitedAction.type === 'CUSTOM_EVENT') {
      window.addEventListener(
        state.awaitedAction.payload,
        handlePotentialAction,
      );
    }

    return () => {
      if (state.awaitedAction?.type === 'CUSTOM_EVENT') {
        window.removeEventListener(
          state.awaitedAction.payload,
          handlePotentialAction,
        );
      }
    };
  }, [state.run, state.awaitedAction, state.actionCompleted]);

  // --- DETERMINE CURRENT TOUR CONFIGURATION ---

  const routeBasedTourConfig = useMemo(
    () => routeTourConfig[pathname] || { steps: [], options: {} },
    [pathname],
  );

  const effectiveTourConfig = state.currentTourConfig || routeBasedTourConfig;

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
        ...state,
        startTourForCurrentPath,
        startGlobalTour,
        startStandalonePopup, // Expose new function
        attemptStartTours,
        stopTour,
        resetTour,
      }}
    >
      {children}
      {state.run && userId && effectiveTourConfig.steps?.length > 0 && (
        <CustomJoyride
          key={`${state.currentTourKey}-${state.actionCompleted ? 'resumed' : 'initial'}`}
          steps={effectiveTourConfig.steps}
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

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
