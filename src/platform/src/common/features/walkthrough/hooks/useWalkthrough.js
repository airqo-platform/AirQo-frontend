import { useCallback } from 'react';
import { useWalkthroughContext } from '../components/WalkthroughProvider';
import { validateSteps } from '../utils/validation';

export default function useWalkthrough() {
  const context = useWalkthroughContext();

  const startTour = useCallback(
    (steps, configuration = {}) => {
      const validationResult = validateSteps(steps);
      if (!validationResult.isValid) {
        console.error('Invalid tour steps:', validationResult.errors);
        return false;
      }
      context.startTour(steps, configuration);
      return true;
    },
    [context],
  );

  const addStep = useCallback(
    (step, index) => {
      const newSteps = [...context.steps];
      if (typeof index === 'number') {
        newSteps.splice(index, 0, step);
      } else {
        newSteps.push(step);
      }
      context.startTour(newSteps, context.configuration);
    },
    [context],
  );

  const removeStep = useCallback(
    (stepId) => {
      const newSteps = context.steps.filter((step) => step.id !== stepId);
      context.startTour(newSteps, context.configuration);
    },
    [context],
  );

  const updateStep = useCallback(
    (stepId, updates) => {
      const newSteps = context.steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step,
      );
      context.startTour(newSteps, context.configuration);
    },
    [context],
  );

  return {
    isActive: context.isActive,
    currentStep: context.currentStep,
    currentStepData: context.steps[context.currentStep],
    steps: context.steps,
    totalSteps: context.steps.length,
    configuration: context.configuration,
    isLoading: context.isLoading,
    error: context.error,
    tourId: context.tourId,
    startTour,
    endTour: context.endTour,
    nextStep: context.nextStep,
    previousStep: context.previousStep,
    goToStep: context.goToStep,
    addStep,
    removeStep,
    updateStep,
    isFirstStep: context.currentStep === 0,
    isLastStep: context.currentStep === context.steps.length - 1,
    canGoNext: context.currentStep < context.steps.length - 1,
    canGoPrevious: context.currentStep > 0,
  };
}
