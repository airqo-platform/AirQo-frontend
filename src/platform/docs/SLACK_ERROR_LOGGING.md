# Slack Error Notification System

## Overview

Production-ready error logging system that sends critical errors to Slack channel `#notifs-airqo-analytics-web` with built-in deduplication and rate limiting.

## Architecture

### 1. **Logger Service** (`src/shared/lib/logger.ts`)

Centralized logging service built on top of `loglevel` with Slack integration.

**Features:**

- ✅ Error deduplication (5-minute window)
- ✅ Rate limiting (max 5 errors per minute)
- ✅ Automatic cache cleanup
- ✅ Environment-aware log levels (debug in dev, warn in prod)

**Usage:**

```typescript
import logger from '@/shared/lib/logger';

// Regular logging
logger.error('Something went wrong', error);

// Critical error with Slack notification
logger.critical('Critical database error', error, { userId: '123' });

// Error with Slack notification + custom context
logger.errorWithSlack('API failed', error, { endpoint: '/api/data' });
```

### 2. **Error Boundary** (`src/shared/components/ErrorBoundary.tsx`)

Catches React component errors and automatically sends critical ones to Slack.

**Critical Error Patterns:**

- TypeError
- ReferenceError
- SyntaxError
- RangeError
- ChunkLoadError
- NetworkError

### 3. **Slack API Route** (`src/app/api/slack/notify/route.ts`)

Server-side endpoint that handles Slack webhook calls.

**Payload Format:**

```typescript
{
  error: {
    name: string;
    message: string;
    stack: string;
  },
  errorInfo?: {
    componentStack: string;
  },
  timestamp: string;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, unknown>;
}
```

## Testing

### Development Environment

Navigate to `/user/home` and look for the **"🔧 Test Slack"** button (only visible in development mode).

**Test Steps:**

1. Click "🔧 Test Slack" button
2. Check Slack channel: `#notifs-airqo-analytics-web`
3. Verify message appears with proper formatting

### Production Environment

The system automatically captures and reports:

- Unhandled React component errors
- Critical JavaScript errors
- Network failures
- Code chunk loading errors

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Rate Limiting

- **Max errors per minute:** 5
- **Deduplication window:** 5 minutes
- **Cache cleanup:** Automatic

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// For regular errors (no Slack notification)
logger.error('Failed to load user data', error);

// For critical errors (sends to Slack)
logger.critical('Database connection lost', error);
```

### 2. Add Context to Errors

```typescript
logger.critical('Payment processing failed', error, {
  orderId: order.id,
  amount: order.total,
  userId: user.id,
});
```

### 3. Avoid Logging Sensitive Data

```typescript
// ❌ Bad
logger.critical('Auth failed', error, { password: user.password });

// ✅ Good
logger.critical('Auth failed', error, { userId: user.id, email: user.email });
```

## Deduplication Logic

Errors are deduplicated based on:

- Error name
- Error message
- First line of stack trace

This prevents spam when the same error occurs multiple times in quick succession.

## Slack Message Format

```
🚨 Critical Error Alert

Error Type: TypeError
Time: Nov 26, 2025, 10:30:45 AM
URL: https://analytics.airqo.net/user/home
Source: ErrorBoundary

Error Message:
Cannot read property 'map' of undefined

Stack Trace:
```

TypeError: Cannot read property 'map' of undefined
at Component.render (app.tsx:45)
at finishClassComponent (react-dom.js:123)

```

Component Stack:
```

    in DataTable
    in ErrorBoundary
    in App

```

Environment: production | Browser: Mozilla/5.0...
```

## Maintenance

### Adjusting Rate Limits

Edit `src/shared/lib/logger.ts`:

```typescript
const MAX_ERRORS_PER_MINUTE = 10; // Increase limit
const ERROR_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

### Adding New Critical Error Patterns

Edit `src/shared/components/ErrorBoundary.tsx`:

```typescript
const criticalPatterns = [
  'TypeError',
  'CustomCriticalError', // Add your pattern
];
```

## Monitoring

Check Slack channel `#notifs-airqo-analytics-web` for:

- Error frequency trends
- Common error patterns
- User-impacting issues

## Troubleshooting

### No messages in Slack

1. Verify webhook URL in `.env.local`
2. Check browser console for API errors
3. Verify rate limiting isn't blocking messages
4. Check Slack webhook is active

### Too many notifications

1. Review rate limiting settings
2. Check for error loops in code
3. Increase deduplication window

### Missing stack traces

Ensure source maps are enabled in production for better error tracking.
