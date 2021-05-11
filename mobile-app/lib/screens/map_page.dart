import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/search.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/date.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/help.dart';
import 'package:app/utils/ui/pm.dart';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:share/share.dart';

class MapPage extends StatefulWidget {
  @override
  State<MapPage> createState() => MapPageState();
}

class MapPageState extends State<MapPage> {
  bool _showInfoWindow = false;
  final Map<String, Marker> _markers = {};
  var windowProperties;
  String windowColor = '';
  var dbHelper = DBHelper();
  bool isLoading = true;

  late BitmapDescriptor markerIcon;
  final Map<String, BitmapDescriptor> _markerIcons = {};
  List<String> markerColors = [
    'good',
    'moderate',
    'sensitive',
    'unhealthy',
    'very unhealthy',
    'hazardous'
  ];

  @override
  void initState() {
    _showInfoWindow = false;
    isLoading = true;
    super.initState();
    // setCustomMarkers();
  }

  void setCustomMarkers() async {
    for (var i = 0; i < markerColors.length; i++) {
      var color = markerColors[i];

      // var markerIcon = await BitmapDescriptor.fromAssetImage(
      //     const ImageConfiguration(size: Size(3, 3)),
      //     'assets/images/good-face.png');

      var markerIcon = BitmapDescriptor.defaultMarker;

      switch (color) {
        case 'good':
          markerIcon =
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
          break;

        case 'moderate':
          markerIcon =
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow);
          break;

        case 'sensitive':
          markerIcon =
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
          break;

        case 'unhealthy':
          markerIcon =
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
          break;

        case 'very unhealthy':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(285);
          break;

        case 'hazardous':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueMagenta);
          break;

        default:
          markerIcon = BitmapDescriptor.defaultMarker;
          break;
      }

