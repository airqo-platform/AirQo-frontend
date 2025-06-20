# Organization Auth Pages Debug Guide

## Fixed: Organization Loading Flash Issue

### Issue

- "Organization does not exist" message flashing briefly before login form shows
- Race conditions in organization loading causing UI glitches

### Solution Applied

1. **Minimum Loading Time**: Added 400ms minimum loading time to prevent UI flashing
2. **Initialization State**: Added `organizationInitialized` flag to track when loading is complete
3. **Race Condition Prevention**: Added `loadingOrgSlugRef` to prevent overlapping requests
4. **Conservative Error Display**: Only show errors after initialization is complete

### Technical Changes

#### UnifiedGroupProvider.jsx

- Added `organizationInitialized` state and context field
- Added `loadingOrgSlugRef` to track current loading operations
- Implemented minimum loading duration (400ms)
- Added race condition protection in organization loading effect
- Updated error display logic to wait for initialization

#### AuthLayout.jsx

- Updated to check both `isLoading` and `!isInitialized` before rendering content
- Added `isInitialized` to loading conditions to prevent premature error display

### Debugging Steps

### 1. Check Browser Console

When visiting `/org/[slug]/login`, look for these log messages:

- "Organization context detected: { pathname, orgSlug, isOrgContext }"
- "Loading organization data for slug: [slug]"
- "Organization data loaded successfully: { name, slug }"

### 2. Check Network Tab

Look for API calls to `/organizations/[slug]/theme` endpoint

### 3. Test URLs

Try these URLs to test:

- `/org/test/login` (should work if 'test' organization exists)
- `/org/airqo/login` (should redirect to `/user/login` - special case)
- `/org/nonexistent/login` (should show error or fallback)

### 4. Verify Organization Data

In browser console, check:

```javascript
// Check if organization context is detected
window.location.pathname.includes('/org/');

// Check Redux state
window.__NEXT_REDUX_STORE__.getState();
```

### 5. Common Issues

1. **Organization doesn't exist**: API returns 404
2. **Context not detected**: URL pattern doesn't match
3. **Loading state not handled**: Component renders before data loads
4. **Auth redirect**: `withSessionAuth` redirecting unauthenticated users

## Fixed Components

- `withSessionAuth.js`: Updated to allow auth pages for unauthenticated users
- `UnifiedGroupProvider.jsx`: Added `getDisplayName` function to `useOrganization` hook
- `AuthLayout.jsx`: Added loading state handling

## Test Commands

```bash
# Check logs
console.log window.location.pathname
# Should show current path

# Check organization context
console.log pathname.includes('/org/')
# Should be true for org routes

# Check organization data
console.log useOrganization()
# Should return organization object with getDisplayName function
```
