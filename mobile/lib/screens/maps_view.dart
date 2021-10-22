import 'dart:convert';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/themes/dark_theme.dart';
import 'package:app/themes/light_theme.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/readings_card.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CustomUserAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      width: 40,
      decoration: BoxDecoration(
          color: ColorConstants.appBodyColor, shape: BoxShape.circle),
    );
  }
}

class DraggingHandle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4,
      width: 32,
      decoration: BoxDecoration(
          color: Colors.grey[200], borderRadius: BorderRadius.circular(16)),
    );
  }
}

class MapView extends StatefulWidget {
  MapView({Key? key}) : super(key: key);

  @override
  _MapViewState createState() => _MapViewState();
}

class _MapViewState extends State<MapView> {
  @override
  bool showLocationDetails = false;
  double scrollSheetHeight = 0.20;
  List<Measurement> regionSites = [];
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
      child: Icon(
        Icons.clear,
        size: 20,
      ),
    );
  }

  Widget customTextField() {
    return Expanded(
      child: TextFormField(
        onTap: () {
          setState(() {
            scrollSheetHeight = 0.7;
          });
        },
        maxLines: 1,
        autofocus: true,
        decoration: const InputDecoration(
          contentPadding: EdgeInsets.all(8),
          hintText: '',
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget defaultContent() {
    return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: <Widget>[
            const SizedBox(height: 8),
            DraggingHandle(),
            const SizedBox(height: 16),
            searchContainer(),
            if (regionSites.isEmpty) regionsList(),
            if (regionSites.isNotEmpty) sitesList(),
          ],
        ));
  }

  Widget locationContent() {
    return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: <Widget>[
            const SizedBox(height: 8),
            DraggingHandle(),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Spacer(),
                GestureDetector(
                  onTap: showLocation,
                  child: closeDetails(),
                ),
              ],
            ),
            ReadingsCard(locationMeasurement),
          ],
        ));
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

  Widget regionsList() {
    return ListView(
      shrinkWrap: true,
      children: <Widget>[
        ListTile(
          leading: CustomUserAvatar(),
          onTap: () {
            showRegionSites('Central Region');
          },
          title: const Text(
            'Central Region',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          subtitle: const Text(
            'Uganda',
            style: TextStyle(fontSize: 8),
          ),
        ),
        const Divider(),
        ListTile(
          onTap: () {
            showRegionSites('Western Region');
          },
          leading: CustomUserAvatar(),
          title: const Text(
            'Western Region',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          subtitle: const Text(
            'Uganda',
            style: TextStyle(fontSize: 8),
          ),
        ),
        const Divider(),
        ListTile(
          onTap: () {
            showRegionSites('Eastern Region');
          },
          leading: CustomUserAvatar(),
          title: const Text(
            'Eastern Region',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          subtitle: const Text(
            'Uganda',
            style: TextStyle(fontSize: 8),
          ),
        ),
      ],
    );
  }

  Widget scrollViewContent() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: Card(
        elevation: 12.0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(0),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
          ),
          child: showLocationDetails ? locationContent() : defaultContent(),
        ),
      ),
    );
  }

  Widget searchContainer() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 50,
            decoration: BoxDecoration(
                color: ColorConstants.appBodyColor,
                borderRadius: BorderRadius.circular(6)),
            child: Row(
              children: <Widget>[
                const Padding(
                  padding: EdgeInsets.fromLTRB(10.0, 0, 0, 0),
                  child: Icon(Icons.search),
                ),
                customTextField(),
              ],
            ),
          ),
        ),
        const SizedBox(
          width: 8.0,
        ),
        Container(
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
              color: ColorConstants.appBodyColor,
              borderRadius: const BorderRadius.all(Radius.circular(10.0))),
          child: IconButton(
            iconSize: 30,
            icon: Icon(
              Icons.clear,
              color: ColorConstants.appBarTitleColor,
            ),
            onPressed: showRegions,
          ),
        )
      ],
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
      regionSites = [];
      showLocationDetails = false;
    });
  }

  void showRegionSites(String region) {
    DBHelper().getRegionSites(region).then((value) => {
          if (value.isNotEmpty)
            {
              setState(() {
                showLocationDetails = false;
                regionSites = value;
              })
            }
        });
  }

  Widget sitesList() {
    return ListView.separated(
      shrinkWrap: true,
      controller: ScrollController(),
      itemBuilder: (context, index) => GestureDetector(
        onTap: () {
          showLocationContent(regionSites[index]);
        },
        child: locationTile(regionSites[index]),
      ),
      itemCount: regionSites.length,
      separatorBuilder: (BuildContext context, int index) {
        return Divider(
          indent: 20,
          endIndent: 20,
          color: ColorConstants.appColor,
        );
      },
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
