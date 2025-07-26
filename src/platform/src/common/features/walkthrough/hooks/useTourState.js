import { useState, useCallback, useRef } from 'react';

export default function useTourState(initialState = {}) {
  const [state, setState] = useState({
    isActive: false,
    currentStep: 0,
    steps: [],
    configuration: {},
    ...initialState,
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const updateState = useCallback((updates) => {
    setState((prevState) => {
      const newState = { ...prevState, ...updates };
      stateRef.current = newState;
      return newState;
    });
  }, []);
  const resetState = useCallback(() => {
    const resetState = {
      isActive: false,
      currentStep: 0,
      steps: [],
      configuration: {},
      ...initialState,
    };
    setState(resetState);
    stateRef.current = resetState;
  }, [initialState]);
  const getCurrentState = useCallback(() => stateRef.current, []);
  return {
    state,
    updateState,
    resetState,
    getCurrentState,
  };
}
