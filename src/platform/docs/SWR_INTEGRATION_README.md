# SWR Integration for Authentication Services

This document explains how to use the SWR (SWR: React Hooks for Data Fetching) integration with the authentication services.

## Overview

SWR provides powerful caching, revalidation, and synchronization capabilities for React applications. The authentication services now include SWR hooks for:

- **Mutations**: Login, register, forgot password, reset password (POST/PUT requests)
- **Data Fetching**: User details, user roles (GET requests with caching)
- **Cache Management**: Invalidation and optimistic updates

## Available Hooks

### Authentication Mutations

```typescript
import { useLogin, useRegister, useForgotPassword, useResetPassword } from '@/shared/hooks/useAuth';

// Login
const { trigger: login, isMutating: isLoggingIn } = useLogin();
await login({ userName: 'user@example.com', password: 'password' });

// Register
const { trigger: register, isMutating: isRegistering } = useRegister();
await register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password',
  category: 'individual'
});

// Forgot Password
const { trigger: forgotPassword } = useForgotPassword();
await forgotPassword({ email: 'user@example.com' });

// Reset Password
const { trigger: resetPassword } = useResetPassword();
await resetPassword({ password: 'newpassword', resetPasswordToken: 'token' });
```

### Data Fetching with Caching

```typescript
import { useUserDetails, useUserRoles } from '@/shared/hooks/useAuth';

// User Details (requires userId)
const { data: userDetails, error, isLoading } = useUserDetails(userId);

// User Roles (no parameters needed)
const { data: userRoles, error, isLoading } = useUserRoles();
```

### Cache Management

```typescript
import { useMutateUserData } from '@/shared/hooks/useAuth';

const { invalidateUserData, updateUserDetails } = useMutateUserData();

// Invalidate all user-related cache (useful after logout)
invalidateUserData();

// Optimistic update (update cache immediately without API call)
updateUserDetails(userId, { firstName: 'New Name' });
```

## SWR Configuration

### Default Settings

- **revalidateOnFocus**: `false` - Don't revalidate when window regains focus
- **revalidateOnReconnect**: `true` - Revalidate when network reconnects
- **dedupingInterval**: 5000ms (user details), 10000ms (user roles)
- **errorRetryCount**: 2 - Retry failed requests up to 2 times

### Cache Keys

- Login: `'auth/login'`
- Register: `'auth/register'`
- Forgot Password: `'auth/forgot-password'`
- Reset Password: `'auth/reset-password'`
- User Details: `'user/details/{userId}'`
- User Roles: `'user/roles'`

## Usage Patterns

### Basic Authentication Flow

```typescript
const LoginComponent = () => {
  const { trigger: login, isMutating } = useLogin();
  const { data: userDetails } = useUserDetails(userId);
  const { invalidateUserData } = useMutateUserData();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // User details will be automatically cached when fetched
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    // Clear all cached user data
    invalidateUserData();
  };

  return (
    // Your login UI
  );
};
```

### Optimistic Updates

```typescript
const ProfileComponent = () => {
  const { updateUserDetails } = useMutateUserData();

  const handleUpdateProfile = (userId, newData) => {
    // Update cache immediately for instant UI feedback
    updateUserDetails(userId, newData);

    // Then make the actual API call
    // The cache will be updated with real data when the API responds
  };
};
```

### Error Handling

```typescript
const UserProfile = ({ userId }) => {
  const { data, error, isLoading } = useUserDetails(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {data?.users[0]?.firstName}!</div>;
};
```

## Benefits

1. **Automatic Caching**: User data is cached and reused across components
2. **Background Revalidation**: Data stays fresh without user interaction
3. **Optimistic Updates**: UI updates immediately, then syncs with server
4. **Request Deduplication**: Multiple components requesting same data share one request
5. **Error Recovery**: Automatic retries for failed requests
6. **Type Safety**: Full TypeScript support with proper typing

## Integration with NextAuth

The SWR hooks work seamlessly with NextAuth:

- Authentication mutations trigger NextAuth session updates
- User data fetching uses session tokens automatically
- Cache invalidation on logout clears both SWR and NextAuth caches

## Best Practices

1. **Use mutations for write operations** (login, register, etc.)
2. **Use data fetching hooks for read operations** (user details, roles)
3. **Invalidate cache after logout** to prevent stale data
4. **Use optimistic updates** for better UX on profile changes
5. **Handle loading and error states** in your components
6. **Consider cache invalidation** after important state changes

## Example Component

See `src/shared/components/AuthExample.tsx` for a complete working example of all hooks in action.