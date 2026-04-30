import 'dart:ui' as ui;

import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/location_search_bar.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/utils/location_helpers.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/app/dashboard/widgets/google_places_loader.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:airqo/src/app/map/widgets/map_air_quality_card.dart';
import 'package:airqo/src/app/map/widgets/map_style_picker.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/app/shared/widgets/translated_tooltip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:airqo/src/meta/utils/widget_to_map_icon.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:loggy/loggy.dart';

// ─── AQ level helper ────────────────────────────────────────────────────────

({String asset, Color color}) _aqLevel(double pm25) {
  if (pm25 < 12.1) {
    return (
      asset: 'assets/images/shared/airquality_indicators/good.svg',
      color: const Color(0xFF34C759),
    );
  }
  if (pm25 < 35.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/moderate.svg',
      color: const Color(0xFFFDC412),
    );
  }
  if (pm25 < 55.5) {
    return (
      asset:
          'assets/images/shared/airquality_indicators/unhealthy-sensitive.svg',
      color: const Color(0xFFFF851F),
    );
  }
  if (pm25 < 150.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/unhealthy.svg',
      color: const Color(0xFFFE726B),
    );
  }
  if (pm25 < 250.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/very-unhealthy.svg',
      color: const Color(0xFFC78AE8),
    );
  }
  return (
    asset: 'assets/images/shared/airquality_indicators/hazardous.svg',
    color: const Color(0xFFD95BA3),
  );
}

// AQ level entries (SVG asset + tooltip label) in Good → Hazardous order
const List<({String asset, String label})> _aqLegendItems = [
  (
    asset: 'assets/images/shared/airquality_indicators/good.svg',
    label: 'Air quality is Good',
  ),
  (
    asset: 'assets/images/shared/airquality_indicators/moderate.svg',
    label: 'Air quality is Moderate',
  ),
  (
    asset: 'assets/images/shared/airquality_indicators/unhealthy-sensitive.svg',
    label: 'Unhealthy for Sensitive Groups',
  ),
  (
    asset: 'assets/images/shared/airquality_indicators/unhealthy.svg',
    label: 'Air quality is Unhealthy',
  ),
  (
    asset: 'assets/images/shared/airquality_indicators/very-unhealthy.svg',
    label: 'Air quality is Very Unhealthy',
  ),
  (
    asset: 'assets/images/shared/airquality_indicators/hazardous.svg',
    label: 'Air quality is Hazardous',
  ),
];

