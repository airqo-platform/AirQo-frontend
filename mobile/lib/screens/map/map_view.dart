import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import 'map_view_widgets.dart';

class MapView extends StatelessWidget {
  const MapView({super.key});

  void _reloadMap(BuildContext context) {
    context.read<MapBloc>().add(const InitializeMapState());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        switch (state.mapStatus) {
          case MapStatus.error:
            if (state.blocError == AuthenticationError.noInternetConnection) {
              return NoInternetConnectionWidget(callBack: () {
                _reloadMap(context);
              });
            }
            return AppErrorWidget(callBack: () {
              _reloadMap(context);
            });
          case MapStatus.initial:
          case MapStatus.noAirQuality:
            return NoAirQualityDataWidget(callBack: () {
              _reloadMap(context);
            });
          case MapStatus.loading:
            return Stack(
              alignment: Alignment.center,
              children: [
                const MapLandscape(),
                Align(
                  alignment: Alignment.center,
                  child: CupertinoActivityIndicator(
                    radius: 40,
                    color: CustomColors.appColorBlue,
                  ),
                ),
              ],
            );
          case MapStatus.showingCountries:
          case MapStatus.showingRegions:
          case MapStatus.showingFeaturedSite:
          case MapStatus.showingRegionSites:
          case MapStatus.searching:
            return Stack(
              children: [
                Padding(
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).size.height * 0.15,
                  ),
                  child: const MapLandscape(),
                ),
                const MapDragSheet(),
              ],
            );
        }
      },
    );
  }
}

class MapLandscape extends StatefulWidget {
  const MapLandscape({super.key});
  @override
  State<MapLandscape> createState() => _MapLandscapeState();
}

class _MapLandscapeState extends State<MapLandscape> {
  late GoogleMapController _mapController;
  Map<String, Marker> _markers = {};
  final double zoom = 6;
  final _defaultCameraPosition =
      const CameraPosition(target: LatLng(1.6183002, 32.504365), zoom: 6);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: MediaQuery.of(context).size.width,
      height: MediaQuery.of(context).size.height,
      child: GoogleMap(
        compassEnabled: false,
        onMapCreated: _onMapCreated,
        mapType: MapType.normal,
        myLocationButtonEnabled: false,
        myLocationEnabled: false,
        rotateGesturesEnabled: false,
        tiltGesturesEnabled: false,
        mapToolbarEnabled: false,
        zoomControlsEnabled: true,
        initialCameraPosition: _defaultCameraPosition,
        markers: _markers.values.toSet(),
      ),
    );
  }

  Future<void> _loadTheme() async {
    await _mapController.setMapStyle(
      jsonEncode(googleMapsTheme),
    );
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    _mapController = controller;
    await _loadTheme();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = BlocProvider.of<MapBloc>(context).state;
      _loadMapState(state);
      _listenToMarkerChanges();
    });
  }

  void _listenToMarkerChanges() {
    context.read<MapBloc>().stream.listen(_loadMapState);
  }

  Future<void> _loadMapState(MapState mapState) async {
    switch (mapState.mapStatus) {
      case MapStatus.initial:
      case MapStatus.error:
      case MapStatus.noAirQuality:
      case MapStatus.searching:
        // Already captured by parent widget
        break;
      case MapStatus.loading:
        await _setMarkers([]);
        break;
      case MapStatus.showingFeaturedSite:
        final AirQualityReading? airQualityReading =
            mapState.featuredSiteReading;
        if (airQualityReading == null) {
          context.read<MapBloc>().add(const InitializeMapState());
          break;
        }
        await _setMarkers([airQualityReading]);
        break;
      case MapStatus.showingCountries:
      case MapStatus.showingRegions:
      case MapStatus.showingRegionSites:
        await _setMarkers(mapState.featuredAirQualityReadings);
        break;
    }
  }

  Future<void> _setMarkers(List<AirQualityReading> airQualityReadings) async {
    if (!mounted) {
      return;
    }

    final controller = _mapController;

    if (airQualityReadings.isEmpty) {
      await controller.animateCamera(
        CameraUpdate.newCameraPosition(_defaultCameraPosition),
      );

      setState(() => _markers = {});

      return;
    }
    final markers = <String, Marker>{};

    for (final airQualityReading in airQualityReadings) {
      final BitmapDescriptor bitmapDescriptor = await pmToMarker(
        pm2_5: airQualityReading.pm2_5,
        itemsSize: airQualityReadings.length,
      );

      final marker = Marker(
        markerId: MarkerId(airQualityReading.referenceSite),
        icon: bitmapDescriptor,
        position: LatLng(
          airQualityReading.latitude,
          airQualityReading.longitude,
        ),
        onTap: () {
          if (!mounted) return;
          context.read<MapBloc>().add(ShowSiteReading(airQualityReading));
        },
      );
      markers[airQualityReading.placeId] = marker;
    }

    if (mounted) {
      if (airQualityReadings.length == 1) {
        final latLng = LatLng(
          airQualityReadings.first.latitude,
          airQualityReadings.first.longitude,
        );

        final cameraPosition = CameraPosition(
          target: latLng,
          zoom: 10,
        );

        await controller.animateCamera(
          CameraUpdate.newCameraPosition(cameraPosition),
        );
      } else {
        final latLngBounds = _getBounds(
          markers.values.toList(),
        );

        await controller.animateCamera(
          CameraUpdate.newLatLngBounds(latLngBounds, 100),
        );
      }

      setState(() => _markers = markers);
    }
  }

  LatLngBounds _getBounds(List<Marker> markers) {
    final latitudes =
        markers.map<double>((marker) => marker.position.latitude).toList();
    final longitudes =
        markers.map<double>((marker) => marker.position.longitude).toList();

    final topMostMarker = longitudes.reduce(max);
    final rightMostMarker = latitudes.reduce(max);
    final leftMostMarker = latitudes.reduce(min);
    final bottomMostMarker = longitudes.reduce(min);

    return LatLngBounds(
      northeast: LatLng(rightMostMarker, topMostMarker),
      southwest: LatLng(leftMostMarker, bottomMostMarker),
    );
  }
}

