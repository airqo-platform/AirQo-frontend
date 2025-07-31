import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/countries_chip.dart';
import 'package:airqo/src/app/dashboard/widgets/google_places_loader.dart';
import 'package:airqo/src/app/dashboard/widgets/location_display_widget.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/other/places/models/auto_complete_response.dart';
import 'package:airqo/src/app/shared/widgets/analytics_card_loader.dart';
import 'package:airqo/src/app/shared/widgets/country_button';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/app/shared/widgets/modal_wrapper.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:airqo/src/meta/utils/widget_to_map_icon.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';
import 'package:loggy/loggy.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen>
    with AutomaticKeepAliveClientMixin, UiLoggy {
  late GoogleMapController mapController;

  String? currentDetailsName;
  TextEditingController searchController = TextEditingController();

  bool showDetails = false;
  bool showCustomDetails = false;
  Measurement? currentDetails;

  List<Measurement> filteredMeasurements = [];
  String currentFilter = "All";

  List<Measurement> allMeasurements = [];
  List<Measurement> localSearchResults = [];

  List<Marker> markers = [];
  bool isInitializing = true;
  bool isRetrying = false;
  bool mapControllerInitialized = false;

  final LatLng _center = const LatLng(0.347596, 32.582520);

  // Map zoom controls
  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
    setState(() {
      mapControllerInitialized = true;
    });

    if (markers.isNotEmpty) {
      _fitMarkersInView();
    }
  }

  Future<void> _fitMarkersInView() async {
    if (!mapControllerInitialized || markers.isEmpty) return;

    try {
      // Calculate bounds
      double minLat = 90.0;
      double maxLat = -90.0;
      double minLng = 180.0;
      double maxLng = -180.0;

      for (final marker in markers) {
        final position = marker.position;
        minLat = position.latitude < minLat ? position.latitude : minLat;
        maxLat = position.latitude > maxLat ? position.latitude : maxLat;
        minLng = position.longitude < minLng ? position.longitude : minLng;
        maxLng = position.longitude > maxLng ? position.longitude : maxLng;
      }

      // Add padding
      final latPadding = (maxLat - minLat) * 0.1;
      final lngPadding = (maxLng - minLng) * 0.1;

      final bounds = LatLngBounds(
        southwest: LatLng(minLat - latPadding, minLng - lngPadding),
        northeast: LatLng(maxLat + latPadding, maxLng + lngPadding),
      );

      final cameraUpdate = CameraUpdate.newLatLngBounds(bounds, 50.0);
      await mapController.animateCamera(cameraUpdate);
    } catch (e) {
      loggy.error('Error fitting markers to bounds: $e');

      mapController.animateCamera(CameraUpdate.newLatLngZoom(_center, 6));
    }
  }

  Future<void> reduceZoom() async {
    if (!mapControllerInitialized) return;

    var currentZoomLevel = await mapController.getZoomLevel();
    currentZoomLevel = currentZoomLevel - 2;
    mapController.animateCamera(CameraUpdate.zoomTo(currentZoomLevel));
  }

  Future<void> increaseZoom() async {
    if (!mapControllerInitialized) return;

    var currentZoomLevel = await mapController.getZoomLevel();
    currentZoomLevel = currentZoomLevel + 2;
    mapController.animateCamera(CameraUpdate.zoomTo(currentZoomLevel));
  }

  void viewDetails({Measurement? measurement, String? placeName}) {
    if (measurement != null) {
      setState(() {
        showDetails = true;
        currentDetails = measurement;
      });

      if (mapControllerInitialized &&
          measurement.siteDetails?.approximateLatitude != null &&
          measurement.siteDetails?.approximateLongitude != null) {
        mapController.animateCamera(
          CameraUpdate.newLatLngZoom(
            LatLng(measurement.siteDetails!.approximateLatitude!,
                measurement.siteDetails!.approximateLongitude!),
            16,
          ),
        );
      }
    } else if (measurement == null && placeName != null) {
      googlePlacesBloc!.add(GetPlaceDetails(placeName));
      setState(() {
        showDetails = true;
        currentDetailsName = placeName;
      });
    }
  }

  void resetDetails() {
    if (mapControllerInitialized) {
      mapController.animateCamera(
        CameraUpdate.newLatLngZoom(
          _center,
          6,
        ),
      );
    }

    setState(() {
      showDetails = false;
      currentDetails = null;
      currentDetailsName = null;
    });
  }

  // Search handling
  void clearGooglePlaces() {
    googlePlacesBloc!.add(ResetGooglePlaces());
    searchController.clear();
    setState(() {
      localSearchResults = [];
    });
  }

  List<Measurement> searchAirQualityLocations(
      String query, List<Measurement> measurements) {
    query = query.toLowerCase();
    return measurements.where((measurement) {
      if (measurement.siteDetails != null) {
        return (measurement.siteDetails!.city?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.locationName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.name?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.searchName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.formattedName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.town?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.district?.toLowerCase().contains(query) ??
                false);
      }
      return false;
    }).toList();
  }

  void filterByCountry(String country, List<Measurement> measurements) {
    setState(() {
      filteredMeasurements = measurements.where((measurement) {
        if (measurement.siteDetails != null) {
          return measurement.siteDetails!.country == country;
        }
        return false;
      }).toList();
      currentFilter = country;
    });
  }

  void resetFilter() {
    setState(() {
      filteredMeasurements = [];
      currentFilter = "All";
    });
  }

  GooglePlacesBloc? googlePlacesBloc;

  Future<void> addMarkers(AirQualityResponse response) async {
    if (response.measurements == null || response.measurements!.isEmpty) {
      loggy.warning('No measurements to create markers from');
      return;
    }

    final newMarkers = <Marker>[];

    for (var measurement in response.measurements!) {
      if (measurement.siteDetails != null &&
          measurement.siteDetails!.approximateLatitude != null &&
          measurement.siteDetails!.approximateLongitude != null &&
          measurement.id != null) {
        try {
          final double? pmValue = measurement.pm25?.value;
          if (pmValue != null) {
            newMarkers.add(Marker(
              onTap: () => viewDetails(measurement: measurement),
              icon: await bitmapDescriptorFromSvgAsset(
                  getAirQualityIcon(measurement, pmValue)),
              position: LatLng(measurement.siteDetails!.approximateLatitude!,
                  measurement.siteDetails!.approximateLongitude!),
              markerId: MarkerId(measurement.id!),
            ));
          }
        } catch (e) {
          loggy.warning(
              'Error creating marker for measurement ${measurement.id}: $e');
        }
      }
    }

    setState(() {
      markers = newMarkers;
      isInitializing = false;
    });

    if (mapControllerInitialized && markers.isNotEmpty) {
      _fitMarkersInView();
    }
  }

  Future<void> _retryLoading() async {
    if (isRetrying) return;

    setState(() {
      isRetrying = true;
    });

    // Load from map bloc
    context.read<MapBloc>().add(LoadMap(forceRefresh: true));

    // Wait a short time to show loading state
    await Future.delayed(Duration(seconds: 2));

    if (mounted) {
      setState(() {
        isRetrying = false;
      });
    }
  }

  void populateMeasurements(List<Measurement> measurements) {
    List<Measurement> finalMeasurements = [];

    for (var meas in measurements) {
      if (meas.siteDetails != null) {
        finalMeasurements.add(meas);
      }
    }

    if (finalMeasurements.isNotEmpty) {
      setState(() {
        allMeasurements = finalMeasurements;
        isInitializing = false;
      });
    }
  }

  void _initializeWithData(AirQualityResponse response) async {
    await addMarkers(response);
    populateMeasurements(response.measurements ?? []);
  }

  // UI state
  bool isModalFull = false;

  void toggleModal(bool value) {
    if (isModalFull != value) {
      setState(() {
        isModalFull = value;
      });
    }
  }

  @override
  void initState() {
    googlePlacesBloc = context.read<GooglePlacesBloc>()
      ..add(ResetGooglePlaces());

    _loadDataFromAvailableSources();

    super.initState();
  }

  void _loadDataFromAvailableSources() {
    final dashboardState = context.read<DashboardBloc>().state;
    if (dashboardState is DashboardLoaded &&
        dashboardState.response.measurements != null &&
        dashboardState.response.measurements!.isNotEmpty) {
      _initializeWithData(dashboardState.response);
    }

    context.read<MapBloc>().add(LoadMap());
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    final List<CountryModel> countries = CountryRepository.countries;

    final List<Map<String, String>> airQualityData = [
      {
        "name": "Good",
        "airQualityRange": "0 - 12",
        "image": "assets/images/shared/airquality_indicators/good.svg"
      },
      {
        "name": "Moderate",
        "airQualityRange": "12.1 - 35.4",
        "image": "assets/images/shared/airquality_indicators/moderate.svg"
      },
      {
        "name": "Unhealthy for Sensitive Groups",
        "airQualityRange": "35.5 - 55.4",
        "image":
            "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg"
      },
      {
        "name": "Unhealthy",
        "airQualityRange": "55.5 - 150.4",
        "image": "assets/images/shared/airquality_indicators/unhealthy.svg"
      },
      {
        "name": "Very Unhealthy",
        "airQualityRange": "150.5 - 250.4",
        "image": "assets/images/shared/airquality_indicators/very-unhealthy.svg"
      },
      {
        "name": "Hazardous",
        "airQualityRange": "250.5 and above",
        "image": "assets/images/shared/airquality_indicators/hazardous.svg"
      },
    ];

    return MultiBlocListener(
      listeners: [
        BlocListener<DashboardBloc, DashboardState>(
          listener: (context, state) {
            if (state is DashboardLoaded &&
                state.response.measurements != null &&
                state.response.measurements!.isNotEmpty) {
              if (markers.isEmpty || allMeasurements.isEmpty) {
                _initializeWithData(state.response);
              }
            }
          },
        ),
        BlocListener<MapBloc, MapState>(
          listener: (context, state) {
            if (state is MapLoaded || state is MapLoadedFromCache) {
              final response = state is MapLoaded
                  ? state.response
                  : (state as MapLoadedFromCache).response;

              if (response.measurements != null &&
                  response.measurements!.isNotEmpty) {
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
                    LatLng(measurement.siteDetails!.approximateLatitude!,
                        measurement.siteDetails!.approximateLongitude!),
                    16,
                  ),
                );
              }
            }
          },
        ),
      ],
      child: Scaffold(
        body: Stack(
          children: [
            // Map base layer
            Container(
              height: double.infinity,
              width: double.infinity,
              color: Colors.grey[200],
            ),

            if (isInitializing && markers.isEmpty && allMeasurements.isEmpty)
              _buildLoadingView()
            else if (!isInitializing &&
                markers.isEmpty &&
                allMeasurements.isEmpty &&
                !isRetrying)
              _buildErrorView()
            else
              _buildMapView(airQualityData, countries),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primaryColor),
          SizedBox(height: 16),
          Text(
            "Loading map data...",
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
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
          Icon(
            Icons.map_outlined,
            size: 64,
            color: Colors.grey,
          ),
          SizedBox(height: 16),
          Text(
            "Unable to load map data",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.headlineMedium?.color,
            ),
          ),
          SizedBox(height: 8),
          Text(
            "Please check your connection and try again",
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _retryLoading,
            icon: Icon(Icons.refresh),
            label: Text('Try Again'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapView(
      List<Map<String, String>> airQualityData, List<CountryModel> countries) {
    return Stack(
      children: [
        // Google Map
        GoogleMap(
          zoomControlsEnabled: false,
          myLocationEnabled: false,
          zoomGesturesEnabled: true,
          minMaxZoomPreference: MinMaxZoomPreference.unbounded,
          onMapCreated: _onMapCreated,
          initialCameraPosition: CameraPosition(
            target: _center,
            zoom: 6,
          ),
          markers: markers.toSet(),
        ),

        // UI Overlay
        SizedBox(
          height: MediaQuery.of(context).size.height,
          width: MediaQuery.of(context).size.width,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (!isModalFull || showDetails)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Air quality legend
                        Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Color(0xff3E4147)
                                    : Colors.white,
                            borderRadius: BorderRadius.circular(44),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 5,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              mainAxisSize: MainAxisSize.min,
                              children: airQualityData.map((e) {
                                return Tooltip(
                                  preferBelow: false,
                                  textStyle: TextStyle(color: Colors.white),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(4),
                                      color: Color(0xff3E4147)),
                                  triggerMode: TooltipTriggerMode.tap,
                                  message: "Air Quality is ${e['name']}",
                                  verticalOffset: -18,
                                  margin: EdgeInsets.only(left: 65),
                                  child: Container(
                                      margin: const EdgeInsets.only(top: 4),
                                      height: 40,
                                      width: 40,
                                      child: SvgPicture.asset(
                                        e['image']!,
                                        fit: BoxFit.cover,
                                      )),
                                );
                              }).toList()),
                        ),
                        Spacer(),
                        // Zoom controls
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          height: 90,
                          width: 44,
                          decoration: BoxDecoration(
                            color:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Color(0xff3E4147)
                                    : Colors.white,
                            borderRadius: BorderRadius.circular(44),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 5,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              Expanded(
                                  child: GestureDetector(
                                      onTap: () async => await increaseZoom(),
                                      child: Icon(Icons.add))),
                              Divider(),
                              Expanded(
                                  child: GestureDetector(
                                      onTap: () async => await reduceZoom(),
                                      child: Icon(Icons.remove)))
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),

              // Bottom panel with details or list
              Expanded(
                child: Builder(
                  builder: (context) {
                    if (showDetails && currentDetailsName == null) {
                      return _buildMeasurementDetailsPanel();
                    } else if (showDetails && currentDetailsName != null) {
                      return _buildPlaceDetailsPanel();
                    } else {
                      return _buildSearchAndListPanel(countries);
                    }
                  },
                ),
              )
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMeasurementDetailsPanel() {
    if (currentDetails == null) return SizedBox.shrink();

    return SizedBox(
        width: double.infinity,
        child: ModalWrapper(
          child: Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    margin: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        SizedBox(),
                        Text(
                          currentDetails!.siteDetails!.searchName ??
                              currentDetails!.siteDetails!.name ??
                              "---",
                          style: TextStyle(
                              color: Color(0xff9EA3AA),
                              fontSize: 20,
                              fontWeight: FontWeight.w700),
                        ),
                        GestureDetector(
                            onTap: () => resetDetails(),
                            child: Icon(Icons.close))
                      ],
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text("Today",
                            style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 20,
                                color: AppColors.boldHeadlineColor)),
                        Row(children: [
                          SizedBox(width: 8),
                        ])
                      ],
                    ),
                  ),
                  Expanded(
                    child: AnalyticsCard(currentDetails!),
                  ),
                ],
              )),
        ));
  }

  Widget _buildPlaceDetailsPanel() {
    return BlocBuilder<GooglePlacesBloc, GooglePlacesState>(
      builder: (context, state) {
        if (state is PlaceDetailsLoaded) {
          Measurement measurement = state.response.measurements[0];
          return SizedBox(
            width: double.infinity,
            child: ModalWrapper(
              child: Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        margin: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            SizedBox(),
                            Text(
                              measurement.siteDetails!.searchName ??
                                  measurement.siteDetails!.name ??
                                  "---",
                              style: TextStyle(
                                  color: Color(0xff9EA3AA),
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700),
                            ),
                            GestureDetector(
                                onTap: () => resetDetails(),
                                child: Icon(Icons.close))
                          ],
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 16),
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text("Today",
                                style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 20,
                                    color: AppColors.boldHeadlineColor)),
                            Row(children: [
                              Container(
                                decoration: BoxDecoration(
                                    color: AppColors.highlightColor,
                                    borderRadius: BorderRadius.circular(100)),
                                height: 40,
                                width: 52,
                                child: Center(
                                  child: Padding(
                                    padding: const EdgeInsets.only(left: 8.0),
                                    child: Icon(
                                      size: 20,
                                      Icons.arrow_back_ios,
                                      color: AppColors.boldHeadlineColor,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(width: 8),
                              Container(
                                decoration: BoxDecoration(
                                    color: AppColors.highlightColor,
                                    borderRadius: BorderRadius.circular(100)),
                                height: 40,
                                width: 52,
                                child: Center(
                                  child: Icon(
                                    Icons.arrow_forward_ios,
                                    size: 20,
                                    color: AppColors.boldHeadlineColor,
                                  ),
                                ),
                              )
                            ])
                          ],
                        ),
                      ),
                      Expanded(
                        child: AnalyticsCard(measurement),
                      ),
                    ],
                  )),
            ),
          );
        } else if (state is PlaceDetailsLoading) {
          return SizedBox(
            width: double.infinity,
            child: ModalWrapper(
              child: Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        margin: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            SizedBox(),
                            ShimmerText(
                              height: 15,
                              width: 150,
                            ),
                            GestureDetector(
                                onTap: () => resetDetails(),
                                child: Icon(Icons.close))
                          ],
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 16),
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text("Today",
                                style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 20,
                                    color: AppColors.boldHeadlineColor)),
                            Row(children: [
                              Container(
                                decoration: BoxDecoration(
                                    color: AppColors.highlightColor,
                                    borderRadius: BorderRadius.circular(100)),
                                height: 40,
                                width: 52,
                                child: Center(
                                  child: Padding(
                                    padding: const EdgeInsets.only(left: 8.0),
                                    child: Icon(
                                      size: 20,
                                      Icons.arrow_back_ios,
                                      color: AppColors.boldHeadlineColor,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(width: 8),
                              Container(
                                decoration: BoxDecoration(
                                    color: AppColors.highlightColor,
                                    borderRadius: BorderRadius.circular(100)),
                                height: 40,
                                width: 52,
                                child: Center(
                                  child: Icon(
                                    Icons.arrow_forward_ios,
                                    size: 20,
                                    color: AppColors.boldHeadlineColor,
                                  ),
                                ),
                              )
                            ])
                          ],
                        ),
                      ),
                      Expanded(
                        child: AnalyticsCardLoader(),
                      ),
                    ],
                  )),
            ),
          );
        }

        return SizedBox();
      },
    );
  }

  Widget _buildSearchAndListPanel(List<CountryModel> countries) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 300),
      height: isModalFull ? MediaQuery.of(context).size.height : 350,
      width: double.infinity,
      child: ModalWrapper(
        child: Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isModalFull) SizedBox(height: 16),
              Row(
                children: [
                  Text("AirQo map",
                      style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.boldHeadlineColor)),
                  Spacer(),
                  if (isModalFull)
                    IconButton(
                        onPressed: () => toggleModal(false),
                        icon: Icon(Icons.close))
                ],
              ),
              SizedBox(height: 16),
              Container(
                height: 45,
                child: Padding(
                  padding: const EdgeInsets.only(top: 0),
                  child: TextField(
                    controller: searchController,
                    onChanged: (value) {
                      if (value.isEmpty) {
                        googlePlacesBloc!.add(ResetGooglePlaces());
                        setState(() {
                          localSearchResults = [];
                        });
                      } else {
                        googlePlacesBloc!.add(SearchPlace(value));
                        setState(() {
                          localSearchResults =
                              searchAirQualityLocations(value, allMeasurements);
                        });
                      }
                    },
                    style: TextStyle(fontSize: 14),
                    onTap: () => toggleModal(true),
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.only(top: 24),
                      hintText: "Search Villages, Cities or Countries",
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(11.0),
                        child: SvgPicture.asset(
                          "assets/icons/search_icon.svg",
                          height: 15,
                          color:
                              Theme.of(context).textTheme.headlineLarge!.color,
                        ),
                      ),
                      suffixIcon:
                          BlocBuilder<GooglePlacesBloc, GooglePlacesState>(
                        builder: (context, state) {
                          if (state is SearchLoaded || state is SearchLoading) {
                            return GestureDetector(
                                onTap: () => clearGooglePlaces(),
                                child: Icon(
                                  Icons.close,
                                  color: Theme.of(context)
                                      .textTheme
                                      .headlineLarge!
                                      .color,
                                ));
                          }
                          return SizedBox();
                        },
                      ),
                      focusedBorder: OutlineInputBorder(
                          borderSide:
                              BorderSide(color: AppColors.primaryColor)),
                      enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                              color: Theme.of(context).highlightColor)),
                      border: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 12),
              BlocBuilder<GooglePlacesBloc, GooglePlacesState>(
                builder: (context, placesState) {
                  if (placesState is SearchLoading) {
                    return Column(
                      children: [
                        GooglePlacesLoader(),
                        SizedBox(height: 12),
                        GooglePlacesLoader(),
                        SizedBox(height: 12),
                        GooglePlacesLoader(),
                      ],
                    );
                  } else if (placesState is SearchLoaded) {
                    return Column(
                      children: [
                        // Show local AirQuality matches first
                        if (localSearchResults.isNotEmpty) ...[
                          Text("Air Quality Monitoring Locations",
                              style: TextStyle(fontWeight: FontWeight.bold)),
                          ListView.separated(
                              shrinkWrap: true,
                              itemCount: localSearchResults.length,
                              separatorBuilder: (context, index) =>
                                  Divider(indent: 50),
                              itemBuilder: (context, index) {
                                Measurement measurement =
                                    localSearchResults[index];
                                return GestureDetector(
                                  onTap: () =>
                                      viewDetails(measurement: measurement),
                                  child: LocationDisplayWidget(
                                    title:
                                        measurement.siteDetails!.locationName ??
                                            "",
                                    subTitle:
                                        measurement.siteDetails!.searchName ??
                                            measurement.siteDetails!.name ??
                                            "---",
                                  ),
                                );
                              }),
                          Divider(),
                        ],

                        Text("Other Locations",
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        ListView.separated(
                            shrinkWrap: true,
                            itemCount: placesState.response.predictions.length,
                            separatorBuilder: (context, index) =>
                                Divider(indent: 50),
                            itemBuilder: (context, index) {
                              Prediction prediction =
                                  placesState.response.predictions[index];
                              return GestureDetector(
                                onTap: () => viewDetails(
                                    placeName: prediction.description),
                                child: LocationDisplayWidget(
                                    title: prediction.description,
                                    subTitle: prediction
                                        .structuredFormatting.mainText),
                              );
                            }),
                      ],
                    );
                  }
                  return Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: double.infinity,
                          color: Theme.of(context).scaffoldBackgroundColor,
                          height: 55,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8, top: 4),
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  // Add consistent padding to the "All" button
                                  Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: GestureDetector(
                                      onTap: () => resetFilter(),
                                      child: Container(
                                        height: 48,
                                        width: 51,
                                        decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(40),
                                            color: currentFilter == "All"
                                                ? AppColors.primaryColor
                                                : AppColors.highlightColor),
                                        child: Center(
                                          child: Text(
                                            "All",
                                            style: TextStyle(
                                                color: currentFilter == "All"
                                                    ? Colors.white
                                                    : Colors.black),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  ListView.builder(
                                      shrinkWrap: true,
                                      physics:
                                          const NeverScrollableScrollPhysics(),
                                      scrollDirection: Axis.horizontal,
                                      itemCount: countries.length,
                                      itemBuilder: (context, index) {
                                        return Padding(
                                          padding:
                                              const EdgeInsets.only(right: 8),
                                          child: CountryButton(
                                            flag: countries[index].flag,
                                            name: countries[index].countryName,
                                            isSelected: currentFilter ==
                                                countries[index].countryName,
                                            onTap: () => filterByCountry(
                                                countries[index].countryName,
                                                allMeasurements),
                                            // You can add user country logic here if needed
                                            // isUserCountry: widget.userCountry?.toLowerCase() ==
                                            //     countries[index].countryName.toLowerCase(),
                                          ),
                                        );
                                      })
                                ],
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          "Suggestions",
                          style: TextStyle(
                              fontSize: 15,
                              color: Color(0xff7A7F87),
                              fontWeight: FontWeight.w500),
                        ),
                        SizedBox(height: 3),
                        Divider(),
                        Expanded(
                          child: Builder(
                            builder: (context) {
                              List<Measurement> measurements =
                                  currentFilter == "All"
                                      ? allMeasurements
                                      : filteredMeasurements;

                              if (measurements.isEmpty) {
                                return Center(
                                  child: Text("No measurements available"),
                                );
                              }

                              return ListView.separated(
                                separatorBuilder: (context, index) =>
                                    const Divider(indent: 50),
                                padding: EdgeInsets.zero,
                                shrinkWrap: true,
                                itemCount: measurements.length,
                                itemBuilder: (context, index) {
                                  Measurement measurement = measurements[index];
                                  return GestureDetector(
                                    onTap: () =>
                                        viewDetails(measurement: measurement),
                                    child: LocationDisplayWidget(
                                      title: measurement.siteDetails?.city ??
                                          "Unknown City",
                                      subTitle:
                                          measurement.siteDetails?.searchName ??
                                              measurement.siteDetails?.name ??
                                              "---",
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                        )
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}
