# User Checklist Module

This module provides a complete onboarding checklist solution with the following features:

## Features

- ✅ **Automatic Initialization**: Creates checklist items for new users automatically
- ✅ **Progress Tracking**: Tracks completion status and video progress
- ✅ **Error Handling**: Comprehensive error boundaries and retry mechanisms
- ✅ **Loading States**: Skeleton loading and progress indicators
- ✅ **TypeScript Support**: Fully typed components and hooks
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Session Integration**: Integrates with NextAuth sessions

## Components

### Main Component

- `Checklist` - The main checklist component

### Sub Components

- `ChecklistStepCard` - Individual checklist item card
- `StepProgress` - Circular progress indicator
- `ChecklistSkeleton` - Loading state skeleton

## Hooks

- `useChecklist(userId)` - Get checklist data with initialization handling
- `useUpdateChecklist()` - Update checklist items
- `useInitializeChecklist()` - Initialize checklist for new users
- `useChecklistActions()` - Common checklist actions (mark completed, in progress, etc.)

## Usage

### Basic Usage

```tsx
import { Checklist } from '@/modules/user-checklist';

function OnboardingPage() {
  const handleVideoModal = () => {
    // Open your video modal here
    console.log('Opening video modal...');
  };

  return (
    <div className="p-6">
      <Checklist openVideoModal={handleVideoModal} />
    </div>
  );
}
```

### Advanced Usage with Custom Hooks

```tsx
import {
  useChecklist,
  useChecklistActions,
  ChecklistStepCard,
  StepProgress,
} from '@/modules/user-checklist';

function CustomChecklistPage() {
  const [userId] = useState('user-123');

  const { checklistItems, isLoading, error, refetch } = useChecklist(userId);

  const { markStepCompleted, markStepInProgress, isUpdating } =
    useChecklistActions();

  const handleStepClick = async step => {
    if (step.completed) return;

    try {
      if (step.id === 4) {
        await markStepCompleted(userId, step._id);
      } else {
        await markStepInProgress(userId, step._id);
      }
      await refetch();
    } catch (error) {
      console.error('Failed to update step:', error);
    }
  };

  if (isLoading) {
    return <div>Loading checklist...</div>;
  }

  return (
    <div>
      <StepProgress step={2} totalSteps={4} />

      <div className="grid gap-4">
        {checklistItems.map(item => (
          <ChecklistStepCard
            key={item._id}
            stepItem={item}
            onClick={handleStepClick}
          />
        ))}
      </div>
    </div>
  );
}
```

## Updating Checklist Items

### Single Item Updates

The module provides several methods to update individual checklist items:

```tsx
import { useChecklistActions } from '@/modules/user-checklist';

function MyComponent() {
  const {
    markStepCompleted,
    markStepInProgress,
    updateVideoProgress,
    updateSingleItem,
    isUpdating,
  } = useChecklistActions();

  // Mark a step as completed
  const handleCompleteStep = async (userId: string, itemId: string) => {
    try {
      await markStepCompleted(userId, itemId);
      // The item will be marked as completed with current timestamp
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  // Mark a step as in progress
  const handleStartStep = async (userId: string, itemId: string) => {
    try {
      await markStepInProgress(userId, itemId);
      // Status changes from "not started" to "in progress"
    } catch (error) {
      console.error('Failed to start step:', error);
    }
  };

  // Update video progress (for step 1 - video watching)
  const handleVideoProgress = async (
    userId: string,
    itemId: string,
    progress: number
  ) => {
    try {
      await updateVideoProgress(userId, itemId, progress);
      // Automatically marks as completed when progress reaches 100%
    } catch (error) {
      console.error('Failed to update video progress:', error);
    }
  };

  // Custom update with specific fields
  const handleCustomUpdate = async (userId: string, itemId: string) => {
    try {
      await updateSingleItem(userId, itemId, {
        completed: true,
        status: 'completed',
        completionDate: new Date().toISOString(),
        videoProgress: 100,
      });
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  return (
    <div>
      {isUpdating && <div>Updating checklist...</div>}
      {/* Your UI components */}
    </div>
  );
}
```

### Batch Updates

You can update multiple items at once using the base update function:

