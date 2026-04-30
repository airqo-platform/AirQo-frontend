# Map Tab Redesign — Implementation Spec

**File to edit:** `lib/src/app/map/pages/map_page.dart`  
**New file to create:** `lib/src/app/map/widgets/map_air_quality_card.dart`  
**New file to create:** `lib/src/app/map/widgets/map_style_picker.dart`

Do not create new color tokens, text styles, corner radii, or spacing values. Derive everything from the tokens and patterns already established in the app — see the **App theme reference** section below before writing any UI code.

---

## App theme reference

Study these files before touching any color, shadow, radius, or text style:

- `lib/src/meta/utils/colors.dart` — all `AppColors` tokens
- `lib/src/meta/utils/utils.dart` — `getAirQualityIcon()`, `_getAqiColor()`
- `lib/src/app/exposure/widgets/declared_place_card.dart` — the canonical card pattern for light/dark
- `lib/src/app/exposure/widgets/entry_place_card.dart` — lighter card variant and CTA button pattern
- `lib/src/app/exposure/widgets/hourly_detail_sheet.dart` — `_aqLevel()` helper (PM2.5 → SVG asset + color), sheet background pattern
- `lib/src/app/exposure/widgets/exposure_level_chip.dart` — AQ level chip (tinted bg + text colour)
- `lib/src/app/dashboard/widgets/analytics_card.dart` — `_getAqiColor()` and card decoration to match

### Key token decisions — light vs dark

| Element | Light | Dark |
|---|---|---|
| Card background | `Colors.white` | `AppColors.darkHighlight` (`Color(0xFF2E2F33)`) |
| Sheet / modal background | `Theme.of(context).scaffoldBackgroundColor` | same |
| Subtitle / secondary text | `AppColors.boldHeadlineColor3` (`#7A7F87`) | `AppColors.boldHeadlineColor2` (`#9EA3AA`) |
| Section label | `AppColors.boldHeadlineColor3` | `AppColors.boldHeadlineColor2` |
| Icon container bg | `AppColors.dividerColorlight` (`#E1E7EC`) | `AppColors.darkThemeBackground` (`#1C1D20`) |
| Divider | `AppColors.dividerColorlight` | `AppColors.dividerColordark` (`#3E4147`) |
| Card shadow | `BoxShadow(color: Colors.black.withValues(alpha: 0.10), blurRadius: 4, offset: Offset(0, 2))` | same |
| Lighter card shadow | `BoxShadow(color: Color(0x29536A87), offset: Offset(0, 1), blurRadius: 2)` | same |
| Primary action fill | `AppColors.primaryColor` (`#145FFF`) | same |
| Primary action tint bg | `AppColors.primaryColor.withValues(alpha: 0.08)` | `AppColors.primaryColor.withValues(alpha: 0.14)` |
| Input / chip fill | `Theme.of(context).highlightColor` | same |
| Corner radius — cards | `BorderRadius.circular(12)` | same |
| Corner radius — sheet | `BorderRadius.vertical(top: Radius.circular(20))` | same |
| Corner radius — chips / CTAs | `BorderRadius.circular(8)` | same |

Use `final isDark = Theme.of(context).brightness == Brightness.dark;` at the top of every `build()` method and resolve tokens once rather than inlining ternaries everywhere.

### AQ emoji / icon pattern

Do not use coloured dot indicators anywhere in the sheet rows or card. Use the AQ SVG emoji instead.

The canonical helper is already in `hourly_detail_sheet.dart`:

```dart
({String asset, Color color}) _aqLevel(double pm25) { ... }
```

