import 'dart:convert';
import 'dart:math';

import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/analytics/analytics_card.dart';
import 'package:app/themes/app_theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../models/enum_constants.dart';
import '../../services/app_service.dart';
import '../../services/native_api.dart';
import 'map_widgets.dart';

class MapView extends StatefulWidget {
  const MapView({Key? key}) : super(key: key);

  @override
  _MapViewState createState() => _MapViewState();
}

class _MapViewState extends State<MapView> {
  bool _showLocationDetails = false;
  double _scrollSheetHeight = 0.30;
  bool _isSearching = false;
  bool _displayRegions = true;
  List<Measurement> _regionSites = <Measurement>[];
  List<Measurement> _searchSites = <Measurement>[];
  List<Measurement> _latestMeasurements = <Measurement>[];
  List<Suggestion> _searchSuggestions = <Suggestion>[];
  Region _selectedRegion = Region.central;
  final TextEditingController _searchController = TextEditingController();
  PlaceDetails? _locationPlaceMeasurement;
  Measurement? _locationMeasurement;
  final _defaultCameraPosition =
      const CameraPosition(target: LatLng(1.6183002, 32.504365), zoom: 6.6);
  late GoogleMapController _mapController;
  Map<String, Marker> _markers = {};
  final AppService _appService = AppService();
  double _bottomPadding = 0.15;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: <Widget>[
          Padding(
            padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).size.height * _bottomPadding),
            child: mapWidget(),
          ),
          Visibility(
            visible: _showLocationDetails,
            child: DraggableScrollableSheet(
              initialChildSize: 0.5,
              minChildSize: 0.4,
              maxChildSize: 0.6,
              builder:
                  (BuildContext context, ScrollController scrollController) {
                return MapCardWidget(
                    widget: SingleChildScrollView(
                        physics: const ScrollPhysics(),
                        padding: EdgeInsets.zero,
                        controller: scrollController,
                        child: locationContent()),
                    padding: 16.0);
              },
            ),
          ),
          Visibility(
            visible: !_showLocationDetails,
            child: DraggableScrollableSheet(
              initialChildSize: _scrollSheetHeight,
              minChildSize: 0.18,
              maxChildSize: 0.92,
              builder:
                  (BuildContext context, ScrollController scrollController) {
                return MapCardWidget(
                    widget: SingleChildScrollView(
                      controller: scrollController,
                      physics: const BouncingScrollPhysics(),
                      child: Column(
                        children: <Widget>[
                          const SizedBox(height: 8),
                          const DraggingHandle(),
                          const SizedBox(height: 16),
                          searchContainer(),
                          Visibility(
                            visible: _displayRegions && !_isSearching,
                            child: regionsList(),
                          ),
                          Visibility(
                            visible: !_displayRegions && !_isSearching,
                            child: sitesList(),
                          ),
                          Visibility(
                            visible: _isSearching,
                            child: searchResultsList(),
                          ),
                        ],
                      ),
                    ),
                    padding: 32);
              },
            ),
          ),
        ],
      ),
    );
  }

  LatLngBounds _getBounds(List<Marker> markers) {
    var latitudes =
        markers.map<double>((marker) => marker.position.latitude).toList();
    var longitudes =
        markers.map<double>((marker) => marker.position.longitude).toList();

    var topMostMarker = longitudes.reduce(max);
    var rightMostMarker = latitudes.reduce(max);
    var leftMostMarker = latitudes.reduce(min);
    var bottomMostMarker = longitudes.reduce(min);

    var bounds = LatLngBounds(
      northeast: LatLng(rightMostMarker, topMostMarker),
      southwest: LatLng(leftMostMarker, bottomMostMarker),
    );

    return bounds;
  }

  Widget getLocationDisplay() {
    if (_locationMeasurement != null && _locationPlaceMeasurement != null) {
      return MapAnalyticsCard(
          _locationPlaceMeasurement!, _locationMeasurement!, _showLocation);
    }

    return EmptyView(
        title: '',
        topBars: true,
        bodyInnerText: 'area',
        showRegions: _showRegions);
  }

  Widget locationContent() {
    return Column(
      children: [
        const SizedBox(height: 8),
        const Padding(
          padding: EdgeInsets.only(left: 10, right: 10),
          child: DraggingHandle(),
        ),
        const SizedBox(height: 16),
        MediaQuery.removePadding(
            context: context,
            removeTop: true,
            removeLeft: true,
            removeRight: true,
            child: ListView(
              shrinkWrap: true,
              physics: const ScrollPhysics(),
              controller: ScrollController(),
              children: <Widget>[
                getLocationDisplay(),
              ],
            )),
      ],
    );
  }

  Widget mapWidget() {
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
      onTap: (_) {
        // showRegions();
        // setState(() {
        //   _showInfoWindow = false;
        //   _isSearching = false;
        // });
      },
    );
  }

  Widget regionsList() {
    return MediaQuery.removePadding(
        removeTop: true,
        context: context,
        child: ListView(
          shrinkWrap: true,
          physics: const BouncingScrollPhysics(),
          children: <Widget>[
            const SizedBox(
              height: 5,
            ),
            RegionTile(
                region: Region.central, showRegionSites: _showRegionSites),
            RegionTile(
                region: Region.western, showRegionSites: _showRegionSites),
            RegionTile(
                region: Region.eastern, showRegionSites: _showRegionSites),
            RegionTile(
                region: Region.northern, showRegionSites: _showRegionSites),
          ],
        ));
  }

  void _searchChanged(String text) {
    if (text.isEmpty) {
      setState(() => _isSearching = false);
    } else {
      setState(() {
        _isSearching = true;
        _searchSites =
            LocationService.textSearchNearestSites(text, _latestMeasurements);
      });

      _appService.searchApi
          .fetchSuggestions(text)
          .then((value) => {setState(() => _searchSuggestions = value)});

      setState(() => _searchSites =
          LocationService.textSearchNearestSites(text, _latestMeasurements));
    }
  }

  Widget searchContainer() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 32,
            constraints: const BoxConstraints(minWidth: double.maxFinite),
            decoration: BoxDecoration(
                color: Config.appBodyColor,
                shape: BoxShape.rectangle,
                borderRadius: const BorderRadius.all(Radius.circular(8.0))),
            child: TextFormField(
              controller: _searchController,
              onChanged: _searchChanged,
              onTap: () {
                setState(() => _scrollSheetHeight = 0.7);
              },
              style: Theme.of(context).textTheme.caption?.copyWith(
                    fontSize: 16,
                  ),
              enableSuggestions: true,
              cursorWidth: 1,
              autofocus: false,
              cursorColor: Config.appColorBlack,
              decoration: InputDecoration(
                fillColor: Colors.white,
                prefixIcon: Padding(
                  padding: const EdgeInsets.only(
                      right: 0, top: 7, bottom: 7, left: 0),
                  child: SvgPicture.asset(
                    'assets/icon/search.svg',
                    semanticsLabel: 'Search',
                  ),
                ),
                contentPadding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                focusedBorder: OutlineInputBorder(
                  borderSide:
                      const BorderSide(color: Colors.transparent, width: 1.0),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide:
                      const BorderSide(color: Colors.transparent, width: 1.0),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                border: OutlineInputBorder(
                    borderSide:
                        const BorderSide(color: Colors.transparent, width: 1.0),
                    borderRadius: BorderRadius.circular(8.0)),
                hintStyle: Theme.of(context).textTheme.caption?.copyWith(
                      color: Config.appColorBlack.withOpacity(0.32),
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
              ),
            ),
          ),
        ),
        Visibility(
            visible: !_displayRegions,
            child: const SizedBox(
              width: 8.0,
            )),
        Visibility(
            visible: !_displayRegions,
            child: GestureDetector(
              onTap: _showRegions,
              child: Container(
                height: 32,
                width: 32,
                decoration: BoxDecoration(
                    color: Config.appBodyColor,
                    borderRadius: const BorderRadius.all(Radius.circular(8.0))),
                child: SvgPicture.asset(
                  'assets/icon/map_clear_text.svg',
                  height: 15,
                  width: 15,
                ),
              ),
            )),
      ],
    );
  }

  Widget searchField() {
    return Expanded(
        child: Center(
      child: TextFormField(
        controller: _searchController,
        onTap: () {
          setState(() => _scrollSheetHeight = 0.7);
        },
        onChanged: _searchChanged,
        cursorWidth: 1,
        maxLines: 1,
        cursorColor: Config.appColorBlue,
        autofocus: false,
        decoration: const InputDecoration(
          contentPadding: EdgeInsets.only(right: 8, left: 8, bottom: 15),
          hintText: '',
          focusedBorder: InputBorder.none,
          enabledBorder: InputBorder.none,
        ),
      ),
    ));
  }

  Widget searchResultsList() {
    return MediaQuery.removePadding(
        removeTop: true,
        context: context,
        child: ListView(
          shrinkWrap: true,
          physics: const BouncingScrollPhysics(),
          children: [
            Visibility(
                visible: _searchSites.isEmpty && _searchSuggestions.isEmpty,
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
                              color: Config.appColorBlue,
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
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(
                        height: 52,
                      ),
                    ],
                  ),
                )),
            Visibility(
                visible: _searchSites.isNotEmpty && _searchSuggestions.isEmpty,
                child: Center(
                  child: MediaQuery.removePadding(
                      context: context,
                      removeTop: true,
                      child: ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        shrinkWrap: true,
                        itemBuilder: (context, index) => SiteTile(
                            measurement: _searchSites[index],
                            onSiteTileTap: _onSiteTileTap),
                        itemCount: _searchSites.length,
                      )),
                )),
            Visibility(
                visible: _searchSuggestions.isNotEmpty,
                child: Center(
                  child: MediaQuery.removePadding(
                      context: context,
                      removeTop: true,
                      removeLeft: true,
                      child: ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        shrinkWrap: true,
                        itemBuilder: (context, index) => SearchTile(
                            suggestion: _searchSuggestions[index],
                            onSearchTileTap: _onSearchTileTap),
                        itemCount: _searchSuggestions.length,
                      )),
                )),
            const SizedBox(
              height: 8,
            ),
          ],
        ));
  }

  Future<void> _setMarkers(
      List<Measurement> measurements, bool useSingleZoom, double zoom) async {
    if (!mounted) {
      return;
    }

    if (measurements.isEmpty) {
      final controller = _mapController;

      await controller.animateCamera(
          CameraUpdate.newCameraPosition(_defaultCameraPosition));

      setState(() {
        _markers.clear();
        _markers = {};
      });

      return;
    }
    var markers = <String, Marker>{};

    for (var measurement in measurements) {
      BitmapDescriptor bitmapDescriptor;

      if (useSingleZoom) {
        bitmapDescriptor = await pmToMarker(measurement.getPm2_5Value());
      } else {
        bitmapDescriptor = await pmToSmallMarker(measurement.getPm2_5Value());
      }

      var marker = Marker(
        markerId: MarkerId(measurement.site.id),
        icon: bitmapDescriptor,
        position:
            LatLng((measurement.site.latitude), measurement.site.longitude),
        // infoWindow: InfoWindow(
        //   title: measurement.getPm2_5Value().toStringAsFixed(2),
        //   snippet: node.location,
        // ),
        onTap: () {
          if (!mounted) {
            return;
          }
          setState(() => _searchController.text = measurement.site.name);
          _showLocationContent(measurement, null);
        },
      );
      markers[measurement.site.id] = marker;
    }

    if (mounted) {
      final controller = _mapController;

      if (useSingleZoom) {
        if (markers.length == 1) {}

        var latLng = LatLng(measurements.first.site.latitude,
            measurements.first.site.longitude);

        var _cameraPosition = CameraPosition(target: latLng, zoom: zoom);

        await controller
            .animateCamera(CameraUpdate.newCameraPosition(_cameraPosition));
      } else {
        if (_displayRegions) {
          await controller.animateCamera(
              CameraUpdate.newCameraPosition(_defaultCameraPosition));
        } else {
          await controller.animateCamera(CameraUpdate.newLatLngBounds(
              _getBounds(markers.values.toList()), 40.0));
        }
      }

      setState(() => _markers = markers);
    }
  }

  void _showLocation() {
    if (!mounted) {
      return;
    }
    setState(() => _showLocationDetails = !_showLocationDetails);

    if (!_showLocationDetails) {
      _showRegions();
    }

    if (_showLocationDetails) {
      setState(() => _bottomPadding = 0.5);
    }
  }

  void _showLocationContent(
      Measurement? measurement, PlaceDetails? placeDetails) {
    if (!mounted) {
      return;
    }

    if (placeDetails != null) {
      var places = _latestMeasurements
          .where((measurement) => measurement.site.id == placeDetails.siteId)
          .toList();
      if (places.isEmpty) {
        return;
      }

      var place = places.first;

      _setMarkers([place], true, 14);
      setState(() {
        _locationPlaceMeasurement = placeDetails;
        _locationMeasurement = place;
        _showLocationDetails = true;
      });
    } else if (measurement != null) {
      _setMarkers([measurement], true, 14);
      setState(() {
        _locationPlaceMeasurement =
            PlaceDetails.measurementToPLace(measurement);
        _locationMeasurement = measurement;
        _showLocationDetails = true;
      });
    } else {
      setState(() {
        _locationMeasurement = null;
        _locationPlaceMeasurement = null;
        _showLocationDetails = true;
      });
    }
  }

  void _showRegions() {
    if (!mounted) {
      return;
    }

    setState(() {
      _searchController.text = '';
      _isSearching = false;
      _searchSites = [];
      _regionSites = [];
      _showLocationDetails = false;
      _displayRegions = true;
    });
    if (_latestMeasurements.isEmpty) {
      _getLatestMeasurements()
          .then((value) => {_setMarkers(_latestMeasurements, false, 6.6)});
    } else {
      _setMarkers(_latestMeasurements, false, 6.6);
    }
  }

  Future<void> _showRegionSites(Region region) async {
    if (!mounted) {
      return;
    }

    setState(() => _selectedRegion = region);
    var sites = await _appService.dbHelper.getRegionSites(region);
    setState(() {
      _showLocationDetails = false;
      _displayRegions = false;
      _regionSites = sites;
    });
    await _setMarkers(sites, false, 10);
  }

  Future<void> _onSearchTileTap(Suggestion suggestion) async {
    if (!mounted) {
      return;
    }

    setState(
        () => _searchController.text = suggestion.suggestionDetails.mainText);
    var place = await _appService.searchApi.getPlaceDetails(suggestion.placeId);
    if (place != null) {
      var nearestSite = await LocationService.getNearestSite(
          place.geometry.location.lat, place.geometry.location.lng);

      if (nearestSite == null) {
        _showLocationContent(null, null);
        return;
      }

      var placeDetails = PlaceDetails(
          name: suggestion.suggestionDetails.getMainText(),
          location: suggestion.suggestionDetails.getSecondaryText(),
          siteId: nearestSite.id,
          placeId: suggestion.placeId,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng);

      _showLocationContent(null, placeDetails);
    } else {
      await showSnackBar(context, 'Try again later');
    }
  }

  Widget sitesList() {
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
              visible: _regionSites.isNotEmpty,
              child: Text(
                _selectedRegion.getName(),
                style: CustomTextStyle.overline1(context)
                    ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
              ),
            ),
            Visibility(
                visible: _regionSites.isNotEmpty,
                child: MediaQuery.removePadding(
                    context: context,
                    removeTop: true,
                    child: ListView.builder(
                      shrinkWrap: true,
                      controller: ScrollController(),
                      itemBuilder: (context, index) => SiteTile(
                          measurement: _regionSites[index],
                          onSiteTileTap: _onSiteTileTap),
                      itemCount: _regionSites.length,
                    ))),
            Visibility(
                visible: _regionSites.isEmpty,
                child: EmptyView(
                    title: _selectedRegion.getName(),
                    topBars: false,
                    bodyInnerText: 'region',
                    showRegions: _showRegions))
          ],
        ));
  }

  void _onSiteTileTap(Measurement measurement) {
    if (!mounted) {
      return;
    }
    setState(() => _searchController.text = measurement.site.name);
    _showLocationContent(measurement, null);
  }

  Future<void> _getLatestMeasurements() async {
    var dbMeasurements = await _appService.dbHelper.getLatestMeasurements();

    if (dbMeasurements.isNotEmpty && mounted) {
      setState(() => _latestMeasurements = dbMeasurements);
      await _setMarkers(dbMeasurements, false, 6.6);
    }

    var measurements = await _appService.apiClient.fetchLatestMeasurements();

    if (measurements.isNotEmpty && mounted) {
      setState(() => _latestMeasurements = measurements);
      await _setMarkers(measurements, false, 6.6);
    }

    await _appService.dbHelper.insertLatestMeasurements(measurements);
  }

  Future<void> _loadTheme() async {
    await _mapController.setMapStyle(jsonEncode(googleMapsTheme));
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    if (!mounted) {
      return;
    }

    setState(() {
      _mapController = controller;
    });

    await _loadTheme();
    await _getLatestMeasurements();
  }
}
