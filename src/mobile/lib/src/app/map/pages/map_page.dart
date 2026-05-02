import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/utils/location_helpers.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:airqo/src/app/map/utils/map_marker_builder.dart';
import 'package:airqo/src/app/map/widgets/map_air_quality_card.dart';
import 'package:airqo/src/app/map/widgets/map_controls.dart';
import 'package:airqo/src/app/map/widgets/map_search_sheet.dart';
import 'package:airqo/src/app/map/widgets/map_style_picker.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:loggy/loggy.dart';

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
  Position? userPosition;
  String? userCountry;

  List<Marker> markers = [];
  bool isInitializing = true;
  bool isRetrying = false;
  bool mapControllerInitialized = false;
  GooglePlacesBloc? googlePlacesBloc;

  final MapMarkerBuilder _markerBuilder = MapMarkerBuilder();
  MapType _currentMapType = MapType.normal;
  Measurement? _selectedCardMeasurement;
  String? _mapStyleJson;
  double _currentZoom = 6.0;
  int _markerBuildSeq = 0;

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
    if (!mapControllerInitialized || allMeasurements.isEmpty) return;
    try {
      double minLat = 90.0, maxLat = -90.0, minLng = 180.0, maxLng = -180.0;
      for (final measurement in allMeasurements) {
        final lat = measurement.siteDetails?.approximateLatitude;
        final lng = measurement.siteDetails?.approximateLongitude;
        if (lat == null || lng == null) continue;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
      if (minLat == 90.0 || minLng == 180.0) return;
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

  Future<void> _animateSheetTo(double size) async {
    if (!_sheetController.isAttached) return;
    await _sheetController.animateTo(
      size,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  // ── Details / card ─────────────────────────────────────────────────────────

  void viewDetails({Measurement? measurement, String? placeName}) {
    // Dismiss keyboard and collapse sheet whenever a result is selected
    FocusScope.of(context).unfocus();
    _animateSheetTo(_sheetPeekSize);

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
    await _refreshMarkers(response.measurements!);
  }

  Future<void> _refreshMarkers([List<Measurement>? source]) async {
    final seq = ++_markerBuildSeq;
    final measurements = source ?? allMeasurements;
    final newMarkers = await _markerBuilder.buildMarkers(
      measurements: measurements,
      zoom: _currentZoom,
      onMeasurementTap: (measurement) => viewDetails(measurement: measurement),
      onClusterTap: _zoomToCluster,
    );
    if (!mounted || seq != _markerBuildSeq) return;
    if (mounted) {
      setState(() {
        markers = newMarkers;
        isInitializing = false;
      });
    }
    if (mapControllerInitialized &&
        markers.isNotEmpty &&
        userPosition == null) {
      _fitMarkersInView();
    }
  }

  Future<void> _zoomToCluster(List<Measurement> members) async {
    if (!mapControllerInitialized) return;
    try {
      double minLat = 90.0, maxLat = -90.0, minLng = 180.0, maxLng = -180.0;
      for (final measurement in members) {
        final lat = measurement.siteDetails!.approximateLatitude!;
        final lng = measurement.siteDetails!.approximateLongitude!;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
      await mapController.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(minLat, minLng),
            northeast: LatLng(maxLat, maxLng),
          ),
          60,
        ),
      );
    } catch (e) {
      loggy.warning('Failed to zoom to cluster: $e');
      final zoom = await mapController.getZoomLevel();
      await mapController.animateCamera(CameraUpdate.zoomTo(zoom + 2));
    }
  }

  void _onCameraMove(CameraPosition position) {
    if (position.zoom.floor() == _currentZoom.floor()) return;
    _currentZoom = position.zoom;
    _refreshMarkers();
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
  /// restores nearby results and resets autocomplete when the field is emptied.
  void _onSearchControllerChanged() {
    if (!mounted) return;
    if (searchController.text.trim().isNotEmpty) return;
    googlePlacesBloc!.add(ResetGooglePlaces());
    _animateSheetTo(_sheetPeekSize);
    setState(() {
      localSearchResults = [];
    });
  }

  void _onSearchTap() {
    if (_selectedCardMeasurement != null && mounted) {
      setState(() => _selectedCardMeasurement = null);
    }
    _animateSheetTo(_sheetMidSize);
  }

  void _onSearchChanged(String value) {
    final query = value.trim();
    if (query.isEmpty) return;
    googlePlacesBloc!.add(SearchPlace(value));
    if (mounted) {
      setState(() {
        localSearchResults =
            LocationHelper.searchAirQualityLocations(value, allMeasurements);
      });
    }
  }

  void _selectMeasurementFromSheet(Measurement measurement) {
    _animateSheetTo(_sheetPeekSize);
    viewDetails(measurement: measurement);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    searchController.addListener(_onSearchControllerChanged);
    googlePlacesBloc = context.read<GooglePlacesBloc>()
      ..add(ResetGooglePlaces());
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
              _animateSheetTo(_sheetPeekSize);
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
    final cardBottom = MediaQuery.of(context).size.height * _sheetPeekSize + 14;

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
          onCameraMove: _onCameraMove,
          initialCameraPosition: const CameraPosition(target: _center, zoom: 6),
          markers: markers.toSet(),
          onTap: (_) {
            if (mounted) setState(() => _selectedCardMeasurement = null);
          },
        ),

        // ── Top-right — layers / style picker ──────────────────────────────
        Positioned(
          top: 50,
          right: 12,
          child: MapIconButton(
            icon: Icons.layers_outlined,
            isDark: isDark,
            onTap: _openMapStylePicker,
          ),
        ),

        // ── Top-right — geolocate + zoom (below layers button) ─────────────
        Positioned(
          top: 90, // 50 (layers top) + 32 (button height) + 8 gap
          right: 12,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MapIconButton(
                icon: Icons.my_location,
                isDark: isDark,
                filled: true,
                onTap: _snapToUser,
              ),
              const SizedBox(height: 6),
              MapZoomGroup(
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
          child: MapAqLegend(isDark: isDark),
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
          builder: (context, scrollController) => MapSearchSheet(
            scrollController: scrollController,
            isDark: isDark,
            searchController: searchController,
            searchFocusNode: _searchFocusNode,
            allMeasurements: allMeasurements,
            nearbyMeasurements: nearbyMeasurements,
            localSearchResults: localSearchResults,
            hasUserPosition: userPosition != null,
            onSearchTap: _onSearchTap,
            onSearchChanged: _onSearchChanged,
            onMeasurementSelected: _selectMeasurementFromSheet,
            onPlaceSelected: (placeName) => viewDetails(placeName: placeName),
          ),
        ),

        // ── Air quality card — above the sheet peek, rendered last (on top) ─
        Positioned(
          bottom: cardBottom,
          left: 12,
          right: 12,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            transitionBuilder: (child, animation) => SlideTransition(
              position: Tween(begin: const Offset(0, 0.25), end: Offset.zero)
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
}
