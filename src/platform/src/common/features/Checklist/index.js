// Main component
export { default as Checklist } from './components/Checklist';

// Utils
export {
  createSteps,
  mergeStepsWithChecklist,
  areAllStepsCompleted,
  getNextIncompleteStep,
} from './utils/steps';
