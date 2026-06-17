import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/utils/location_helpers.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:airqo/src/app/map/controllers/map_camera_controller.dart';
import 'package:airqo/src/app/map/utils/map_marker_builder.dart';
import 'package:airqo/src/app/map/widgets/map_aq_card_layer.dart';
import 'package:airqo/src/app/map/widgets/map_controls.dart';
import 'package:airqo/src/app/map/widgets/map_error_view.dart';
import 'package:airqo/src/app/map/widgets/map_loading_view.dart';
import 'package:airqo/src/app/map/widgets/map_overlay_controls.dart';
import 'package:airqo/src/app/map/widgets/map_search_sheet.dart';
import 'package:airqo/src/app/map/widgets/map_style_picker.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen>
    with AutomaticKeepAliveClientMixin, UiLoggy {
  final _cameraController = MapCameraController();

  TextEditingController searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  final DraggableScrollableController _sheetController =
      DraggableScrollableController();

  List<Measurement> allMeasurements = [];
  List<Measurement> localSearchResults = [];
  List<Measurement> nearbyMeasurements = [];
  Position? userPosition;

  Set<Marker> _mapMarkers = {};
  bool isInitializing = true;
  bool isRetrying = false;
  late GooglePlacesBloc googlePlacesBloc;

  final MapMarkerBuilder _markerBuilder = MapMarkerBuilder();
  MapType _currentMapType = MapType.normal;
  Measurement? _selectedCardMeasurement;
  String? _mapStyleJson;
  int _markerBuildSeq = 0;

  static const LatLng _center = LatLng(0.347596, 32.582520);
  static const double _sheetPeekSize = 0.13;
  static const double _sheetMidSize = 0.44;

  void _onMapCreated(GoogleMapController controller) {
    _cameraController.onCreated(controller);
    if (mounted) setState(() {});
    if (userPosition != null) {
      _cameraController.snapToPosition(userPosition!);
    } else if (_mapMarkers.isNotEmpty) {
      _cameraController.fitMeasurementsInView(allMeasurements);
    }
  }

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

  Future<void> _animateSheetTo(double size) async {
    if (!_sheetController.isAttached) return;
    await _sheetController.animateTo(
      size,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  void viewDetails({Measurement? measurement, String? placeName}) {
    FocusScope.of(context).unfocus();
    _animateSheetTo(_sheetPeekSize);

    if (measurement != null) {
      if (_cameraController.isInitialized &&
          measurement.siteDetails?.approximateLatitude != null &&
          measurement.siteDetails?.approximateLongitude != null) {
        _cameraController.animateTo(
          LatLng(
            measurement.siteDetails!.approximateLatitude!,
            measurement.siteDetails!.approximateLongitude!,
          ),
        );
      }
      if (mounted) setState(() => _selectedCardMeasurement = measurement);
    } else if (placeName != null) {
      googlePlacesBloc.add(GetPlaceDetails(placeName));
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

  Future<void> addMarkers(AirQualityResponse response) async {
    if (response.measurements == null || response.measurements!.isEmpty) return;
    await _refreshMarkers(response.measurements!);
  }

  Future<void> _refreshMarkers([List<Measurement>? source]) async {
    final seq = ++_markerBuildSeq;
    final measurements = source ?? allMeasurements;
    final newMarkers = await _markerBuilder.buildMarkers(
      measurements: measurements,
      onMeasurementTap: (measurement) => viewDetails(measurement: measurement),
    );
    if (!mounted || seq != _markerBuildSeq) return;
    if (mounted) {
      setState(() {
        _mapMarkers = newMarkers.toSet();
        isInitializing = false;
      });
    }
    // Only fit on initial data load, not on later marker refreshes.
    if (source != null &&
        _cameraController.isInitialized &&
        _mapMarkers.isNotEmpty &&
        userPosition == null) {
      _cameraController.fitMeasurementsInView(allMeasurements);
    }
  }

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
      _updateNearbyMeasurements();
      _cameraController.snapToPosition(userPosition!);
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

  Future<void> _initializeWithData(AirQualityResponse response) async {
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
    googlePlacesBloc.add(ResetGooglePlaces());
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
    googlePlacesBloc.add(SearchPlace(value));
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

  @override
  void initState() {
    super.initState();
    searchController.addListener(_onSearchControllerChanged);
    googlePlacesBloc = context.read<GooglePlacesBloc>()
      ..add(ResetGooglePlaces());
    _loadDataFromAvailableSources();
    _getUserLocation();
    WidgetsBinding.instance.addPostFrameCallback((_) => _applyMapStyle());
  }

  @override
  void dispose() {
    searchController.removeListener(_onSearchControllerChanged);
    _sheetController.dispose();
    _searchFocusNode.dispose();
    searchController.dispose();
    _cameraController.dispose();
    super.dispose();
  }

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return MultiBlocListener(
      listeners: [
        BlocListener<DashboardBloc, DashboardState>(
          listener: (context, state) {
            if (state is DashboardLoaded &&
                state.response.measurements?.isNotEmpty == true &&
                (_mapMarkers.isEmpty || allMeasurements.isEmpty)) {
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
              if (response.measurements?.isNotEmpty == true &&
                  (_mapMarkers.isEmpty || allMeasurements.isEmpty)) {
                _initializeWithData(response);
              }
            } else if (state is MapLoadingError) {
              if (mounted) setState(() => isInitializing = false);
            }
          },
        ),
        BlocListener<GooglePlacesBloc, GooglePlacesState>(
          listener: (context, state) {
            if (state is PlaceDetailsLoaded &&
                state.response.measurements.isNotEmpty &&
                _cameraController.isInitialized) {
              final measurement = state.response.measurements[0];
              if (measurement.siteDetails?.approximateLatitude != null &&
                  measurement.siteDetails?.approximateLongitude != null) {
                _cameraController.animateTo(
                  LatLng(
                    measurement.siteDetails!.approximateLatitude!,
                    measurement.siteDetails!.approximateLongitude!,
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
        body: isInitializing && _mapMarkers.isEmpty && allMeasurements.isEmpty
            ? const MapLoadingView()
            : (!isInitializing &&
                    _mapMarkers.isEmpty &&
                    allMeasurements.isEmpty &&
                    !isRetrying)
                ? MapErrorView(onRetry: _retryLoading, isOffline: !CacheManager().isConnected)
                : _buildMapView(),
      ),
    );
  }

  Widget _buildMapView() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBottom = MediaQuery.of(context).size.height * _sheetPeekSize + 14;

    return Stack(
      children: [
        GoogleMap(
          mapType: _currentMapType,
          style: _mapStyleJson,
          zoomControlsEnabled: false,
          myLocationEnabled: true,
          myLocationButtonEnabled: false,
          zoomGesturesEnabled: true,
          minMaxZoomPreference: MinMaxZoomPreference.unbounded,
          onMapCreated: _onMapCreated,
          initialCameraPosition: const CameraPosition(target: _center, zoom: 6),
          markers: _mapMarkers,
          onTap: (_) {
            if (mounted) setState(() => _selectedCardMeasurement = null);
          },
        ),
        Positioned.fill(
          child: MapOverlayControls(
            isDark: isDark,
            onLayersTap: _openMapStylePicker,
            onLocateTap: userPosition != null
                ? () => _cameraController.snapToPosition(userPosition!)
                : null,
            onZoomIn: _cameraController.increaseZoom,
            onZoomOut: _cameraController.reduceZoom,
          ),
        ),
        Positioned(
          top: 50,
          left: 10,
          child: MapAqLegend(isDark: isDark),
        ),
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
        MapAqCardLayer(
          bottom: cardBottom,
          measurement: _selectedCardMeasurement,
          onDismiss: () => setState(() => _selectedCardMeasurement = null),
          onViewForecast: () =>
              _showAnalyticsDetails(_selectedCardMeasurement!),
        ),
      ],
    );
  }
}
