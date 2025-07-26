import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { TOUR_ACTIONS } from '../utils/constants';

const WalkthroughContext = createContext();

const initialState = {
  isActive: false,
  currentStep: 0,
  steps: [],
  configuration: {},
  isLoading: false,
  error: null,
  tourId: null,
};

function walkthroughReducer(state, action) {
  switch (action.type) {
    case TOUR_ACTIONS.START_TOUR:
      return {
        ...state,
        isActive: true,
        currentStep: 0,
        steps: action.payload.steps,
        configuration: action.payload.configuration,
        tourId: action.payload.tourId,
        error: null,
      };
    case TOUR_ACTIONS.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.steps.length - 1),
      };
    case TOUR_ACTIONS.PREVIOUS_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };
    case TOUR_ACTIONS.GO_TO_STEP:
      return {
        ...state,
        currentStep: Math.max(
          0,
          Math.min(action.payload, state.steps.length - 1),
        ),
      };
    case TOUR_ACTIONS.END_TOUR:
      return {
        ...initialState,
      };
    case TOUR_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case TOUR_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

export default function WalkthroughProvider({
  children,
  defaultConfiguration = {},
}) {
  const [state, dispatch] = useReducer(walkthroughReducer, initialState);

  const startTour = useCallback(
    (steps, configuration = {}) => {
      const tourId = `tour-${Date.now()}`;
      const mergedConfig = { ...defaultConfiguration, ...configuration };
      dispatch({
        type: TOUR_ACTIONS.START_TOUR,
        payload: { steps, configuration: mergedConfig, tourId },
      });
    },
    [defaultConfiguration],
  );

  const nextStep = useCallback(() => {
    dispatch({ type: TOUR_ACTIONS.NEXT_STEP });
  }, []);

  const previousStep = useCallback(() => {
    dispatch({ type: TOUR_ACTIONS.PREVIOUS_STEP });
  }, []);

  const goToStep = useCallback((stepIndex) => {
    dispatch({ type: TOUR_ACTIONS.GO_TO_STEP, payload: stepIndex });
  }, []);

  const endTour = useCallback(() => {
    dispatch({ type: TOUR_ACTIONS.END_TOUR });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: TOUR_ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: TOUR_ACTIONS.SET_ERROR, payload: error });
  }, []);

  const value = {
    ...state,
    startTour,
    nextStep,
    previousStep,
    goToStep,
    endTour,
    setLoading,
    setError,
  };

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
}

WalkthroughProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultConfiguration: PropTypes.object,
};

export function useWalkthroughContext() {
  const context = useContext(WalkthroughContext);
  if (!context) {
    throw new Error(
      'useWalkthroughContext must be used within a WalkthroughProvider',
    );
  }
  return context;
}
