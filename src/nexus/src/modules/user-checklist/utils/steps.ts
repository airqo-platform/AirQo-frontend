interface Step {
  id: number;
  title: string;
  description: string;
  link: string;
  time: string;
  isExternal?: boolean;
}

export const createSteps = (): Step[] => [
  {
    id: 1,
    title: 'Introduction AirQo Analytics demo video',
    description: 'Watch a short video explaining AirQo Analytics features',
    link: '#',
    time: '3 min',
    isExternal: false,
  },
  {
    id: 2,
    title: 'Choose location you are most interested in',
    description: 'Set up your preferred locations for air quality monitoring',
    link: '/user/favorites',
    time: '5 min',
    isExternal: false,
  },
  {
    id: 3,
    title: 'Complete your AirQo Analytics profile',
    description:
      'Customize your profile settings for a personalized experience',
    link: '/user/profile',
    time: '10 min',
    isExternal: false,
  },
  {
    id: 4,
    title: 'Practical ways to reduce air pollution',
    description:
      'Learn actionable steps to improve air quality in your community',
    link: 'https://blog.airqo.net/',
    time: '8 min',
    isExternal: true,
  },
];

import type {
  ChecklistStepItem,
  ChecklistItem as APIChecklistItem,
} from '../types';

export const mergeStepsWithChecklist = (
  staticSteps: Step[],
  checklist: APIChecklistItem[]
): ChecklistStepItem[] => {
  if (!Array.isArray(checklist) || checklist.length === 0) {
    // Return static steps with index-based IDs when no checklist data
    return staticSteps.map((step, index) => ({
      ...step,
      _id: `temp-${index}`, // Use temporary index-based ID
      completed: false,
      status: 'not started' as const,
      videoProgress: 0,
      completionDate: null,
    }));
  }

  const merged = staticSteps.map((step, index) => {
    // Since API doesn't return individual item IDs, use index for identification
    const checklistItem = checklist[index];

    if (checklistItem) {
      // Use index as the ID since API items don't have individual _id fields
      const itemId = `item-${index}`;

      return {
        ...step,
        _id: itemId, // Use index-based ID
        // Use static step title if API title is empty
        title:
          checklistItem.title && checklistItem.title.trim()
            ? checklistItem.title
            : step.title,
        completed: checklistItem.completed || false,
        // Normalize status values from API
        status: (() => {
          const apiStatus = checklistItem.status || 'not started';
          // Handle different status formats from API (cast to string to allow comparison with API formats)
          const statusStr = apiStatus as string;
          if (statusStr === 'inProgress' || statusStr === 'in progress') {
            return 'in progress' as const;
          }
          if (statusStr === 'notStarted' || statusStr === 'not started') {
            return 'not started' as const;
          }
          if (statusStr === 'completed') {
            return 'completed' as const;
          }
          if (statusStr === 'started') {
            return 'started' as const;
          }
          return 'not started' as const;
        })(),
        videoProgress: checklistItem.videoProgress || 0,
        completionDate: checklistItem.completionDate || null,
      };
    }

    // Return static step with index-based ID if no matching checklist item
    return {
      ...step,
      _id: `temp-${index}`,
      completed: false,
      status: 'not started' as const,
      videoProgress: 0,
      completionDate: null,
    };
  });

  return merged;
};

export const initializeChecklistTemplate = () => {
  const staticSteps = createSteps();

  return staticSteps.map(step => ({
    id: step.id,
    taskId: step.id,
    title: step.title,
    description: step.description,
    completed: false,
    status: 'not started',
    videoProgress: 0,
    completionDate: null,
    link: step.link,
    time: step.time,
    isExternal: step.isExternal || false,
  }));
};
