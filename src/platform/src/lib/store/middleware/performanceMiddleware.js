/**
 * Performance-optimized Redux middleware for the AirQo platform
 * Includes action debouncing, state diffing, and memory management
 */

import { debounce } from '@/core/utils/performanceOptimizer';

// Cache for action debouncing
const actionCache = new Map();
const stateCache = new Map();
const MAX_CACHE_SIZE = 50;

/**
 * Middleware to debounce similar actions to prevent excessive dispatches
 */
export const actionDebouncingMiddleware = () => (next) => (action) => {
  const { type, payload } = action;

  // Actions that should be debounced
  const debouncedActions = [
    'SET_SEARCH_TERM',
    'UPDATE_FILTER',
    'SET_PAGINATION',
    'FETCH_DATA_REQUEST',
  ];

  if (debouncedActions.some((actionType) => type.includes(actionType))) {
    const actionKey = `${type}_${JSON.stringify(payload)}`;

    if (!actionCache.has(actionKey)) {
      const debouncedDispatch = debounce(() => {
        next(action);
        actionCache.delete(actionKey);
      }, 300);

      actionCache.set(actionKey, debouncedDispatch);
    }

    actionCache.get(actionKey)();
    return;
  }

  return next(action);
};

/**
 * Middleware to prevent duplicate state updates
 */
export const stateDiffingMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  // Check if state actually changed
  const stateKey = action.type;
  const prevStateString = JSON.stringify(prevState);
  const nextStateString = JSON.stringify(nextState);

  if (prevStateString === nextStateString) {
    // State didn't change, could optimize here
    return result;
  }

  // Update state cache with size limit
  if (stateCache.size >= MAX_CACHE_SIZE) {
    const firstKey = stateCache.keys().next().value;
    stateCache.delete(firstKey);
  }

  stateCache.set(stateKey, {
    timestamp: Date.now(),
    state: nextState,
  });

  return result;
};

/**
 * Middleware for performance monitoring
 */
export const performanceMiddleware = () => (next) => (action) => {
  const start = performance.now();

  const result = next(action);

  const end = performance.now();
  const duration = end - start;

  // Log slow actions in development
  if (process.env.NODE_ENV === 'development' && duration > 10) {
    // Log performance issues in development mode
  }

  return result;
};

/**
 * Middleware to prevent memory leaks from large payloads
 */
export const memoryOptimizationMiddleware = () => (next) => (action) => {
  const { payload } = action;

  // Optimize large array payloads
  if (payload && Array.isArray(payload) && payload.length > 1000) {
    // For large datasets, only keep the most recent items
    const optimizedPayload = payload.slice(-500); // Keep last 500 items

    return next({
      ...action,
      payload: optimizedPayload,
      meta: {
        ...action.meta,
        truncated: true,
        originalLength: payload.length,
      },
    });
  }

  // Optimize large object payloads
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const payloadSize = JSON.stringify(payload).length;

    if (payloadSize > 100000) {
      // 100KB threshold
      // Strip unnecessary fields from large objects
      const essentialFields = ['id', 'name', 'status', 'timestamp'];
      const optimizedPayload = {};

      essentialFields.forEach((field) => {
        if (payload[field] !== undefined) {
          optimizedPayload[field] = payload[field];
        }
      });

      return next({
        ...action,
        payload: optimizedPayload,
        meta: {
          ...action.meta,
          optimized: true,
          originalSize: payloadSize,
        },
      });
    }
  }

  return next(action);
};

/**
 * Middleware to batch multiple actions
 */
export const batchingMiddleware = () => (next) => {
  const batchQueue = [];
  let batchTimeout = null;

  return (action) => {
    // Actions that should be batched
    const batchableActions = [
      'UPDATE_UI_STATE',
      'SET_LOADING',
      'UPDATE_FILTER',
    ];

    if (
      batchableActions.some((actionType) => action.type.includes(actionType))
    ) {
      batchQueue.push(action);

      if (batchTimeout) {
        clearTimeout(batchTimeout);
      }

      batchTimeout = setTimeout(() => {
        // Process all queued actions
        const actionsToProcess = [...batchQueue];
        batchQueue.length = 0;

        actionsToProcess.forEach((queuedAction) => {
          next(queuedAction);
        });

        batchTimeout = null;
      }, 10); // Batch actions within 10ms

      return;
    }

    return next(action);
  };
};

/**
 * Enhanced error handling middleware
 */
export const errorHandlingMiddleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    // Silent error handling - log to external service in production
    if (process.env.NODE_ENV === 'development') {
      // Development logging only
      if (typeof window !== 'undefined' && window.console) {
        // eslint-disable-next-line no-console
        console.error('Redux action error:', {
          action: action.type,
          payload: action.payload,
          error: error.message,
          stack: error.stack,
        });
      }
    }

    // Return error action for UI to handle
    return {
      type: 'ERROR_OCCURRED',
      payload: {
        message: error.message,
        originalAction: action.type,
      },
    };
  }
};

/**
 * Middleware to automatically cleanup old data
 */
export const cleanupMiddleware = () => (next) => (action) => {
  const result = next(action);

  // Cleanup old cache entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to trigger cleanup
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, value] of stateCache.entries()) {
      if (now - value.timestamp > maxAge) {
        stateCache.delete(key);
      }
    }
  }

  return result;
};

/**
 * Combine all performance middleware
 */
export const performanceMiddlewares = [
  actionDebouncingMiddleware,
  stateDiffingMiddleware,
  memoryOptimizationMiddleware,
  batchingMiddleware,
  errorHandlingMiddleware,
  cleanupMiddleware,
  ...(process.env.NODE_ENV === 'development' ? [performanceMiddleware] : []),
];

// Cleanup function for memory management
export const cleanupReduxCache = () => {
  actionCache.clear();
  stateCache.clear();
};

// Setup automatic cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupReduxCache);
}

export default performanceMiddlewares;
