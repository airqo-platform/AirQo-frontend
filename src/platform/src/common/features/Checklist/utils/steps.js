/**
 * Creates static step definitions
 * @param {Function} handleStepClick - Function to handle step clicks
 * @returns {Array} Array of step objects
 */
export const createSteps = (handleStepClick) => [
  {
    id: 1,
    label: 'Introduction AirQo Analytics demo video',
    description: 'Watch a short video explaining AirQo Analytics features',
    time: '1 min',
    link: '#',
    func: () => handleStepClick(1),
    icon: 'video',
  },
  {
    id: 2,
    label: 'Choose location you are most interested in',
    description: 'Set up your preferred locations for air quality monitoring',
    time: '2 min',
    link: '/analytics',
    func: () => handleStepClick(2),
    icon: 'location',
  },
  {
    id: 3,
    label: 'Complete your AirQo Analytics profile',
    description:
      'Customize your profile settings for a personalized experience',
    time: '4 min',
    link: '/settings',
    func: () => handleStepClick(3),
    icon: 'profile',
  },
  {
    id: 4,
    label: 'Practical ways to reduce air pollution',
    description:
      'Learn actionable steps to improve air quality in your community',
    time: '1 min',
    link: 'https://blog.airqo.net/',
    func: () => handleStepClick(4),
    icon: 'blog',
    isExternal: true,
  },
];

/**
 * Merge API data with static step configuration
 * @param {Array} steps - Static step definitions
 * @param {Array} checklistItems - Checklist items from API/Redux
 * @returns {Array} Merged step objects
 */
export const mergeStepsWithChecklist = (steps, checklistItems) => {
  // Safety check for invalid inputs
  if (!Array.isArray(steps)) {
    console.error('Invalid steps provided to mergeStepsWithChecklist');
    return [];
  }

  // Handle empty or invalid checklist items
  if (
    !checklistItems ||
    !Array.isArray(checklistItems) ||
    checklistItems.length === 0
  ) {
    return steps.map((step) => ({
      ...step,
      _id: null,
      status: 'not started',
      completed: false,
      videoProgress: 0,
      completionDate: null,
    }));
  }

  // Preserve completed state from localStorage if checklist appears to be reset
  const wasPreviouslyCompleted =
    localStorage.getItem('checklistPreviouslyCompleted') === 'true';

  // Check if we might have a data loss situation (previously completed but now empty)
  const possibleDataLoss =
    wasPreviouslyCompleted &&
    checklistItems.every(
      (item) => !item.completed || item.status === 'not started',
    );

  return steps.map((step, index) => {
    // Find corresponding checklist item, or create an empty object
    const checklistItem = checklistItems[index] || {};

    // For MAC users with potential data loss, preserve completed state if previously completed
    const isCompleted = possibleDataLoss
      ? localStorage.getItem(`step-${step.id}-completed`) === 'true'
      : checklistItem.completed || false;

    // If this step is completed, store that info for potential recovery
    if (checklistItem.completed) {
      localStorage.setItem(`step-${step.id}-completed`, 'true');
    }

    return {
      ...step,
      _id: checklistItem._id,
      status: checklistItem.status || 'not started',
      completed: isCompleted,
      videoProgress: checklistItem.videoProgress || 0,
      completionDate: checklistItem.completionDate || null,
      title:
        checklistItem.title && checklistItem.title.trim()
          ? checklistItem.title
          : step.label,
    };
  });
};

/**
 * Helper to check if all steps are completed
 * @param {Array} cards - Checklist items
 * @returns {boolean} - Whether all steps are completed
 */
export const areAllStepsCompleted = (cards) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return false;
  }

  const allCompleted = cards.every((card) => card.completed);

  // Store completion state in localStorage for recovery purposes
  if (allCompleted) {
    localStorage.setItem('checklistPreviouslyCompleted', 'true');
  }

  return allCompleted;
};

/**
 * Get the next incomplete step
 * @param {Array} checklist - Checklist items from API/Redux
 * @param {Array} steps - Static step definitions
 * @returns {Object|null} - Next incomplete step or null if all completed
 */
export const getNextIncompleteStep = (checklist, steps) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  if (!Array.isArray(checklist) || checklist.length === 0) {
    return steps[0];
  }

  const mergedSteps = mergeStepsWithChecklist(steps, checklist);
  return mergedSteps.find((step) => !step.completed) || null;
};

/**
 * Validates checklist data integrity
 * @param {Array} checklist - Checklist items from API/Redux
 * @returns {boolean} - Whether data appears valid
 */
export const validateChecklistData = (checklist) => {
  if (!Array.isArray(checklist)) {
    return false;
  }

  // Check for minimum expected properties
  return checklist.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      item._id &&
      typeof item.status === 'string',
  );
};
