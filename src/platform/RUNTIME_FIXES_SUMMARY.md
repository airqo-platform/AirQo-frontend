# AirQo Platform - Runtime Error Fixes and Map Node Type Persistence

## Issues Fixed

### 1. Webpack Runtime Errors (originalFactory undefined)

**Problem**:

- `TypeError: can't access property "call", originalFactory is undefined` errors appearing during navigation
- Webpack module resolution issues causing runtime failures

**Solution**:

- Enhanced webpack configuration in `next.config.js`:
  - Fixed module resolution with proper alias configuration
  - Improved chunk splitting strategy with deterministic IDs
  - Added enhanced error suppression for webpack internal warnings
  - Implemented better runtime chunk management
  - Added specialized bundle for airQuality-map feature to prevent circular dependencies

**Files Modified**:

- `next.config.js` - Enhanced webpack configuration
- `src/common/components/ErrorBoundary/RuntimeErrorBoundary.jsx` - New error boundary component
- `src/app/(individual)/user/(pages)/(layout-2)/map/page.jsx` - Added error boundary wrapper

### 2. Map Node Type Persistence

**Problem**:

- Node type was defaulting to 'Node' instead of 'Emoji'
- Node type selection was not persisting between sessions
- Local state was overriding Redux state

**Solution**:

- Updated Redux store to include `nodeType` and `mapStyle` in map state
- Set default node type to 'Emoji' as requested
- Implemented selective persistence for map preferences
- Removed conflicting local state that was overriding Redux state
- Updated LayerModal to use Redux for state management

**Files Modified**:

- `src/lib/store/services/map/MapSlice.js` - Added nodeType and mapStyle to state and reducers
- `src/lib/store/index.js` - Added selective persistence for map state
- `src/common/features/airQuality-map/components/LayerModal.js` - Updated to use Redux
- `src/common/features/airQuality-map/components/AirQoMap.jsx` - Removed conflicting local state
- `src/common/features/airQuality-map/hooks/useMapData.jsx` - Updated to use Redux nodeType

### 3. Import Path Consistency

**Problem**:

- Inconsistent import paths between `@/features/` and `@/common/features/`

**Solution**:

- Standardized all imports to use `@/common/features/airQuality-map/`
- Fixed webpack alias configuration to properly resolve @ symbol

**Files Modified**:

- `src/app/(individual)/user/(pages)/(layout-2)/map/page.jsx`
- `src/common/features/airQuality-map/components/AirQoMap.jsx`

## Key Features Implemented

### 1. Default Node Type = Emoji

- Map now defaults to 'Emoji' node type instead of 'Node'
- This setting persists between browser sessions

### 2. Enhanced Error Handling

- Created `RuntimeErrorBoundary` component that handles webpack module loading errors
- Automatic recovery for originalFactory errors
- Better error reporting through existing logger system

### 3. Selective State Persistence

- Only nodeType and mapStyle from map state are persisted
- Prevents storing unnecessary map data like coordinates and readings
- Maintains user preferences while keeping state clean

### 4. Production-Ready Configuration

- Enhanced webpack warnings suppression
- Better chunk splitting for performance
- Improved module resolution to prevent runtime errors

## Configuration Changes

### Next.js Configuration (`next.config.js`)

```javascript
- Enhanced webpack module resolution
- Improved chunk splitting with deterministic IDs
- Better runtime chunk management
- Enhanced error suppression for production
- Specialized bundle handling for airQuality-map feature
```

### Redux Store Configuration (`src/lib/store/index.js`)

```javascript
- Added selective persistence for map state
- Only nodeType and mapStyle are persisted
- Maintains clean separation of concerns
```

### Map State Structure (`src/lib/store/services/map/MapSlice.js`)

```javascript
- Added nodeType: 'Emoji' (default)
- Added mapStyle: 'Streets' (default)
- Added corresponding reducers: setNodeType, setMapStyle
```

## Verification Steps

1. **Node Type Persistence**:

   - Open map page
   - Change node type from Emoji to Node
   - Refresh page - should maintain Node selection
   - Change back to Emoji - should persist

2. **Error Handling**:

   - Navigate between different pages rapidly
   - Should not see originalFactory errors
   - Any webpack errors should show recovery UI

3. **Default Behavior**:
   - Fresh browser session should default to Emoji node type
   - Map should load without runtime errors

## Technical Notes

- Used Redux over localStorage for state management to ensure SSR compatibility
- Implemented selective persistence to avoid performance issues with large map data
- Enhanced error boundaries provide graceful fallbacks for webpack module loading issues
- Webpack configuration changes ensure better production stability