// ─── Screen ─────────────────────────────────────────────────────────────────

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen>
    with AutomaticKeepAliveClientMixin, UiLoggy {
  late GoogleMapController mapController;

  TextEditingController searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  final DraggableScrollableController _sheetController =
      DraggableScrollableController();

  List<Measurement> allMeasurements = [];
  List<Measurement> localSearchResults = [];
  List<Measurement> nearbyMeasurements = [];
  List<Measurement> filteredMeasurements = [];
  String currentFilter = 'Nearby';
  Position? userPosition;
  String? userCountry;

  List<Marker> markers = [];
  bool isInitializing = true;
  bool isRetrying = false;
  bool mapControllerInitialized = false;
  GooglePlacesBloc? googlePlacesBloc;

  MapType _currentMapType = MapType.normal;
  Measurement? _selectedCardMeasurement;
  String? _mapStyleJson;

  static const LatLng _center = LatLng(0.347596, 32.582520);
  static const double _sheetPeekSize = 0.13;
  static const double _sheetMidSize = 0.44;

  // ── Map lifecycle ──────────────────────────────────────────────────────────

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
    if (mounted) setState(() => mapControllerInitialized = true);
    _snapToUser();
    if (markers.isNotEmpty && userPosition == null) {
      _fitMarkersInView();
    }
  }

  /// Loads the dark JSON asset (or clears it) and calls setState so GoogleMap
  /// picks up the new [_mapStyleJson] via its `style` property.
  Future<void> _applyMapStyle() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (isDark && _currentMapType == MapType.normal) {
      try {
        final json = await DefaultAssetBundle.of(context)
            .loadString('assets/map_styles/dark.json');
        if (mounted) setState(() => _mapStyleJson = json);
      } catch (e) {
        loggy.warning('Failed to load dark map style: $e');
      }
    } else {
      if (mounted) setState(() => _mapStyleJson = null);
    }
  }

  Future<void> _snapToUser() async {
    if (!mapControllerInitialized || userPosition == null) return;
    await mapController.animateCamera(
      CameraUpdate.newLatLngZoom(
        LatLng(userPosition!.latitude, userPosition!.longitude),
        12,
      ),
    );
  }

  Future<void> _fitMarkersInView() async {
    if (!mapControllerInitialized || markers.isEmpty) return;
    try {
      double minLat = 90.0, maxLat = -90.0, minLng = 180.0, maxLng = -180.0;
      for (final marker in markers) {
        final p = marker.position;
        if (p.latitude < minLat) minLat = p.latitude;
        if (p.latitude > maxLat) maxLat = p.latitude;
        if (p.longitude < minLng) minLng = p.longitude;
        if (p.longitude > maxLng) maxLng = p.longitude;
      }
      final latPad = (maxLat - minLat) * 0.1;
      final lngPad = (maxLng - minLng) * 0.1;
      await mapController.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(minLat - latPad, minLng - lngPad),
            northeast: LatLng(maxLat + latPad, maxLng + lngPad),
          ),
          50.0,
        ),
      );
    } catch (e) {
      loggy.error('Error fitting markers to bounds: $e');
      mapController.animateCamera(CameraUpdate.newLatLngZoom(_center, 6));
    }
  }

  Future<void> reduceZoom() async {
    if (!mapControllerInitialized) return;
    final zoom = await mapController.getZoomLevel();
    mapController.animateCamera(CameraUpdate.zoomTo(zoom - 2));
  }

  Future<void> increaseZoom() async {
    if (!mapControllerInitialized) return;
    final zoom = await mapController.getZoomLevel();
    mapController.animateCamera(CameraUpdate.zoomTo(zoom + 2));
  }

  // ── Details / card ─────────────────────────────────────────────────────────

  void viewDetails({Measurement? measurement, String? placeName}) {
    // Dismiss keyboard and collapse sheet whenever a result is selected
    FocusScope.of(context).unfocus();
    _sheetController.animateTo(
      _sheetPeekSize,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );

    if (measurement != null) {
      if (mapControllerInitialized &&
          measurement.siteDetails?.approximateLatitude != null &&
          measurement.siteDetails?.approximateLongitude != null) {
        mapController.animateCamera(
          CameraUpdate.newLatLngZoom(
            LatLng(
              measurement.siteDetails!.approximateLatitude!,
              measurement.siteDetails!.approximateLongitude!,
            ),
            14,
          ),
        );
      }
      if (mounted) setState(() => _selectedCardMeasurement = measurement);
    } else if (placeName != null) {
      googlePlacesBloc!.add(GetPlaceDetails(placeName));
    }
  }

  void _hideTextInputOverlay() {
    if (!mounted) return;
    _searchFocusNode.unfocus();
    FocusManager.instance.primaryFocus?.unfocus();
    FocusScope.of(context).unfocus();
    SystemChannels.textInput.invokeMethod<Object?>('TextInput.hide');
  }

  void _showAnalyticsDetails(Measurement measurement) {
    // showBottomSheet (not showModalBottomSheet) avoids a lingering scrim;
    // we also drop IME so the draggable sheet isn't pushed by the keyboard.
    _hideTextInputOverlay();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _hideTextInputOverlay();

      Future<void>.delayed(const Duration(milliseconds: 48), () {
        if (!mounted) return;
        _hideTextInputOverlay();
        showBottomSheet(
          context: context,
          backgroundColor: Colors.transparent,
          builder: (_) => AnalyticsDetails(measurement: measurement),
        );
      });
    });
  }

  void _openMapStylePicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => MapStylePicker(
        currentMapType: _currentMapType,
        onApply: (type) async {
          if (mounted) setState(() => _currentMapType = type);
          await _applyMapStyle();
        },
      ),
    );
  }

  // ── Markers ────────────────────────────────────────────────────────────────

  Future<void> addMarkers(AirQualityResponse response) async {
    if (response.measurements == null || response.measurements!.isEmpty) return;
    final newMarkers = <Marker>[];
    for (final m in response.measurements!) {
      if (m.siteDetails?.approximateLatitude != null &&
          m.siteDetails?.approximateLongitude != null &&
          m.id != null) {
        try {
          final pmValue = m.pm25?.value;
          if (pmValue != null) {
            final iconPath = getAirQualityIcon(m, pmValue);
            final resolvedPath =
                iconPath.isNotEmpty ? iconPath : _aqLevel(pmValue).asset;
            newMarkers.add(Marker(
              onTap: () => viewDetails(measurement: m),
              icon: await bitmapDescriptorFromSvgAsset(resolvedPath),
              position: LatLng(
                m.siteDetails!.approximateLatitude!,
                m.siteDetails!.approximateLongitude!,
              ),
              markerId: MarkerId(m.id!),
            ));
          }
        } catch (e) {
          loggy.warning('Error creating marker for ${m.id}: $e');
        }
      }
    }
    if (mounted) {
      setState(() {
        markers = newMarkers;
        isInitializing = false;
      });
    }
    if (mapControllerInitialized && markers.isNotEmpty && userPosition == null) {
      _fitMarkersInView();
    }
  }

  // ── Location ───────────────────────────────────────────────────────────────

  Future<void> _getUserLocation() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) return;
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }
      if (permission == LocationPermission.deniedForever) return;

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 5),
        ),
      );

      if (mounted) setState(() => userPosition = position);

      try {
        final placemarks = await placemarkFromCoordinates(
            position.latitude, position.longitude);
        if (placemarks.isNotEmpty && placemarks.first.country != null) {
          if (mounted) setState(() => userCountry = placemarks.first.country!);
        }
      } catch (_) {}

      _updateNearbyMeasurements();
      _snapToUser();
    } catch (e) {
      loggy.error('Failed to get user location: $e');
    }
  }

  void _updateNearbyMeasurements() {
    if (userPosition == null || allMeasurements.isEmpty) return;
    final measWithDistance = <MapEntry<Measurement, double>>[];
    for (final m in allMeasurements) {
      final lat = m.siteDetails?.approximateLatitude;
      final lng = m.siteDetails?.approximateLongitude;
      if (lat == null || lng == null) continue;
      final d = Geolocator.distanceBetween(
              userPosition!.latitude, userPosition!.longitude, lat, lng) /
          1000;
      if (d <= 50.0) measWithDistance.add(MapEntry(m, d));
    }
    measWithDistance.sort((a, b) => a.value.compareTo(b.value));
    if (mounted) {
      setState(() {
        nearbyMeasurements =
            measWithDistance.take(6).map((e) => e.key).toList();
      });
    }
  }

  void filterByCountry(String country) {
    if (mounted) {
      setState(() {
        filteredMeasurements = allMeasurements
            .where((m) => m.siteDetails?.country == country)
            .toList();
        currentFilter = country;
      });
    }
  }

  void resetFilter() {
    if (mounted) {
      setState(() {
        filteredMeasurements = [];
        currentFilter = 'Nearby';
      });
    }
  }

  void populateMeasurements(List<Measurement> measurements) {
    final valid = measurements.where((m) => m.siteDetails != null).toList();
    if (valid.isNotEmpty) {
      if (mounted) {
        setState(() {
          allMeasurements = valid;
          isInitializing = false;
        });
      }
      _updateNearbyMeasurements();
    }
  }

  void _initializeWithData(AirQualityResponse response) async {
    populateMeasurements(response.measurements ?? []);
    await addMarkers(response);
  }

  Future<void> _retryLoading() async {
    if (isRetrying) return;
    if (mounted) setState(() => isRetrying = true);
    context.read<MapBloc>().add(LoadMap(forceRefresh: true));
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => isRetrying = false);
  }

  void _loadDataFromAvailableSources() {
    final state = context.read<DashboardBloc>().state;
    if (state is DashboardLoaded &&
        state.response.measurements?.isNotEmpty == true) {
      _initializeWithData(state.response);
    }
    context.read<MapBloc>().add(LoadMap());
  }

  /// Programmatic clears do not invoke [TextField.onChanged]; syncing here
  /// restores Nearby + chips and resets autocomplete when the field is emptied.
  void _onSearchControllerChanged() {
    if (!mounted) return;
    if (searchController.text.trim().isNotEmpty) return;
    googlePlacesBloc!.add(ResetGooglePlaces());
    setState(() => localSearchResults = []);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    searchController.addListener(_onSearchControllerChanged);
    googlePlacesBloc =
        context.read<GooglePlacesBloc>()..add(ResetGooglePlaces());
    _loadDataFromAvailableSources();
    _getUserLocation();
    // Pre-load dark style JSON so it's ready before the map is created
    WidgetsBinding.instance.addPostFrameCallback((_) => _applyMapStyle());
  }

  @override
  void dispose() {
    searchController.removeListener(_onSearchControllerChanged);
    _sheetController.dispose();
    _searchFocusNode.dispose();
    searchController.dispose();
    super.dispose();
  }

  @override
  bool get wantKeepAlive => true;

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return MultiBlocListener(
      listeners: [
        BlocListener<DashboardBloc, DashboardState>(
          listener: (context, state) {
            if (state is DashboardLoaded &&
                state.response.measurements?.isNotEmpty == true &&
                (markers.isEmpty || allMeasurements.isEmpty)) {
              _initializeWithData(state.response);
            }
          },
        ),
        BlocListener<MapBloc, MapState>(
          listener: (context, state) {
            if (state is MapLoaded || state is MapLoadedFromCache) {
              final response = state is MapLoaded
                  ? state.response
                  : (state as MapLoadedFromCache).response;
              if (response.measurements?.isNotEmpty == true) {
                _initializeWithData(response);
              }
            }
          },
        ),
        BlocListener<GooglePlacesBloc, GooglePlacesState>(
          listener: (context, state) {
            if (state is PlaceDetailsLoaded &&
                state.response.measurements.isNotEmpty &&
                mapControllerInitialized) {
              final measurement = state.response.measurements[0];
              if (measurement.siteDetails?.approximateLatitude != null &&
                  measurement.siteDetails?.approximateLongitude != null) {
                mapController.animateCamera(
                  CameraUpdate.newLatLngZoom(
                    LatLng(
                      measurement.siteDetails!.approximateLatitude!,
                      measurement.siteDetails!.approximateLongitude!,
                    ),
                    14,
                  ),
                );
              }
              FocusScope.of(context).unfocus();
              _sheetController.animateTo(
                _sheetPeekSize,
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOut,
              );
              if (mounted) {
                setState(() => _selectedCardMeasurement = measurement);
              }
            }
          },
        ),
      ],
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        body: isInitializing && markers.isEmpty && allMeasurements.isEmpty
            ? _buildLoadingView()
            : (!isInitializing &&
                    markers.isEmpty &&
                    allMeasurements.isEmpty &&
                    !isRetrying)
                ? _buildErrorView()
                : _buildMapView(),
      ),
    );
  }

  // ── Loading / error views ──────────────────────────────────────────────────

  Widget _buildLoadingView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primaryColor),
          const SizedBox(height: 16),
          TranslatedText(
            "Loading map data...",
            style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).textTheme.bodyMedium?.color),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.map_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          TranslatedText(
            "Unable to load map data",
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).textTheme.headlineMedium?.color),
          ),
          const SizedBox(height: 8),
          TranslatedText(
            "Please check your connection and try again",
            style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).textTheme.bodyMedium?.color),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _retryLoading,
            icon: const Icon(Icons.refresh),
            label: TranslatedText('Try Again'),
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }

  // ── Map view ───────────────────────────────────────────────────────────────

  Widget _buildMapView() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Keep card above the peek strip (13 % of screen height ≈ 103 px on most
    // phones) with a comfortable 14 px gap.
    final cardBottom =
        MediaQuery.of(context).size.height * _sheetPeekSize + 14;

    return Stack(
      children: [
        // ── Full-screen map ─────────────────────────────────────────────────
        GoogleMap(
          mapType: _currentMapType,
          style: _mapStyleJson,
          zoomControlsEnabled: false,
          myLocationEnabled: true,
          myLocationButtonEnabled: false,
          zoomGesturesEnabled: true,
          minMaxZoomPreference: MinMaxZoomPreference.unbounded,
          onMapCreated: _onMapCreated,
          initialCameraPosition:
              const CameraPosition(target: _center, zoom: 6),
          markers: markers.toSet(),
          onTap: (_) {
            if (mounted) setState(() => _selectedCardMeasurement = null);
          },
        ),

        // ── Top-right — layers / style picker ──────────────────────────────
        Positioned(
          top: 50,
          right: 12,
          child: _MapIconButton(
            icon: Icons.layers_outlined,
            isDark: isDark,
            onTap: _openMapStylePicker,
          ),
        ),

        // ── Top-right — geolocate + zoom (below layers button) ─────────────
        Positioned(
          top: 102, // 50 (layers top) + 40 (button height) + 12 gap
          right: 12,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _MapIconButton(
                icon: Icons.my_location,
                isDark: isDark,
                filled: true,
                onTap: _snapToUser,
              ),
              const SizedBox(height: 6),
              _ZoomGroup(
                isDark: isDark,
                onZoomIn: increaseZoom,
                onZoomOut: reduceZoom,
              ),
            ],
          ),
        ),

        // ── Top-left — AQ legend with emoji icons + tooltips ───────────────
        // top: 50 aligns the legend's top edge with the layers button on the
        // right. Width fixed at 40 px to match _MapIconButton.
        Positioned(
          top: 50,
          left: 10,
          child: Container(
            width: 40,
            padding: const EdgeInsets.symmetric(vertical: 7),
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.darkHighlight.withValues(alpha: 0.94)
                  : Colors.white.withValues(alpha: 0.95),
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x33536A87),
                  offset: Offset(0, 2),
                  blurRadius: 5,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: _aqLegendItems
                  .map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: TranslatedTooltip(
                        message: item.label,
                        preferBelow: false,
                        triggerMode: TooltipTriggerMode.tap,
                        textStyle:
                            const TextStyle(color: Colors.white, fontSize: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xff3E4147),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        verticalOffset: -18,
                        margin: const EdgeInsets.only(left: 52),
                        child: SvgPicture.asset(
                          item.asset,
                          width: 22,
                          height: 22,
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ),

        // ── Bottom sheet ────────────────────────────────────────────────────
        // expand: true (default) lets the sheet fill the Stack so it can
        // anchor its draggable child to the bottom. The BackdropFilter lives
        // inside the builder's child which is only rendered at initialChildSize
        // height, so blur is correctly scoped to the visible strip only.
        DraggableScrollableSheet(
          controller: _sheetController,
          initialChildSize: _sheetPeekSize,
          minChildSize: _sheetPeekSize,
          maxChildSize: _sheetMidSize,
          snap: true,
          snapSizes: const [_sheetPeekSize, _sheetMidSize],
          builder: (context, scrollController) =>
              _buildBottomSheet(scrollController, isDark),
        ),

        // ── Air quality card — above the sheet peek, rendered last (on top) ─
        Positioned(
          bottom: cardBottom,
          left: 12,
          right: 12,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            transitionBuilder: (child, animation) => SlideTransition(
              position: Tween(
                      begin: const Offset(0, 0.25), end: Offset.zero)
                  .animate(CurvedAnimation(
                      parent: animation, curve: Curves.easeOut)),
              child: FadeTransition(opacity: animation, child: child),
            ),
            child: _selectedCardMeasurement == null
                ? const SizedBox.shrink()
                : MapAirQualityCard(
                    key: ValueKey(_selectedCardMeasurement!.id),
                    measurement: _selectedCardMeasurement!,
                    onDismiss: () =>
                        setState(() => _selectedCardMeasurement = null),
                    onViewForecast: () =>
                        _showAnalyticsDetails(_selectedCardMeasurement!),
                  ),
          ),
        ),
      ],
    );
  }

  // ── Bottom sheet ───────────────────────────────────────────────────────────

  Widget _buildBottomSheet(
      ScrollController scrollController, bool isDark) {
    final activeNames =
        CountryRepository.extractActiveCountryNames(allMeasurements);
    final countries = CountryRepository.getActiveCountries(activeNames);
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          decoration: BoxDecoration(
            color: isDark
                ? AppColors.darkThemeBackground.withValues(alpha: 0.68)
                : Colors.white.withValues(alpha: 0.58),
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(20)),
            border: Border(
              top: BorderSide(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.07)
                    : Colors.white.withValues(alpha: 0.70),
                width: 1,
              ),
            ),
          ),
          child: CustomScrollView(
            controller: scrollController,
            slivers: [
              SliverToBoxAdapter(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Drag handle
                    Center(
                      child: Container(
                        margin: const EdgeInsets.only(top: 10, bottom: 12),
                        width: 36,
                        height: 4,
                        decoration: BoxDecoration(
                            color: Colors.grey.withValues(alpha: 0.35),
                            borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                    // Search bar
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 4),
                      child: LocationSearchBar(
                        controller: searchController,
                        focusNode: _searchFocusNode,
                        padding: EdgeInsets.zero,
                        onTap: () {
                          // Dismiss any open card when the user activates search
                          if (_selectedCardMeasurement != null && mounted) {
                            setState(() => _selectedCardMeasurement = null);
                          }
                          _sheetController.animateTo(
                            _sheetMidSize,
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeOut,
                          );
                        },
                        onChanged: (value) {
                          final q = value.trim();
                          // Empty clears are handled via [_onSearchControllerChanged].
                          if (q.isEmpty) return;
                          googlePlacesBloc!.add(SearchPlace(value));
                          if (mounted) {
                            setState(() {
                              localSearchResults =
                                  LocationHelper.searchAirQualityLocations(
                                      value, allMeasurements);
                            });
                          }
                        },
                      ),
                    ),
                    const SizedBox(height: 4),
                  ],
                ),
              ),
              SliverToBoxAdapter(
                child: BlocBuilder<GooglePlacesBloc, GooglePlacesState>(
                  builder: (context, placesState) {
                    final trimmed = searchController.text.trim();
                    // Empty query = nearby + chips regardless of bloc state so a
                    // stale in-flight autocomplete cannot block this UI after clear.
                    if (trimmed.isEmpty) {
                      return _buildNearbyList(isDark, countries);
                    }

                    if (placesState is SearchLoading) {
                      return Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(children: [
                          GooglePlacesLoader(),
                          const SizedBox(height: 12),
                          GooglePlacesLoader(),
                          const SizedBox(height: 12),
                          GooglePlacesLoader(),
                        ]),
                      );
                    }

                    if (placesState is SearchLoaded) {
                      return _buildSearchResults(placesState, isDark);
                    }

                    return _buildNearbyList(isDark, countries);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Nearby list ────────────────────────────────────────────────────────────

  Widget _buildNearbyList(bool isDark, List<CountryModel> countries) {
    // Resolve which measurements to show based on active chip
    final measurements = currentFilter == 'Nearby'
        ? (nearbyMeasurements.isNotEmpty
            ? nearbyMeasurements
            : allMeasurements.take(6).toList())
        : filteredMeasurements;

    final labelColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    final labelStyle = TextStyle(
      fontSize: 11,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.06,
      color: labelColor,
    );

    // Chip colours
    Color chipBg(bool selected) => selected
        ? AppColors.primaryColor
        : (isDark ? AppColors.darkHighlight : AppColors.dividerColorlight);
    Color chipText(bool selected) =>
        selected ? Colors.white : (isDark ? Colors.white : Colors.black87);

    Widget buildChip({
      required String label,
      required bool selected,
      required VoidCallback onTap,
      String? flag,
    }) {
      return GestureDetector(
        onTap: onTap,
        child: Container(
          height: 28,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            color: chipBg(selected),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (flag != null) ...[
                Text(flag, style: const TextStyle(fontSize: 12)),
                const SizedBox(width: 4),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                  color: chipText(selected),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 6),
          // ── Filter chips ─────────────────────────────────────────────────
          SizedBox(
            height: 32,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  buildChip(
                    label: 'Nearby',
                    selected: currentFilter == 'Nearby',
                    onTap: resetFilter,
                  ),
                  ...countries.map((c) => Padding(
                        padding: const EdgeInsets.only(left: 6),
                        child: buildChip(
                          label: c.countryName,
                          flag: c.flag,
                          selected: currentFilter == c.countryName,
                          onTap: () => filterByCountry(c.countryName),
                        ),
                      )),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          // ── Section label ─────────────────────────────────────────────────
          Text(
            currentFilter == 'Nearby' ? 'Nearby' : currentFilter,
            style: labelStyle,
          ),
          const SizedBox(height: 4),
          // ── Nearby place rows ──────────────────────────────────────────────
          if (measurements.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: TranslatedText(
                  'No locations available',
                  style: TextStyle(
                    color: labelColor,
                    fontSize: 13,
                  ),
                ),
              ),
            )
          else
            ...measurements.asMap().entries.map((entry) {
              final i = entry.key;
              final m = entry.value;
              final pm25 = m.pm25?.value ?? 0;
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  InkWell(
                    onTap: () {
                      _sheetController.animateTo(
                        _sheetPeekSize,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOut,
                      );
                      viewDetails(measurement: m);
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        children: [
                          SvgPicture.asset(
                            _aqLevel(pm25).asset,
                            width: 20,
                            height: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              m.siteDetails?.searchName ??
                                  m.siteDetails?.name ??
                                  '—',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: Theme.of(context)
                                    .textTheme
                                    .bodyLarge
                                    ?.color,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          _AqCategoryChip(
                            label: m.aqiCategory ?? '',
                            color: _aqLevel(pm25).color,
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (i < measurements.length - 1)
                    Divider(
                      indent: 16,
                      thickness: 0.5,
                      color: isDark
                          ? AppColors.dividerColordark
                          : AppColors.dividerColorlight,
                    ),
                ],
              );
            }),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  // ── Search results ─────────────────────────────────────────────────────────

  Widget _buildSearchResults(SearchLoaded state, bool isDark) {
    final predictions = state.response.predictions;
    final labelStyle = TextStyle(
      fontSize: 11,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.06,
      color: isDark
          ? AppColors.boldHeadlineColor2
          : AppColors.boldHeadlineColor3,
    );

    final widgets = <Widget>[];

    // AirQo places (matching local AQ data)
    if (localSearchResults.isNotEmpty) {
      final sectionLabel = predictions.isNotEmpty
          ? 'places in ${searchController.text.trim().toLowerCase()}'
          : '${localSearchResults.length} places found';

      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(sectionLabel, style: labelStyle),
      ));

      for (int i = 0; i < localSearchResults.length; i++) {
        final m = localSearchResults[i];
        final pm25 = m.pm25?.value ?? 0;
        widgets.add(InkWell(
          onTap: () {
            _sheetController.animateTo(
              _sheetPeekSize,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
            );
            viewDetails(measurement: m);
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              children: [
                SvgPicture.asset(
                  _aqLevel(pm25).asset,
                  width: 20,
                  height: 20,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    m.siteDetails?.searchName ?? m.siteDetails?.name ?? '—',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                _AqCategoryChip(
                  label: m.aqiCategory ?? '',
                  color: _aqLevel(pm25).color,
                ),
              ],
            ),
          ),
        ));
        if (i < localSearchResults.length - 1 || predictions.isNotEmpty) {
          widgets.add(Divider(
            indent: 16,
            thickness: 0.5,
            color: isDark
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
          ));
        }
      }
    }

    // Google Places rows
    if (predictions.isNotEmpty) {
      if (localSearchResults.isNotEmpty) {
        widgets.add(const SizedBox(height: 8));
      }
      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text('places', style: labelStyle),
      ));

      for (int i = 0; i < predictions.length; i++) {
        final pred = predictions[i];
        widgets.add(InkWell(
          onTap: () => viewDetails(placeName: pred.description),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              children: [
                SvgPicture.asset(
                  'assets/images/shared/location_pin.svg',
                  width: 20,
                  height: 20,
                  colorFilter: ColorFilter.mode(
                    isDark
                        ? AppColors.boldHeadlineColor2
                        : AppColors.boldHeadlineColor3,
                    BlendMode.srcIn,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    pred.description,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ));
        if (i < predictions.length - 1) {
          widgets.add(Divider(
            indent: 16,
            thickness: 0.5,
            color: isDark
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
          ));
        }
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          ...widgets,
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

// ─── Private control widgets ─────────────────────────────────────────────────

class _MapIconButton extends StatelessWidget {
  final IconData icon;
  final bool isDark;
  final bool filled;
  final VoidCallback onTap;

  const _MapIconButton({
    required this.icon,
    required this.isDark,
    required this.onTap,
    this.filled = false,
  });

  @override
  Widget build(BuildContext context) {
    final bg = filled
        ? AppColors.primaryColor
        : (isDark
            ? AppColors.darkHighlight.withValues(alpha: 0.94)
            : Colors.white.withValues(alpha: 0.95));
    final iconColor =
        filled ? Colors.white : Theme.of(context).textTheme.bodyMedium?.color;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(10),
          boxShadow: const [
            BoxShadow(
              color: Color(0x33536A87),
              offset: Offset(0, 2),
              blurRadius: 5,
            ),
          ],
        ),
        child: Icon(icon, size: 19, color: iconColor),
      ),
    );
  }
}

class _ZoomGroup extends StatelessWidget {
  final bool isDark;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;

  const _ZoomGroup({
    required this.isDark,
    required this.onZoomIn,
    required this.onZoomOut,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isDark
        ? AppColors.darkHighlight.withValues(alpha: 0.94)
        : Colors.white.withValues(alpha: 0.95);
    final iconColor = Theme.of(context).textTheme.bodyMedium?.color;
    final divider = Colors.grey.withValues(alpha: 0.25);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33536A87),
            offset: Offset(0, 2),
            blurRadius: 5,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: onZoomIn,
            child: Container(
              width: 40,
              height: 28,
              decoration: BoxDecoration(
                color: bg,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(10)),
                border: Border(
                    bottom: BorderSide(color: divider, width: 0.8)),
              ),
              child: Icon(Icons.add, size: 17, color: iconColor),
            ),
          ),
          GestureDetector(
            onTap: onZoomOut,
            child: Container(
              width: 40,
              height: 28,
              decoration: BoxDecoration(
                color: bg,
                borderRadius: const BorderRadius.vertical(
                    bottom: Radius.circular(10)),
              ),
              child: Icon(Icons.remove, size: 17, color: iconColor),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Compact AQ category chip — mirrors AnalyticsCard pill, scaled for rows ─

class _AqCategoryChip extends StatelessWidget {
  final String label;
  final Color color;

  const _AqCategoryChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    if (label.isEmpty) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