class MapDragSheet extends StatefulWidget {
  const MapDragSheet({super.key});

  @override
  State<MapDragSheet> createState() => _MapDragSheetState();
}

class _MapDragSheetState extends State<MapDragSheet> {
  final DraggableScrollableController controller =
      DraggableScrollableController();
  final analyticsCardSize = 0.4;
  final maximumCardSize = 0.92;

  void resizeScrollSheet() {
    controller.animateTo(
      analyticsCardSize,
      duration: const Duration(milliseconds: 1),
      curve: Curves.easeOutBack,
    );

    DraggableScrollableActuator.reset(context);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      controller: controller,
      initialChildSize: 0.3,
      minChildSize: 0.18,
      maxChildSize: maximumCardSize,
      builder: (BuildContext context, ScrollController scrollController) {
        return MapCardWidget(
          widget: SingleChildScrollView(
            controller: scrollController,
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: <Widget>[
                const SizedBox(height: 8),
                const DraggingHandle(),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: SearchWidget(),
                ),
                BlocBuilder<MapBloc, MapState>(
                  builder: (context, state) {
                    switch (state.mapStatus) {
                      case MapStatus.initial:
                      case MapStatus.error:
                      case MapStatus.noAirQuality:
                        // Already captured by parent widget
                        break;
                      case MapStatus.loading:
                        return Container();
                      case MapStatus.showingCountries:
                        return const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 32),
                          child: AllCountries(),
                        );
                      case MapStatus.showingRegions:
                        return const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 32),
                          child: CountryRegions(),
                        );
                      case MapStatus.showingFeaturedSite:
                        final AirQualityReading? airQualityReading =
                            state.featuredSiteReading;
                        if (airQualityReading == null) {
                          return NoAirQualityDataWidget(
                            callBack: () {
                              final String region =
                                  context.read<MapBloc>().state.featuredRegion;
                              context
                                  .read<MapBloc>()
                                  .add(ShowRegionSites(region));
                            },
                            actionButtonText: 'Back to regions',
                          );
                        }
                        resizeScrollSheet();
                        return FeaturedSiteReading(airQualityReading);
                      case MapStatus.showingRegionSites:
                        return const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 32),
                          child: RegionSites(),
                        );
                      case MapStatus.searching:
                        return const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 32),
                          child: MapSearchWidget(),
                        );
                    }

                    return const AllCountries();
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