      _markerIcons[color] = markerIcon;
    }
  }

  void updateInfoWindow(Measurement measurement) {
    setState(() {
      windowProperties = measurement;
      _showInfoWindow = true;
    });
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    await _getMeasurements();
  }

  Future<void> _getMeasurements() async {
    await localFetch();

    var measurements = await AirqoApiClient(context).fetchMeasurements();
    // var devices = await AirqoApiClient(context).fetchDevices();
    //
    // measurements = AirqoApiClient(context)
    //     .mapMeasurements(measurements, devices);

    if (measurements.isNotEmpty) {
      setMeasurements(measurements);
      await dbHelper.insertMeasurements(measurements);
    }

    setState(() {
      isLoading = false;
    });
  }

  Future<void> _refreshMeasurements() async {
    var message = 'Refreshing map.... ';
    await showSnackBar(context, message);

    var measurements = await AirqoApiClient(context).fetchMeasurements();

    // var devices = await AirqoApiClient(context).fetchDevices();
    //
    // measurements = AirqoApiClient(context)
    //     .mapMeasurements(measurements, devices);

    if (measurements.isNotEmpty) {
      setMeasurements(measurements);

      var message = 'Refresh Complete';
      await showSnackBar(context, message);

      await dbHelper.insertMeasurements(measurements);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: null,
        body: Stack(
          children: [
            GoogleMap(
              compassEnabled: false,
              onMapCreated: _onMapCreated,
              mapType: MapType.normal,
              myLocationButtonEnabled: false,
              myLocationEnabled: false,
              rotateGesturesEnabled: false,
              tiltGesturesEnabled: false,
              mapToolbarEnabled: false,
              initialCameraPosition: const CameraPosition(
                target: LatLng(0.3318118, 32.5694503),
                zoom: 6,
              ),
              markers: _markers.values.toSet(),
              onTap: (_) {
                setState(() {
                  _showInfoWindow = false;
                });
              },
            ),
            Positioned(
              top: 50,
              left: 0,
              right: 0,
              child: Padding(
                padding: EdgeInsets.fromLTRB(8, 0, 8, 0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_outlined,
                              color: appColor),
                          onPressed: () {
                            Navigator.pop(context);
                          },
                        ),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white70,
                              borderRadius: BorderRadius.circular(32),
                            ),
                            child: TextField(
                              readOnly: true,
                              onTap: () {
                                // setState(() {
                                //   _showInfoWindow = false;
                                // });

                                Navigator.push(context,
                                    MaterialPageRoute(builder: (context) {
                                  return SearchPage();
                                }));
                              },
                              decoration: const InputDecoration(
                                hintStyle: TextStyle(fontSize: 13),
                                hintText: 'Search',
                                suffixIcon: Icon(Icons.search, color: appColor),
                                // border: InputBorder.none,
                                border: OutlineInputBorder(
                                    borderRadius: BorderRadius.all(
                                        Radius.circular(25.0))),
                                contentPadding: EdgeInsets.all(15),
                              ),
                            ),
                          ),
                        )
                      ],
                    ),
                    Visibility(
                      visible: _showInfoWindow,
                      child: windowProperties != null
                          ? infoWindow()
                          : Card(
                              child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                children: [
                                  const Center(
                                    child: Text(appName, softWrap: true),
                                  ),
                                ],
                              ),
                            )),
                    ),
                  ],
                ),
              ),
            ),
            if (isLoading)
              const Positioned.fill(
                child: Align(
                    alignment: Alignment.center,
                    child: CircularProgressIndicator()),
              ),
            Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    IconButton(
                      iconSize: 30.0,
                      icon: const Icon(Icons.refresh_outlined, color: appColor),
                      onPressed: _refreshMeasurements,
                    ),
                    IconButton(
                      iconSize: 30.0,
                      icon: const Icon(Icons.help_outline_outlined,
                          color: appColor),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute<void>(
                            builder: (BuildContext context) => getHelpPage(''),
                            fullscreenDialog: true,
                          ),
                        );
                      },
                    ),
                  ],
                )),
          ],
        ));
  }

  Future<void> localFetch() async {
    var measurements = await dbHelper.getMeasurements();

    if (measurements.isNotEmpty) {
      setMeasurements(measurements);
    }
  }

  void showDetails() async {
    var message = 'Coming soon';
    await showSnackBar(context, message);
  }

  void addToFavouritePlaces() async {
    var message = 'Coming soon';
    await showSnackBar(context, message);
  }

  void setMeasurements(List<Measurement> measurements) {
    setState(() {
      _showInfoWindow = false;
      _markers.clear();
      for (final measurement in measurements) {
        var bitmapDescriptor = pmToMarkerPoint(measurement.pm2_5.value);

        final marker = Marker(
          markerId: MarkerId(measurement.channelID.toString()),
          icon: bitmapDescriptor,
          position: LatLng((measurement.locationDetails.latitude),
              measurement.locationDetails.longitude),
          infoWindow: InfoWindow(
            title: measurement.pm2_5.value.toString(),
            // snippet: node.location,
          ),
          onTap: () {
            updateInfoWindow(measurement);
          },
        );
        _markers[measurement.channelID.toString()] = marker;
      }

      isLoading = false;
    });
  }

  Widget infoWindow() {
    return Card(
        child: Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          Text(
            windowProperties.locationDetails.siteName,
            softWrap: true,
            style: const TextStyle(color: appColor),
            overflow: TextOverflow.ellipsis,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(0, 5, 0, 0),
            child: Container(
                padding: const EdgeInsets.all(5.0),
                decoration: BoxDecoration(
                    color: pmToColor(windowProperties.pm2_5.value),
                    border: Border.all(
                      color: pmToColor(windowProperties.pm2_5.value),
                    ),
                    borderRadius: const BorderRadius.all(Radius.circular(10))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Text(
                      windowProperties.pm2_5.value.toString(),
                      // style: TextStyle(
                      //     color: Colors.white
                      // ),
                    ),
                    Text(
                      pmToString(windowProperties.pm2_5.value),
                      //   style: TextStyle(
                      //   color: Colors.white
                      // ),
                    ),
                    Text(
                      dateToString(windowProperties.time),
                      softWrap: true,
                      overflow: TextOverflow.ellipsis,
                      // style: TextStyle(
                      //     color: Colors.white
                      // ),
                    )
                  ],
                )),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                      builder: (BuildContext context) => getHelpPage(''),
                      fullscreenDialog: true,
                    ),
                  );
                },
                icon: const Icon(Icons.info_outline, color: appColor),
              ),
              IconButton(
                onPressed: () {
                  var text = 'Checkout the air quality of '
                      '${windowProperties.locationDetails.siteName} at https://www.airqo.net';
                  Share.share(
                    text,
                    subject: 'Airqo, Breathe Clean',
                  );
                },
                icon: const Icon(Icons.share_outlined, color: appColor),
              ),
              IconButton(
                onPressed: addToFavouritePlaces,
                icon:
                    const Icon(Icons.favorite_border_outlined, color: appColor),
              ),
              GestureDetector(
                onTap: showDetails,
                child: const Text('More Details',
                    softWrap: true,
                    style: TextStyle(
                        color: appColor, fontWeight: FontWeight.bold)),
              )
            ],
          ),
        ],
      ),
    ));
  }
}
