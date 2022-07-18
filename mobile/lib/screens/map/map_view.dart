import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../blocs/map/map_bloc.dart';
import '../../models/air_quality_reading.dart';
import '../../themes/app_theme.dart';
import '../../utils/pm.dart';
import 'map_view_widgets.dart';

class MapView extends StatefulWidget {
  const MapView({super.key});

  @override
  State<MapView> createState() => _MapViewState();
}

class _MapViewState extends State<MapView> {
  final double _bottomPadding = 0.15;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).size.height * _bottomPadding,
          ),
          child: const MapLandscape(),
        ),
        const MapDragSheet(),
      ],
    );
  }
}

class MapLandscape extends StatefulWidget {
  const MapLandscape({super.key});
  @override
  State<MapLandscape> createState() => _MapLandscapeState();
}

class _MapLandscapeState extends State<MapLandscape> {
  GoogleMapController? _mapController;
  Map<String, Marker> _markers = {};
  final _defaultCameraPosition =
      const CameraPosition(target: LatLng(1.6183002, 32.504365), zoom: 6.6);

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
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
    );
  }

  Future<void> _loadTheme() async {
    if (_mapController == null) {
      return;
    }

    await _mapController?.setMapStyle(
      jsonEncode(googleMapsTheme),
    );
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    _mapController = controller;
    await _loadTheme();
    await _setMarkers([]);
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

    final bounds = LatLngBounds(
      northeast: LatLng(rightMostMarker, topMostMarker),
      southwest: LatLng(leftMostMarker, bottomMostMarker),
    );

    return bounds;
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _listenToAirQualityReadingChanges();
    });
  }

  Future<void> _listenToAirQualityReadingChanges() async {
    context.read<MapBloc>().stream.listen((state) {
      if (state is AllSitesState) {
        _setMarkers(state.airQualityReadings);
      }

      if (state is RegionSitesState) {
        _setMarkers(state.airQualityReadings);
      }

      if (state is SingleSiteState) {
        _setMarkers([state.airQualityReading]);
      }

      if (state is SearchSitesState) {
        _setMarkers(state.airQualityReadings);
      }
    });
  }

  Future<void> _setMarkers(List<AirQualityReading> airQualityReadings) async {
    if (!mounted) {
      return;
    }

    if (_mapController == null) {
      return;
    }

    if (airQualityReadings.isEmpty) {
      final controller = _mapController;

      await controller?.animateCamera(
        CameraUpdate.newCameraPosition(_defaultCameraPosition),
      );

      setState(() => _markers = {});

      return;
    }
    final markers = <String, Marker>{};

    for (final airQualityReading in airQualityReadings) {
      final bitmapDescriptor = airQualityReadings.length == 1
          ? await pmToMarker(
              airQualityReading.pm2_5,
            )
          : await pmToSmallMarker(
              airQualityReading.pm2_5,
            );

      final marker = Marker(
        markerId: MarkerId(airQualityReading.referenceSite),
        icon: bitmapDescriptor,
        position: LatLng(
          (airQualityReading.latitude),
          airQualityReading.longitude,
        ),
        onTap: () {
          if (!mounted) return;

          context
              .read<MapBloc>()
              .add(ShowSite(airQualityReading: airQualityReading));
        },
      );
      markers[airQualityReading.placeId] = marker;
    }

    if (mounted) {
      final controller = _mapController;

      if (airQualityReadings.length == 1) {
        final latLng = LatLng(
          airQualityReadings.first.latitude,
          airQualityReadings.first.longitude,
        );

        final cameraPosition = CameraPosition(
          target: latLng,
          zoom: 100,
        );

        await controller?.animateCamera(
          CameraUpdate.newCameraPosition(cameraPosition),
        );
      } else {
        await controller?.animateCamera(
          CameraUpdate.newLatLngBounds(
            _getBounds(
              markers.values.toList(),
            ),
            40.0,
          ),
        );
      }

      setState(() => _markers = markers);
    }
  }
}

class MapDragSheet extends StatelessWidget {
  const MapDragSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.30,
      minChildSize: 0.18,
      maxChildSize: 0.92,
      builder: (
        BuildContext context,
        ScrollController scrollController,
      ) {
        return MapCardWidget(
          widget: SingleChildScrollView(
            controller: scrollController,
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: <Widget>[
                const SizedBox(height: 8),
                const DraggingHandle(),
                const SizedBox(height: 16),
                SearchWidget(),
                BlocBuilder<MapBloc, MapState>(
                  builder: (context, state) {
                    if (state is MapLoadingState) {
                      return const SearchLoadingWidget();
                    }

                    if (state is MapSearchCompleteState) {
                      return SearchResults(
                        searchResults: state.searchResults,
                      );
                    }

                    if (state is AllSitesState) {
                      return const AllSites();
                    }

                    if (state is RegionSitesState) {
                      return RegionSites(
                        airQualityReadings: state.airQualityReadings,
                        region: state.region,
                      );
                    }

                    if (state is SingleSiteState) {
                      return SingleSite(
                        airQualityReading: state.airQualityReading,
                      );
                    }

                    if (state is SearchSitesState) {
                      return SearchSites(
                        airQualityReadings: state.airQualityReadings,
                      );
                    }

                    return const AllSites();
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
