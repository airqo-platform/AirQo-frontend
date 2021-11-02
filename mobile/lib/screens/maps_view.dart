import 'dart:convert';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/themes/dark_theme.dart';
import 'package:app/themes/light_theme.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/analytics_card.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MapView extends StatefulWidget {
  MapView({Key? key}) : super(key: key);

  @override
  _MapViewState createState() => _MapViewState();
}

class _MapViewState extends State<MapView> {
  bool showLocationDetails = false;
  double scrollSheetHeight = 0.20;
  bool isSearching = false;
  bool displayRegions = true;
  List<Measurement> regionSites = [];
  List<Measurement> searchSites = [];
  List<Measurement> allSites = [];
  String selectedRegion = '';
  final TextEditingController _searchController = TextEditingController();
  late Measurement locationMeasurement;
  var defaultCameraPosition =
      const CameraPosition(target: LatLng(1.6183002, 32.504365), zoom: 6.6);
  late GoogleMapController _mapController;
  Map<String, Marker> _markers = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: <Widget>[
          mapWidget(),
          DraggableScrollableSheet(
            initialChildSize: scrollSheetHeight,
            minChildSize: 0.18,
            builder: (BuildContext context, ScrollController scrollController) {
              return SingleChildScrollView(
                controller: scrollController,
                child: scrollViewContent(),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget closeDetails() {
    return Container(
      height: 30,
      width: 30,
      decoration: BoxDecoration(
          color: ColorConstants.appBodyColor,
          borderRadius: BorderRadius.circular(8)),
      child: const Icon(
        Icons.clear,
        size: 20,
      ),
    );
  }

  Widget defaultContent() {
    return Column(
      children: <Widget>[
        const SizedBox(height: 8),
        draggingHandle(),
        const SizedBox(height: 16),
        searchContainer(),
        Visibility(
          visible: displayRegions && !isSearching,
          child: regionsList(),
        ),
        Visibility(
          visible: !displayRegions && !isSearching,
          child: sitesList(),
        ),
        Visibility(
          visible: isSearching,
          child: searchResultsList(),
        ),
      ],
    );
  }

  Widget draggingHandle() {
    return Container(
      height: 4,
      width: 32,
      decoration: BoxDecoration(
          color: Colors.grey[200], borderRadius: BorderRadius.circular(16)),
    );
  }

  Future<void> getSites() async {
    await DBHelper().getLatestMeasurements().then((value) => {
          if (mounted)
            {
              setState(() {
                allSites = value;
              })
            }
        });

    var measurements = await AirqoApiClient(context).fetchLatestMeasurements();

    if (measurements.isNotEmpty) {
      setState(() {
        allSites = measurements;
      });
      await DBHelper().insertLatestMeasurements(measurements);
    }
  }

  @override
  void initState() {
    getSites();
    super.initState();
  }

  Widget locationContent() {
    return Column(
      children: <Widget>[
        const SizedBox(height: 8),
        draggingHandle(),
        const SizedBox(height: 24),
        MapAnalyticsCard(locationMeasurement, showLocation),
        const SizedBox(height: 16),
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
      initialCameraPosition: defaultCameraPosition,
      markers: _markers.values.toSet(),
      onTap: (_) {
        // setState(() {
        //   _showInfoWindow = false;
        //   _isSearching = false;
        // });
      },
    );
  }

  Widget regionAvatar() {
    return Container(
        height: 40,
        width: 40,
        decoration: BoxDecoration(
            color: ColorConstants.appColorBlue.withOpacity(0.15),
            shape: BoxShape.circle),
        child: Center(
          child: SvgPicture.asset('assets/icon/location.svg',
              color: ColorConstants.appColorBlue),
        ));
  }

  Widget regionsList() {
    return ListView(
      shrinkWrap: true,
      children: <Widget>[
        regionTile('Central Region'),
        regionTile('Western Region'),
        regionTile('Eastern Region'),
        regionTile('Northern Region'),
      ],
    );
  }

  ListTile regionTile(String name) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: regionAvatar(),
      onTap: () {
        showRegionSites(name);
      },
      title: Text(
        name,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
      subtitle: Text(
        'Uganda',
        style: TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.3)),
      ),
      trailing: Icon(
        Icons.arrow_forward_ios_sharp,
        size: 10,
        color: ColorConstants.appColorBlue,
      ),
    );
  }

  Widget scrollViewContent() {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 12.0,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16), topRight: Radius.circular(16))),
      child: Container(
        padding: const EdgeInsets.fromLTRB(32.0, 0, 32.0, 16.0),
        child: showLocationDetails ? locationContent() : defaultContent(),
      ),
    );
  }

  Widget searchContainer() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 32,
            decoration: BoxDecoration(
                color: ColorConstants.appBodyColor,
                borderRadius: BorderRadius.circular(8)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.fromLTRB(10.0, 0, 0, 0),
                  child: SvgPicture.asset(
                    'assets/icon/search.svg',
                    height: 17,
                    width: 17,
                    semanticsLabel: 'Search',
                  ),
                ),
                searchField(),
              ],
            ),
          ),
        ),
        if (isSearching)
          const SizedBox(
            width: 8.0,
          ),
        if (isSearching)
          Container(
              height: 32,
              width: 32,
              decoration: BoxDecoration(
                  color: ColorConstants.appBodyColor,
                  borderRadius: const BorderRadius.all(Radius.circular(8.0))),
              child: Center(
                child: IconButton(
                  iconSize: 10,
                  icon: Icon(
                    Icons.clear,
                    color: ColorConstants.appBarTitleColor,
                  ),
                  onPressed: showRegions,
                ),
              ))
      ],
    );
  }

  Widget searchField() {
    return Expanded(
        child: Center(
      child: TextFormField(
        controller: _searchController,
        onTap: () {
          setState(() {
            scrollSheetHeight = 0.7;
          });
        },
        onChanged: (text) {
          if (text.isEmpty) {
            setState(() {
              isSearching = false;
            });
          } else {
            setState(() {
              isSearching = true;
              searchSites =
                  LocationService().textSearchNearestSites(text, allSites);
            });
          }
        },
        cursorWidth: 1,
        maxLines: 1,
        cursorColor: ColorConstants.appColorBlue,
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
    return ListView.builder(
      shrinkWrap: true,
      controller: ScrollController(),
      itemBuilder: (context, index) => GestureDetector(
        onTap: () {
          showLocationContent(searchSites[index]);
        },
        child: siteTile(searchSites[index]),
      ),
      itemCount: searchSites.length,
    );
  }

  Future<void> setMarker(Measurement measurement) async {
    var markers = <String, Marker>{};
    var bitmapDescriptor = await pmToMarker(measurement.getPm2_5Value());

    final marker = Marker(
      markerId: MarkerId(measurement.site.id),
      icon: bitmapDescriptor,
      position: LatLng((measurement.site.latitude), measurement.site.longitude),
      infoWindow: InfoWindow(
        title: measurement.getPm2_5Value().toStringAsFixed(2),
        // snippet: node.location,
      ),
      onTap: () {
        // updateInfoWindow(measurement);
      },
    );
    markers[measurement.site.id] = marker;

    if (mounted) {
      var latLng =
          LatLng(measurement.site.latitude, measurement.site.longitude);

      var _cameraPosition = CameraPosition(target: latLng, zoom: 14);

      final controller = _mapController;

      await controller
          .animateCamera(CameraUpdate.newCameraPosition(_cameraPosition));

      setState(() {
        _markers.clear();
        _markers = markers;
      });
    }
  }

  void showLocation() {
    setState(() {
      showLocationDetails = !showLocationDetails;
    });
  }

  void showLocationContent(Measurement measurement) {
    setMarker(measurement);
    setState(() {
      locationMeasurement = measurement;
      showLocationDetails = true;
    });
  }

  void showRegions() {
    setState(() {
      _searchController.text = '';
      isSearching = false;
      searchSites = [];
      regionSites = [];
      showLocationDetails = false;
      displayRegions = true;
    });
  }

  void showRegionSites(String region) {
    setState(() {
      selectedRegion = region;
    });
    DBHelper().getRegionSites(region).then((value) => {
          setState(() {
            showLocationDetails = false;
            displayRegions = false;
            regionSites = value;
          })
        });
  }

  Widget sitesList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(
          height: 32,
        ),
        Visibility(
          visible: regionSites.isNotEmpty,
          child: Text(
            selectedRegion,
            style: TextStyle(color: Colors.black.withOpacity(0.32)),
          ),
        ),
        Visibility(
            visible: regionSites.isNotEmpty,
            child: ListView.builder(
              shrinkWrap: true,
              controller: ScrollController(),
              itemBuilder: (context, index) => GestureDetector(
                onTap: () {
                  showLocationContent(regionSites[index]);
                },
                child: siteTile(regionSites[index]),
              ),
              itemCount: regionSites.length,
            )),
        Visibility(
            visible: regionSites.isEmpty,
            child: Column(
              children: [
                const SizedBox(
                  height: 80,
                ),
                Image.asset(
                  'assets/icon/coming_soon.png',
                  height: 80,
                  width: 80,
                ),
                const SizedBox(
                  height: 16,
                ),
                Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30),
                    child: Text(
                      '$selectedRegion\nWe’re Coming soon!',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    )),
                const SizedBox(
                  height: 8,
                ),
                Padding(
                    padding: const EdgeInsets.only(left: 20, right: 20),
                    child: Text(
                      'We currently do not support air quality '
                      'monitoring in this region, but we’re working on it.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: 14, color: Colors.black.withOpacity(0.4)),
                    )),
                const SizedBox(
                  height: 158,
                ),
              ],
            ))
      ],
    );
  }

  Widget siteTile(Measurement measurement) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      title: Text(
        measurement.site.getName(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
      subtitle: Text(
        measurement.site.getLocation(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(color: Colors.black.withOpacity(0.3), fontSize: 14),
      ),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
      leading: analyticsAvatar(measurement, 40, 15, 5),
    );
  }

  Future<void> _loadTheme() async {
    var prefs = await SharedPreferences.getInstance();
    var theme = prefs.getString(PrefConstant.appTheme) ?? 'light';

    switch (theme) {
      case 'light':
        await _mapController.setMapStyle(jsonEncode(googleMapsLightTheme));
        break;
      case 'dark':
        await _mapController.setMapStyle(jsonEncode(googleMapsDarkTheme));
        break;
      default:
        await _mapController.setMapStyle(jsonEncode(googleMapsLightTheme));
        break;
    }
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    setState(() {
      _mapController = controller;
    });

    await _loadTheme();
  }
}
