import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:app_repository/app_repository.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../blocs/map/map_bloc.dart';
import '../../models/air_quality_reading.dart';
import '../../models/enum_constants.dart';
import '../../services/hive_service.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../utils/pm.dart';
import '../../widgets/custom_shimmer.dart';
import '../analytics/analytics_widgets.dart';
import 'map_view_widgets.dart';

class MapViewV2 extends StatefulWidget {
  const MapViewV2({Key? key}) : super(key: key);

  @override
  State<MapViewV2> createState() => _MapViewV2State();
}

class _MapViewV2State extends State<MapViewV2> {
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
        const MapControl(),
      ],
    );
  }

  @override
  void initState() {
    super.initState();
    Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
        .listenable()
        .addListener(() {
      final airQualityReadings =
          Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
              .values
              .toList();
      if (airQualityReadings.isNotEmpty) {
        context.read<MapBloc>().add(const ShowAllSites());
      }
    });
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

class MapControl extends StatelessWidget {
  const MapControl({super.key});

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

class RegionTileV2 extends StatelessWidget {
  const RegionTileV2({
    super.key,
    required this.region,
  });
  final Region region;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () {
        context.read<MapBloc>().add(ShowRegionSites(region: region));
      },
      title: AutoSizeText(
        region.toString(),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
        'Uganda',
        style: CustomTextStyle.bodyText4(context)?.copyWith(
          color: CustomColors.appColorBlack.withOpacity(0.3),
        ),
      ),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
    );
  }
}

class AllSites extends StatelessWidget {
  const AllSites({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: ListView(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        children: const <Widget>[
          SizedBox(
            height: 5,
          ),
          RegionTileV2(
            region: Region.central,
          ),
          RegionTileV2(
            region: Region.western,
          ),
          RegionTileV2(
            region: Region.eastern,
          ),
          RegionTileV2(
            region: Region.northern,
          ),
        ],
      ),
    );
  }
}

class RegionSites extends StatelessWidget {
  const RegionSites({
    super.key,
    required this.airQualityReadings,
    required this.region,
  });

  final List<AirQualityReading> airQualityReadings;
  final Region region;

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: ListView(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        children: [
          const SizedBox(
            height: 10,
          ),
          Visibility(
            visible: airQualityReadings.isNotEmpty,
            child: Text(
              region.toString(),
              style: CustomTextStyle.overline1(context)?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.32),
              ),
            ),
          ),
          Visibility(
            visible: airQualityReadings.isNotEmpty,
            child: MediaQuery.removePadding(
              context: context,
              removeTop: true,
              child: ListView.builder(
                shrinkWrap: true,
                controller: ScrollController(),
                itemBuilder: (context, index) => SiteTile(
                  airQualityReading: airQualityReadings[index],
                ),
                itemCount: airQualityReadings.length,
              ),
            ),
          ),
          Visibility(
            visible: airQualityReadings.isEmpty,
            child: EmptyView(
              title: region.toString(),
              topBars: false,
              bodyInnerText: 'region',
              showRegions: () {
                context.read<MapBloc>().add(const ShowAllSites());
              },
            ),
          ),
        ],
      ),
    );
  }
}

class SingleSite extends StatelessWidget {
  const SingleSite({super.key, required this.airQualityReading});

  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      context: context,
      removeTop: true,
      removeLeft: true,
      removeRight: true,
      child: ListView(
        shrinkWrap: true,
        physics: const ScrollPhysics(),
        controller: ScrollController(),
        children: <Widget>[
          MapAnalyticsCard(
            airQualityReading: airQualityReading,
          ),
        ],
      ),
    );
  }
}

class SearchSites extends StatelessWidget {
  const SearchSites({super.key, required this.airQualityReadings});

  final List<AirQualityReading> airQualityReadings;

  @override
  Widget build(BuildContext context) {
    final filteredAirQualityReadings =
        filterNearestLocations(airQualityReadings);

    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: ListView(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        children: [
          Visibility(
            visible: airQualityReadings.isEmpty,
            child: Center(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 10,
                  ),
                  Stack(
                    children: [
                      Image.asset(
                        'assets/images/world-map.png',
                        height: 130,
                        width: 130,
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: CustomColors.appColorBlue,
                          shape: BoxShape.circle,
                        ),
                        child: const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: Icon(
                            Icons.map_outlined,
                            size: 30,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                  const Text(
                    'Not found',
                    textAlign: TextAlign.start,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                ],
              ),
            ),
          ),
          Visibility(
            visible: filteredAirQualityReadings.isNotEmpty,
            child: Center(
              child: MediaQuery.removePadding(
                context: context,
                removeTop: true,
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  shrinkWrap: true,
                  itemBuilder: (context, index) => SiteTile(
                    airQualityReading: filteredAirQualityReadings[index],
                  ),
                  itemCount: filteredAirQualityReadings.length,
                ),
              ),
            ),
          ),
          const SizedBox(
            height: 8,
          ),
        ],
      ),
    );
  }
}

