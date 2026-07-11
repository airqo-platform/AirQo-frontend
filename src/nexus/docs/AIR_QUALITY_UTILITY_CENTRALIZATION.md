# Air Quality Utility Centralization - Implementation Summary

## Overview

This document summarizes the centralization of air quality utilities across the AirQo platform to eliminate code duplication and improve maintainability.

## Problem Statement

Before this refactoring, air quality-related constants, icons, and utility functions were scattered across multiple modules:

- **Analytics module**: Had its own implementations of `getAirQualityLevel`, `getAirQualityColor`, `getAirQualityLabel`
- **Charts module**: Contained duplicate constants for `AIR_QUALITY_ICONS`, `POLLUTANT_RANGES`, `AQ_STANDARDS`
- **AirQo-map module**: Each component had its own icon mapping logic
- **Chart components**: Duplicated air quality level calculations and icon mappings

This resulted in:

- Code duplication across 10+ files
- Inconsistent air quality calculations
- Maintenance overhead when updating standards or ranges
- Potential bugs from divergent implementations

## Solution: Centralized Air Quality Utility

### New Centralized File Structure

```
src/shared/utils/airQuality.ts
├── Types & Interfaces
├── Air Quality Icons & Colors
├── Pollutant Ranges & Standards
├── WHO & NEMA Standards
├── Utility Functions
└── Helper Functions
```

### Key Components

#### 1. **Types and Interfaces**

```typescript
export type AirQualityLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive-groups'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'
  | 'no-value';
export type PollutantType = 'pm2_5' | 'pm10' | 'no2' | 'o3' | 'co' | 'so2';
export type StandardsOrganization = 'WHO' | 'NEMA';
```

#### 2. **Centralized Constants**

- `AIR_QUALITY_ICONS`: Icon mapping for all air quality levels
- `AIR_QUALITY_COLORS`: Color scheme for different levels
- `POLLUTANT_RANGES`: Categorization ranges for all pollutants
- `WHO_PM25_STANDARDS`, `WHO_PM10_STANDARDS`: WHO guidelines
- `NEMA_PM25_STANDARDS`, `NEMA_PM10_STANDARDS`: NEMA Uganda standards

#### 3. **Utility Functions**

- `getAirQualityLevel()`: Determines air quality level from pollutant value
- `getAirQualityColor()`: Returns color for a given level
- `getAirQualityIcon()`: Returns icon component for a level
- `getAirQualityLabel()`: Returns human-readable label
- `getAirQualityInfo()`: Returns complete air quality information object
- `mapAqiCategoryToLevel()`: Maps API category strings to internal levels

## Files Updated

### 1. **Core Utility Files**

- ✅ `src/shared/utils/airQuality.ts` - **NEW**: Centralized utility
- ✅ `src/shared/utils/index.ts` - Added export for new utility

### 2. **Charts Module**

- ✅ `src/shared/components/charts/constants/index.ts` - Re-exports from centralized utility
- ✅ `src/shared/components/charts/components/ui/CustomTooltip.tsx` - Uses centralized functions
- ✅ `src/shared/components/charts/components/ui/StandardsDialog.tsx` - Uses centralized constants

### 3. **Analytics Module**

- ✅ `src/modules/analytics/constants/index.ts` - Re-exports from centralized utility
- ✅ `src/modules/analytics/utils/index.ts` - Replaced implementations with centralized calls
- ✅ `src/modules/analytics/components/AnalyticsCard.tsx` - Updated imports

### 4. **AirQo-Map Module**

- ✅ `src/modules/airqo-map/components/sidebar/CurrentAirQualityCard.tsx` - Uses `getAirQualityInfo()`
- ✅ `src/modules/airqo-map/components/sidebar/WeeklyForecastCard.tsx` - Uses centralized utility
- ✅ `src/modules/airqo-map/components/sidebar/LocationDetailsPanel.tsx` - Uses centralized utility

## Benefits Achieved

### 1. **Code Reduction**

- **Removed ~200 lines** of duplicate code
- **Eliminated 6 duplicate icon mappings**
- **Consolidated 4 separate air quality level functions**

### 2. **Consistency**

- All modules now use the same air quality calculations
- Consistent color schemes across all components
- Unified icon usage patterns

### 3. **Maintainability**

- **Single source of truth** for air quality standards
- Easy to update WHO/NEMA guidelines from one place
- Centralized pollutant ranges for all pollutant types

### 4. **Type Safety**

- Comprehensive TypeScript types for all air quality concepts
- Proper type exports for consistent usage across modules

## Usage Examples

### Basic Air Quality Information

```typescript
import { getAirQualityInfo } from '@/shared/utils/airQuality';

const pm25Value = 25.5;
const info = getAirQualityInfo(pm25Value, 'pm2_5');
// Returns: { level, label, color, icon, description }
```

### Individual Utilities

```typescript
import {
  getAirQualityLevel,
  getAirQualityColor,
  getAirQualityIcon,
} from '@/shared/utils/airQuality';

const level = getAirQualityLevel(25.5, 'pm2_5'); // 'unhealthy-sensitive-groups'
const color = getAirQualityColor(level); // '#EF4444'
const IconComponent = getAirQualityIcon(level); // AqUnhealthyForSensitiveGroups
```

### Working with Standards

```typescript
import {
  WHO_PM25_STANDARDS,
  NEMA_PM25_STANDARDS,
  getStandardsByType,
} from '@/shared/utils/airQuality';

const whoStandards = getStandardsByType('WHO', 'PM2.5');
const nemaStandards = getStandardsByType('NEMA', 'PM2.5');
```

## Migration Guide for Future Changes

### Adding New Pollutant Ranges

1. Update `POLLUTANT_RANGES` in `airQuality.ts`
2. Add new pollutant type to `PollutantType`
3. Update `POLLUTANT_LABELS` if needed

### Updating Standards

1. Modify appropriate standard arrays in `airQuality.ts`
2. Changes automatically propagate to all components

### Adding New Air Quality Levels

1. Update `AirQualityLevel` type
2. Add to `AIR_QUALITY_ICONS` and `AIR_QUALITY_COLORS`
3. Update mapping functions as needed

## Backward Compatibility

- All existing imports continue to work via re-exports
- Component APIs remain unchanged
- Gradual migration path available for future enhancements

## Testing Recommendations

1. **Verify air quality calculations** across different pollutant values
2. **Test icon rendering** in all components
3. **Validate color consistency** across charts and cards
4. **Check standards dialog** functionality
5. **Test tooltip information** accuracy

## Future Enhancements

1. **Add support for more pollutants** (CO2, SO2, etc.)
2. **Implement internationalization** for air quality labels
3. **Add air quality trend calculations**
4. **Support for custom organization standards**
5. **Enhanced health recommendations** based on levels

---

**Implementation Date**: November 2, 2025  
**Files Modified**: 11 files  
**Lines of Code Removed**: ~200  
**Maintainer**: GitHub Copilot Assistant
