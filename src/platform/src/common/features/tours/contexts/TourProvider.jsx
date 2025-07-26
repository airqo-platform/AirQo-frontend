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
        // --- Action Trigger State ---
        awaitedAction: action.payload.awaitedAction || null, // { type: 'EVENT', payload: '...' }
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
        // --- Reset Action Trigger State ---
        awaitedAction: null,
        actionCompleted: false,
      };
    case 'RESET_TOUR':
      return { ...state, run: false };
    // --- Action Trigger Reducer Case ---
    case 'ACTION_COMPLETED':
      // This action is dispatched when the awaited action is detected
      return {
        ...state,
        actionCompleted: true,
        // Reset awaitedAction so it doesn't trigger again unintentionally
        awaitedAction: null,
      };
    default:
      return state;
  }
};

const initialTourState = {
  run: false,
  currentTourKey: null,
  currentTourType: null, // 'route' or 'global'
  currentTourConfig: null, // Holds the config for the currently running tour
  // --- Action Trigger Initial State ---
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
              tourConfig: config,
              // Pass action trigger if defined in config
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
              tourConfig: config,
              // Pass action trigger if defined in config
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
          globalOnboardingStarted = true; // Mark that global tour was started
        } else if (globalSeen) {
          console.log(
            `TourProvider: Global onboarding tour '${globalKey}' already seen.`,
          );
        }
      }

      // 2. If Global Onboarding wasn't started (or not prioritized), check route tour
      if (!globalOnboardingStarted) {
        const routeConfig = routeTourConfig[pathname];
        if (routeConfig && routeConfig.steps.length > 0) {
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
    [state.run, userId, pathname, prioritizeGlobal], // Add dependencies
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

      // --- Handle Tour Completion/Skip ---
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

      // --- Handle Step Changes (for Action Triggers) ---
      // Example: Pause tour on a step that awaits an action
      if (
        type === 'step:before' &&
        state.awaitedAction &&
        !state.actionCompleted
      ) {
        // Check if the current step requires an action
        // This assumes the step object has metadata like `awaitedAction`
        // You might need to define this logic differently, e.g., check step index or a specific property
        if (
          step.awaitedAction ||
          state.currentTourConfig?.steps[step?.index]?.awaitedAction
        ) {
          console.log(
            'TourProvider: Pausing tour for awaited action:',
            state.awaitedAction,
          );
          // Joyride will automatically pause here if `stepBefore` callback doesn't proceed.
          // You might need to manage Joyride's `run` state or step index manually for complex logic.
          // For now, rely on external action completion.
        }
      }
    },
    [
      state.currentTourKey,
      userId,
      state.awaitedAction,
      state.actionCompleted,
      state.currentTourConfig,
    ], // Add dependencies
  );

  // --- ACTION TRIGGER LISTENER LOGIC (Conceptual) ---
  // This useEffect listens for global events or state changes that might indicate
  // an awaited action was completed.
  useEffect(() => {
    if (!state.run || !state.awaitedAction || state.actionCompleted) {
      // No tour running, no action awaited, or action already completed
      return;
    }

    const handlePotentialAction = (event) => {
      // --- Example: Listen for a Custom Event ---
      if (
        state.awaitedAction.type === 'CUSTOM_EVENT' &&
        event.type === state.awaitedAction.payload
      ) {
        console.log('TourProvider: Detected awaited custom event:', event.type);
        dispatch({ type: 'ACTION_COMPLETED' });
        // Optionally, you might want to resume the tour here or let Joyride handle it
        // based on how you implement the step awaiting logic in the callback.
      }

      // --- Example: Listen for a Redux/Context State Change (requires subscription logic) ---
      // This is pseudo-code, actual implementation depends on your state management
      // if (state.awaitedAction.type === 'STATE_CHANGE' && checkIfStateMatches(state.awaitedAction.payload, currentState)) {
      //    dispatch({ type: 'ACTION_COMPLETED' });
      // }

      // Add more conditions for different action types as needed
    };

    // Attach listeners based on awaitedAction.type
    if (state.awaitedAction.type === 'CUSTOM_EVENT') {
      window.addEventListener(
        state.awaitedAction.payload,
        handlePotentialAction,
      );
    }

    // Add other listener setups here if needed for different action types

    // Cleanup listeners
    return () => {
      if (state.awaitedAction?.type === 'CUSTOM_EVENT') {
        window.removeEventListener(
          state.awaitedAction.payload,
          handlePotentialAction,
        );
      }
      // Remove other listeners here
    };
  }, [state.run, state.awaitedAction, state.actionCompleted]); // Re-run if awaited action changes

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
      disableOverlayClose: true,
    }),
    [effectiveTourConfig.options],
  );

  return (
    <TourContext.Provider
      value={{
        ...state,
        startTourForCurrentPath,
        startGlobalTour,
        attemptStartTours, // Expose the new prioritized starter
        stopTour,
        resetTour,
      }}
    >
      {children}
      {state.run && userId && effectiveTourConfig.steps?.length > 0 && (
        <CustomJoyride
          key={`${state.currentTourKey}-${state.actionCompleted ? 'resumed' : 'initial'}`} // Force re-render if action state changes
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