class SearchResults extends StatelessWidget {
  const SearchResults({super.key, required this.searchResults});

  final List<SearchResultItem> searchResults;

  @override
  Widget build(BuildContext context) {
    return MediaQuery.removePadding(
      removeTop: true,
      context: context,
      child: ListView(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        children: [
          Visibility(
            visible: searchResults.isEmpty,
            child: Center(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 10,
                  ),
                  Stack(
                    children: [
                      Image.asset(
                        'assets/images/world-map.png',
                        height: 130,
                        width: 130,
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: CustomColors.appColorBlue,
                          shape: BoxShape.circle,
                        ),
                        child: const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: Icon(
                            Icons.map_outlined,
                            size: 30,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                  const Text(
                    'Not found',
                    textAlign: TextAlign.start,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(
                    height: 52,
                  ),
                ],
              ),
            ),
          ),
          Visibility(
            visible: searchResults.isNotEmpty,
            child: Center(
              child: MediaQuery.removePadding(
                context: context,
                removeTop: true,
                removeLeft: true,
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  shrinkWrap: true,
                  itemBuilder: (context, index) => SearchTile(
                    searchResult: searchResults[index],
                  ),
                  itemCount: searchResults.length,
                ),
              ),
            ),
          ),
          const SizedBox(
            height: 8,
          ),
        ],
      ),
    );
  }
}

class SearchLoadingWidget extends StatelessWidget {
  const SearchLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 20),
      child: Center(
        child: LoadingWidget(backgroundColor: Colors.transparent),
      ),
    );
  }
}

class SearchWidget extends StatelessWidget {
  SearchWidget({super.key});
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        if (state is SingleSiteState) {
          return const SizedBox();
        }

        return Row(
          children: [
            Expanded(
              child: Container(
                height: 32,
                constraints: const BoxConstraints(minWidth: double.maxFinite),
                decoration: BoxDecoration(
                  color: CustomColors.appBodyColor,
                  shape: BoxShape.rectangle,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(8.0),
                  ),
                ),
                child: TextFormField(
                  controller: _searchController,
                  onChanged: (String value) {
                    context
                        .read<MapBloc>()
                        .add(MapSearchTermChanged(searchTerm: value));
                  },
                  onTap: () {
                    context.read<MapBloc>().add(const MapSearchReset());
                  },
                  style: Theme.of(context).textTheme.caption?.copyWith(
                        fontSize: 16,
                      ),
                  enableSuggestions: true,
                  cursorWidth: 1,
                  autofocus: false,
                  cursorColor: CustomColors.appColorBlack,
                  decoration: InputDecoration(
                    fillColor: Colors.white,
                    prefixIcon: Padding(
                      padding: const EdgeInsets.only(
                        right: 0,
                        top: 7,
                        bottom: 7,
                        left: 0,
                      ),
                      child: SvgPicture.asset(
                        'assets/icon/search.svg',
                        semanticsLabel: 'Search',
                      ),
                    ),
                    contentPadding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                    focusedBorder: OutlineInputBorder(
                      borderSide: const BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderSide: const BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    border: OutlineInputBorder(
                      borderSide: const BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    hintStyle: Theme.of(context).textTheme.caption?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.32),
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                        ),
                  ),
                ),
              ),
            ),
            BlocBuilder<MapBloc, MapState>(
              builder: (context, state) {
                if (state is! AllSitesState) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(
                        width: 8.0,
                      ),
                      GestureDetector(
                        onTap: () {
                          _searchController.text = '';
                          context.read<MapBloc>().add(const ShowAllSites());
                        },
                        child: Container(
                          height: 32,
                          width: 32,
                          decoration: BoxDecoration(
                            color: CustomColors.appBodyColor,
                            borderRadius: const BorderRadius.all(
                              Radius.circular(8.0),
                            ),
                          ),
                          child: SvgPicture.asset(
                            'assets/icon/map_clear_text.svg',
                            height: 15,
                            width: 15,
                          ),
                        ),
                      ),
                    ],
                  );
                }

                return const SizedBox();
              },
            ),
          ],
        );
      },
    );
  }
}