Copy this private helper into `map_page.dart` (or extract to `lib/src/meta/utils/utils.dart` if it isn't already there). Use `SvgPicture.asset(asset, width: w, height: h)` wherever an AQ indicator appears.

For rows in the sheet, use size `20×20`. For the card reading row, use `36×36` — matching the existing `AnalyticsCard` layout.

---

## 1. Three-state bottom sheet

**Replace** the `AnimatedContainer` in `_buildSearchAndListPanel()` with a `DraggableScrollableSheet`.

```
Snap points (as fraction of screen height):
  peek → 0.13   (search bar + handle only)
  mid  → 0.44   (nearby list or search results)
```

- Initial size on load: `0.13` (peek).
- Tap `LocationSearchBar` → snap to `0.44`.
- Clear or dismiss search field → snap back to `0.13`.
- Remove `isModalFull` state entirely — no longer needed.
- Sheet never exceeds `0.44`. Full detail is handled by the existing `AnalyticsDetails` modal, unchanged.

**Sheet background — frosted glass:**

```dart
ClipRRect(
  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
  child: BackdropFilter(
    filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
    child: Container(
      decoration: BoxDecoration(
        // Light: white at 58% opacity so map textures bleed through
        // Dark:  scaffold bg at 68% opacity — matches AppColors.darkThemeBackground
        color: isDark
            ? AppColors.darkThemeBackground.withValues(alpha: 0.68)
            : Colors.white.withValues(alpha: 0.58),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        border: Border(
          top: BorderSide(
            color: isDark
                ? Colors.white.withValues(alpha: 0.07)
                : Colors.white.withValues(alpha: 0.70),
            width: 1,
          ),
        ),
      ),
      child: /* sheet content */,
    ),
  ),
)
```

**Sheet handle:** keep the existing pill handle centred at the top.  
**Search bar:** `LocationSearchBar` widget, unchanged.

---

## 2. Sheet content — nearby list (default)

When no search is active, the mid sheet shows a **nearby list**.

**Section label:**
```dart
Text(
  'nearby',
  style: TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.06,
    color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3,
  ),
)
```

- Data source: `nearbyMeasurements`. If empty and `userPosition == null`, sheet stays at peek — no list rendered.
- **Remove** the country filter chip row (`CountryButton`) entirely.

**Each row:**

```dart
Row(
  children: [
    // AQ emoji — 20×20, no container, no background
    SvgPicture.asset(
      _aqLevel(measurement.pm25?.value ?? 0).asset,
      width: 20, height: 20,
    ),
    SizedBox(width: 10),
    // Station name
    Expanded(
      child: Text(
        measurement.siteDetails?.searchName ?? measurement.siteDetails?.name ?? '—',
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Theme.of(context).textTheme.bodyLarge?.color,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    ),
    // AQ category label — no distance
    Text(
      measurement.aqiCategory ?? '',
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: _aqLevel(measurement.pm25?.value ?? 0).color,
      ),
    ),
  ],
)
```

Row divider: `Divider(indent: 16, thickness: 0.5, color: isDark ? AppColors.dividerColordark : AppColors.dividerColorlight)`.

Tapping a row: snap sheet to `0.13`, call `viewDetails(measurement: measurement)`.

---

## 3. Sheet content — search results

When `GooglePlacesBloc` returns `SearchLoaded` or `localSearchResults` is non-empty.

**Section label** — lowercase, same style as the nearby label:

```dart
// For AirQo station results:
'${localSearchResults.length} stations found'

// For a named-city query with multiple results:
'stations in ${searchController.text.trim().toLowerCase()}'

// For pure Google Places results with no AirQo match:
'places'
```

Use the same `TextStyle` as the nearby label. Do not capitalise.

**AirQo station rows:** identical format to nearby rows — AQ emoji (20×20) + name + AQ category label. No distance.

**Google Places prediction rows** (no AirQo data):
- Leading: `SvgPicture.asset("assets/images/shared/location_pin.svg", width: 20, height: 20)` with `colorFilter: ColorFilter.mode(isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3, BlendMode.srcIn)`.
- Name only — no trailing label.

Loading state: keep existing `GooglePlacesLoader` shimmer.

---

## 4. New widget — `MapAirQualityCard`

Create `lib/src/app/map/widgets/map_air_quality_card.dart`.

Position: **fixed** at `bottom: 60` inside the map `Stack` via `Positioned`. Camera moves to the pin — card position never changes.

**State:** add `Measurement? _selectedCardMeasurement` to `_MapScreenState`. `viewDetails()` sets it; dismiss or map tap clears it.

**Placement in the stack:**

```dart
Positioned(
  bottom: 60,
  left: 12,
  right: 12,
  child: AnimatedSwitcher(
    duration: Duration(milliseconds: 200),
    transitionBuilder: (child, animation) => SlideTransition(
      position: Tween(begin: Offset(0, 0.25), end: Offset.zero)
          .animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
      child: FadeTransition(opacity: animation, child: child),
    ),
    child: _selectedCardMeasurement == null
        ? SizedBox.shrink()
        : MapAirQualityCard(
            key: ValueKey(_selectedCardMeasurement!.id),
            measurement: _selectedCardMeasurement!,
            onDismiss: () => setState(() => _selectedCardMeasurement = null),
            onViewForecast: () => _showAnalyticsDetails(_selectedCardMeasurement!),
          ),
  ),
)
```

### Card decoration

Mirror `DeclaredPlaceCard` exactly:

```dart
ClipRRect(
  borderRadius: BorderRadius.circular(12),
  child: BackdropFilter(
    filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
    child: Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkHighlight : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.10),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: /* card content */,
    ),
  ),
)
```

### Card layout (top to bottom)

**1. AQ colour bar** — 3px, full width, no padding. Colour from `_aqLevel(pm25).color`.

**2. Content padding:** `EdgeInsets.fromLTRB(16, 12, 16, 14)` — matches `DeclaredPlaceCard`.

**3. Header row:**

```dart
Row(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            measurement.siteDetails?.searchName ?? measurement.siteDetails?.name ?? '—',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineSmall?.color,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: 2),
          Text(
            _locationDescription(measurement), // city + country, same helper as AnalyticsCard
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3,
            ),
          ),
        ],
      ),
    ),
    GestureDetector(
      onTap: onDismiss,
      child: Icon(
        Icons.close,
        size: 18,
        color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3,
      ),
    ),
  ],
)
```

**4. SizedBox(height: 12)**

**5. Reading row:**

```dart
Row(
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    SvgPicture.asset(
      getAirQualityIcon(measurement, pmValue), // existing util
      width: 36, height: 36,
    ),
    SizedBox(width: 12),
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          measurement.aqiCategory ?? '',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: _aqLevel(pmValue).color,
          ),
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              pmValue.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: Theme.of(context).textTheme.titleLarge?.color,
              ),
            ),
            SizedBox(width: 4),
            Padding(
              padding: EdgeInsets.only(bottom: 3),
              child: Text(
                'µg/m³  PM2.5',
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3,
                ),
              ),
            ),
          ],
        ),
      ],
    ),
  ],
)
```

**6. SizedBox(height: 14)**

**7. "View forecast" CTA** — mirrors the dashed-border CTA pattern from `EntryPlaceCard` but as a solid tinted container:

```dart
GestureDetector(
  onTap: onViewForecast,
  child: Container(
    width: double.infinity,
    padding: EdgeInsets.symmetric(vertical: 11),
    decoration: BoxDecoration(
      color: isDark
          ? AppColors.primaryColor.withValues(alpha: 0.14)
          : AppColors.primaryColor.withValues(alpha: 0.07),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(
        color: AppColors.primaryColor.withValues(alpha: isDark ? 0.22 : 0.14),
      ),
    ),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Padding(
          padding: EdgeInsets.only(left: 14),
          child: Text(
            'view forecast',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryColor,
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.only(right: 14),
          child: Icon(Icons.arrow_forward_ios, size: 13, color: AppColors.primaryColor),
        ),
      ],
    ),
  ),
)
```

### `viewDetails()` change

Replace direct `_showAnalyticsDetails()` call with card state update:

```dart
void viewDetails({Measurement? measurement, String? placeName}) {
  if (measurement != null) {
    if (mapControllerInitialized &&
        measurement.siteDetails?.approximateLatitude != null &&
        measurement.siteDetails?.approximateLongitude != null) {
      mapController.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(measurement.siteDetails!.approximateLatitude!,
              measurement.siteDetails!.approximateLongitude!),
          14,
        ),
      );
    }
    if (mounted) setState(() => _selectedCardMeasurement = measurement);
  } else if (placeName != null) {
    // Google Places path — unchanged
    googlePlacesBloc!.add(GetPlaceDetails(placeName));
  }
}
```

Tapping another pin calls `viewDetails()` again — the new `ValueKey` on the card triggers `AnimatedSwitcher` to cross-fade/slide.

**Dismiss on map tap:**

```dart
GoogleMap(
  onTap: (_) {
    if (mounted) setState(() => _selectedCardMeasurement = null);
  },
  ...
)
```

---

## 5. Map controls — always visible, compact

Remove the `if (!isModalFull || showDetails)` wrapper entirely. All controls are `Positioned` widgets in the map `Stack`, always rendered.

### Shared control decoration

```dart
// Light
color: Colors.white.withValues(alpha: 0.88)
shadow: BoxShadow(color: Color(0x29536A87), offset: Offset(0, 1), blurRadius: 2)

// Dark
color: AppColors.darkHighlight.withValues(alpha: 0.90)  // Color(0xFF2E2F33)
shadow: same
```

Wrap every control button in `ClipRRect` + `BackdropFilter(ImageFilter.blur(sigmaX: 8, sigmaY: 8))`.

### Top-right — style button

```
Positioned(top: 50, right: 12)
```

`_MapIconButton(icon: Icons.layers_outlined, size: 32×32, iconSize: 16, onTap: _openMapStylePicker)`

### Bottom-right — geolocate + zoom

```
Positioned(bottom: 72, right: 12)
Column(spacing: 4):
  _MapIconButton(
    icon: Icons.my_location,
    size: 32×32,
    filled: true,  // AppColors.primaryColor fill, white icon
    onTap: _snapToUser,
  )
  SizedBox(height: 2)
  _ZoomGroup(onZoomIn: increaseZoom, onZoomOut: reduceZoom)
```

### Left — AQ legend

```
Positioned(bottom: 72, left: 10)
```

Replace the existing large SVG legend with small 10px coloured dots. Use the six AQ level colours from `_aqLevel()`:

```dart
Container(
  padding: EdgeInsets.symmetric(vertical: 6, horizontal: 4),
  decoration: BoxDecoration(
    color: isDark
        ? AppColors.darkHighlight.withValues(alpha: 0.90)
        : Colors.white.withValues(alpha: 0.88),
    borderRadius: BorderRadius.circular(20),
    boxShadow: [BoxShadow(color: Color(0x29536A87), offset: Offset(0, 1), blurRadius: 2)],
  ),
  child: Column(
    mainAxisSize: MainAxisSize.min,
    children: [
      // Good, Moderate, Sensitive, Unhealthy, VeryUnhealthy, Hazardous
      // colours from _aqLevel() at representative pm25 values: 5, 20, 45, 100, 200, 300
      for (final color in aqLevelColors)
        Container(
          width: 10, height: 10,
          margin: EdgeInsets.only(top: 3),
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
    ],
  ),
)
```

### `_MapIconButton` private widget

```dart
// width: 32, height: 32, borderRadius: 8
// filled == true → AppColors.primaryColor bg, white icon
// filled == false → light/dark tinted bg, Theme bodyMedium icon color
// icon size: 16
// wrap in ClipRRect(8) + BackdropFilter(blur: 8)
```

### `_ZoomGroup` private widget

Two stacked buttons, 32×24px each. Top button: `borderRadius: BorderRadius.vertical(top: Radius.circular(8))`, border-bottom: none. Bottom button: `borderRadius: BorderRadius.vertical(bottom: Radius.circular(8))`. Same bg and shadow as `_MapIconButton`.

---

## 6. User location on load

Enable the native user dot:

```dart
GoogleMap(
  myLocationEnabled: true,
  myLocationButtonEnabled: false,
  ...
)
```

Add `_snapToUser()`:

```dart
Future<void> _snapToUser() async {
  if (!mapControllerInitialized || userPosition == null) return;
  await mapController.animateCamera(
    CameraUpdate.newLatLngZoom(
      LatLng(userPosition!.latitude, userPosition!.longitude),
      12,
    ),
  );
}
```

Call `_snapToUser()` at the end of `_onMapCreated()` (if `userPosition` already resolved) and at the end of `_getUserLocation()` (after position is set).

---

## 7. Map style picker

Create `lib/src/app/map/widgets/map_style_picker.dart`.

Opened via `showModalBottomSheet` from the layers button. Use `ModalWrapper` for the container decoration — same as all other bottom sheets in the app.

**State in `_MapScreenState`:** `MapType _currentMapType = MapType.normal`.  
Pass to `GoogleMap(mapType: _currentMapType)`.

**Picker layout:**

```
Title: 'map type'
  16sp, FontWeight.w700, Theme.of(context).textTheme.headlineSmall?.color

Subtitle: 'choose how the map looks'
  13sp, FontWeight.w400, isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3

4-option row (Normal / Satellite / Terrain / Hybrid):
  Each option — Container:
    padding: EdgeInsets.all(10)
    borderRadius: 10
    border: 1.5px AppColors.primaryColor (selected) or 1px dividerColor (unselected)
    color: selected → AppColors.primaryColor.withValues(alpha: 0.07)
           unselected → Theme.of(context).highlightColor

    Child: Column
      48×32 ColoredBox thumbnail (Normal: Color(0xFFD6E8C4), Satellite: Color(0xFF2A3D18),
                                   Terrain: Color(0xFFCBD5A0), Hybrid: Color(0xFF3A4A2A))
      SizedBox(height: 6)
      Text(label, 11sp, FontWeight.w600, nameColor)

"Apply" button:
  SizedBox(height: 48, width: double.infinity)
  ElevatedButton(
    style: ElevatedButton.styleFrom(
      backgroundColor: AppColors.primaryColor,
      foregroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    child: Text('apply', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
  )
  Calls: setState(() => _currentMapType = _pendingType); Navigator.pop(context);
```

**Dark map style JSON:**  
When `isDark && _currentMapType == MapType.normal`, apply a dark style via `mapController.setMapStyle(json)`.  
Load the JSON from `assets/map_styles/dark.json` — register in `pubspec.yaml`.  
Use the standard Google Maps dark style (generate from [https://mapstyle.withgoogle.com](https://mapstyle.withgoogle.com) or use the Aubergine preset). For all other map types call `mapController.setMapStyle(null)`.

Apply on `_onMapCreated` and whenever `_currentMapType` changes.

---

## 8. Clustering

Add `double _currentZoom = 6.0` to `_MapScreenState`.

```dart
GoogleMap(
  onCameraMove: (CameraPosition pos) {
    // Only rebuild when crossing an integer zoom boundary — avoids
    // continuous setState during smooth pan. Mirrors the quantisation
    // in EnhancedMap.tsx.
    if (pos.zoom.floor() != _currentZoom.floor()) {
      setState(() => _currentZoom = pos.zoom);
    }
  },
  ...
)
```

Replace the flat `addMarkers()` loop with `_buildMarkersWithClustering()`:

```dart
Map<String, List<Measurement>> _buildSpatialIndex(
    List<Measurement> measurements, double gridSize) {
  final index = <String, List<Measurement>>{};
  for (final m in measurements) {
    final lat = m.siteDetails!.approximateLatitude!;
    final lng = m.siteDetails!.approximateLongitude!;
    final key = '${(lat / gridSize).floor()},${(lng / gridSize).floor()}';
    index.putIfAbsent(key, () => []).add(m);
  }
  return index;
}

({double gridSize, double distanceKm, int minSize}) _clusterParams(double zoom) {
  final z = zoom.floor();
  if (z < 4)  return (gridSize: 4.0,  distanceKm: 15.0, minSize: 2);
  if (z < 6)  return (gridSize: 2.0,  distanceKm: 8.0,  minSize: 2);
  if (z < 8)  return (gridSize: 1.0,  distanceKm: 5.0,  minSize: 2);
  if (z < 10) return (gridSize: 0.5,  distanceKm: 3.0,  minSize: 3);
  return      (gridSize: 0.1,  distanceKm: 0.8,  minSize: 99); // no clustering above z10
}
```

**Cluster marker:** rendered as a `Canvas`-drawn circle bitmap:
- Diameter 36px.
- Fill: average `_aqLevel(avgPm25).color` for the group.
- White border: 2px.
- Centred label: count, 12sp bold white.
- Generate with `PictureRecorder` + `Canvas`, convert to `BitmapDescriptor`.

Tapping a cluster: `_zoomToCluster(members)` — compute `LatLngBounds` from member coordinates, call `mapController.animateCamera(CameraUpdate.newLatLngBounds(bounds, 60))`.

---

## 9. What not to change

- `MapBloc`, `DashboardBloc`, `GooglePlacesBloc` — no logic changes.
- `AnalyticsDetails` widget — opened unchanged by the "view forecast" CTA.
- `LocationSearchBar` widget — no changes.
- `LocationDisplayWidget` — no longer used in the map sheet but do not delete.
- All existing SVG asset paths.
- The data logic inside `_getUserLocation()`, `_updateNearbyMeasurements()`, `addMarkers()` — restructure the calling shape only.

---

## Acceptance criteria

- [ ] Map is full screen on load. Sheet is at peek — handle + search bar only.
- [ ] Camera flies to user location on load if permission is granted.
- [ ] User location dot visible (`myLocationEnabled: true`, `myLocationButtonEnabled: false`).
- [ ] Nearby list shows in mid sheet: AQ emoji + station name + AQ category label. No distance. No country chips.
- [ ] Search results use the same row format with lowercase section label.
- [ ] Tapping a row or pin: sheet snaps to peek, compact card appears at fixed `bottom: 60`.
- [ ] Tapping a second pin replaces card content in place — no dismiss step.
- [ ] Tapping ✕ or the map background dismisses the card.
- [ ] "view forecast" CTA (lowercase) opens the existing `AnalyticsDetails` modal.
- [ ] All map controls visible at every sheet state — no `isModalFull` guard.
- [ ] Map style picker opens, applies `MapType`, dark JSON style loads automatically in dark mode.
- [ ] No hardcoded colours — only `AppColors.*` and `Theme.of(context).*` tokens.
- [ ] No dot indicators anywhere — AQ SVG emojis used throughout.