```tsx
import { useUpdateChecklist } from '@/modules/user-checklist';

function BatchUpdateExample() {
  const { updateChecklist, isUpdating } = useUpdateChecklist();

  const handleBatchUpdate = async (userId: string) => {
    try {
      await updateChecklist(userId, [
        {
          _id: 'item-1-id',
          completed: true,
          status: 'completed',
          completionDate: new Date().toISOString(),
        },
        {
          _id: 'item-2-id',
          status: 'in progress',
        },
      ]);
    } catch (error) {
      console.error('Batch update failed:', error);
    }
  };

  return (
    <button onClick={() => handleBatchUpdate('user-123')} disabled={isUpdating}>
      Update Multiple Items
    </button>
  );
}
```

### Step-by-Step Update Process

1. **Get the Item ID**: Each checklist item has a unique `_id` field
2. **Choose Update Method**: Use the appropriate method based on your needs
3. **Handle Loading State**: The `isUpdating` flag indicates when updates are in progress
4. **Error Handling**: Always wrap updates in try-catch blocks
5. **Refresh Data**: The hooks automatically refresh data after successful updates

### Important Notes

- ⚠️ **Always use the `_id` field**: Updates require the database ID, not the step number
- 🔄 **Automatic Refresh**: Data is automatically refetched after successful updates
- 🚫 **Loading States**: UI is disabled during updates to prevent race conditions
- 🔐 **Authentication**: All updates require a valid user session
- 📝 **Validation**: The API validates all update requests

## API Integration

The module expects the following API endpoints to be available:

### Get User Checklist

```
GET /users/checklist/{userId}
Response: {
  "success": true,
  "message": "Success",
  "checklists": [{
    "_id": "checklist-id",
    "user_id": "user-123",
    "items": [
      {
        "_id": "item-id-1",
        "title": "Watch the getting started video",
        "completed": false,
        "status": "not started",
        "videoProgress": 0,
        "completionDate": null
      }
    ]
  }]
}
```

### Update User Checklist

```
POST /users/checklist/upsert
Request: {
  "user_id": "string",
  "items": [
    {
      "_id": "string", // Required for existing items
      "title": "string", // Optional - only for new items
      "completed": boolean, // Optional
      "status": "not started" | "in progress" | "completed" | "started", // Optional
      "videoProgress": number, // Optional
      "completionDate": "2023-10-16T10:30:00.000Z" | null // Optional
    }
  ]
}

Response: {
  "success": true,
  "message": "Checklist updated successfully",
  "checklist": {
    "_id": "checklist-id",
    "user_id": "user-123",
    "items": [/* updated items */]
  }
}
```

## Customization

### Step Configuration

You can customize the static steps by modifying the `createSteps()` function in `utils/steps.ts`:

```typescript
export const createSteps = (): Step[] => [
  {
    id: 1,
    title: 'Watch the getting started video',
    description: 'Learn how to navigate and use the platform effectively.',
    link: '#',
    time: '3 min',
    isExternal: false,
  },
  // Add more steps here
];
```

### Styling

The components use Tailwind CSS classes. You can customize the appearance by:

1. Modifying the card styles in `ChecklistStepCard.tsx`
2. Updating the progress indicator colors in `StepProgress.tsx`
3. Customizing the skeleton loading in `ChecklistSkeleton.tsx`

## Edge Cases Handled

1. **First-time users**: Automatically initializes empty checklist
2. **Missing step IDs**: Gracefully handles missing `_id` fields
3. **Network errors**: Retry logic with exponential backoff
4. **Session changes**: Reacts to user session changes
5. **Invalid data**: Type-safe data handling with fallbacks
6. **Concurrent updates**: Optimistic updates with rollback on error

## Error Recovery

The module includes comprehensive error handling:

- **API errors**: Shows retry button with automatic recovery
- **Component errors**: Error boundary prevents app crashes
- **Network issues**: Automatic retries with user feedback
- **Data inconsistencies**: Fallback to static step data

## Dependencies

- `next-auth/react` - For session management
- `@airqo/icons-react` - For the check icon
- `@/shared/components/ui/*` - For base UI components
- `@/shared/hooks/*` - For API integration hooks
- `@/shared/services/*` - For API services

## Type Safety

The module is fully TypeScript compliant with proper type definitions for:

- Checklist items and user data
- API request/response types
- Component props and hook return values
- Error states and loading states

This ensures a robust development experience with compile-time error detection.
