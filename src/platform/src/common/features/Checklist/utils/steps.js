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

// Merge API data with static step configuration
export const mergeStepsWithChecklist = (steps, checklistItems) => {
  if (!checklistItems || checklistItems.length === 0) {
    return steps.map((step) => ({
      ...step,
      _id: null,
      status: 'not started',
      completed: false,
      videoProgress: 0,
      completionDate: null,
    }));
  }

  return steps.map((step, index) => {
    const checklistItem = checklistItems[index] || {};

    return {
      ...step,
      _id: checklistItem._id,
      status: checklistItem.status || 'not started',
      completed: checklistItem.completed || false,
      videoProgress: checklistItem.videoProgress || 0,
      completionDate: checklistItem.completionDate || null,
      title:
        checklistItem.title && checklistItem.title.trim()
          ? checklistItem.title
          : step.label,
    };
  });
};

// Helper to check if all steps are completed
export const areAllStepsCompleted = (cards) =>
  cards && cards.length > 0 && cards.every((card) => card.completed);

// Get the next incomplete step
export const getNextIncompleteStep = (checklist, steps) => {
  if (!checklist || checklist.length === 0) return steps[0];

  const mergedSteps = mergeStepsWithChecklist(steps, checklist);
  return mergedSteps.find((step) => !step.completed) || null;
};
