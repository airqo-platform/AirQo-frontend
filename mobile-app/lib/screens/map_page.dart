import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/screens/search.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/date.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/help.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:app/utils/ui/share.dart';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapPage extends StatefulWidget {
  @override
  State<MapPage> createState() => MapPageState();
}

class MapPageState extends State<MapPage> {
  bool _showInfoWindow = false;
  Map<String, Marker> _markers = {};
  var windowProperties;
  String windowColor = '';
  var dbHelper = DBHelper();
  bool isLoading = true;

  @override
  void initState() {
    _showInfoWindow = false;
    isLoading = true;
    super.initState();
    // setCustomMarkers();
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

    if (measurements.isNotEmpty) {
      await setMeasurements(measurements);
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

    if (measurements.isNotEmpty) {
      await setMeasurements(measurements);

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
                target: LatLng(1.6183002, 32.504365),
                zoom: 6.6,
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
                padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
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
                              onTap: () async {
                                // setState(() {
                                //   _showInfoWindow = false;
                                // });
                                await showSearch(
                                  context: context,
                                  delegate: LocationSearch(),
                                );
                                // Navigator.push(context,
                                //     MaterialPageRoute(builder: (context) {
                                //   return SearchPage();
                                // })).then((value) => _getMeasurements());
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
                        ),
                        IconButton(
                          iconSize: 30.0,
                          icon: const Icon(Icons.refresh_outlined,
                              color: appColor),
                          onPressed: _refreshMeasurements,
                        ),
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
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(appColor),
                    )),
              ),
            // Positioned(
            //     bottom: 0,
            //     left: 0,
            //     right: 0,
            //     child: Row(
            //       mainAxisAlignment: MainAxisAlignment.center,
            //       crossAxisAlignment: CrossAxisAlignment.center,
            //       children: [
            //         IconButton(
            //           iconSize: 30.0,
            //           icon: const Icon(Icons.refresh_outlined, color: appColor),
            //           onPressed: _refreshMeasurements,
            //         ),
            //         IconButton(
            //           iconSize: 30.0,
            //           icon: const Icon(Icons.help_outline_outlined,
            //               color: appColor),
            //           onPressed: () {
            //             Navigator.push(
            //               context,
            //               MaterialPageRoute<void>(
            //                 builder: (BuildContext context) => getHelpPage(''),
            //                 fullscreenDialog: true,
            //               ),
            //             );
            //           },
            //         ),
            //       ],
            //     )),
          ],
        ));
  }

  Future<void> localFetch() async {
    var measurements = await dbHelper.getMeasurements();

    if (measurements.isNotEmpty) {
      await setMeasurements(measurements);
    }
  }

  void showDetails(Device device) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(device: device);
    })).then((value) => _getMeasurements());
  }

  Future<void> setMeasurements(List<Measurement> measurements) async {
    _showInfoWindow = false;
    var markers = <String, Marker>{};
    for (final measurement in measurements) {
      var bitmapDescriptor = await pmToMarker(measurement.pm2_5.value);

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
      markers[measurement.channelID.toString()] = marker;
    }

    isLoading = false;

    setState(() {
      _showInfoWindow = false;
      _markers.clear();
      _markers = markers;
      isLoading = false;
    });
  }

  // @override
  // void dispose() {
  //
  //   if (mounted) {
  //     setState(() {
  //       _showInfoWindow = false;
  //       _markers = {};
  //       isLoading = false;
  //     });
  //   }
  //   super.dispose();
  // }

  Widget infoWindow() {
    return Card(
        child: Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          Text(
            (windowProperties.locationDetails.favourite &&
                    windowProperties.locationDetails.nickName != null)
                ? windowProperties.locationDetails.nickName
                : windowProperties.locationDetails.siteName,
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
                    Padding(
                      padding: const EdgeInsets.fromLTRB(5, 0, 0, 0),
                      child: Text(
                        windowProperties.pm2_5.value.toString(),
                        style: TextStyle(
                            color: pmTextColor(windowProperties.pm2_5.value)),
                      ),
                    ),
                    // Expanded(child: Text(
                    //   pmToString(windowProperties.pm2_5.value),
                    //   maxLines: 4,
                    //   softWrap: true,
                    //   textAlign: TextAlign.center,
                    // ),
                    // ),
                    Text(
                      pmToString(windowProperties.pm2_5.value),
                      maxLines: 4,
                      softWrap: true,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          color: pmTextColor(windowProperties.pm2_5.value)),
                    ),

                    Padding(
                      padding: const EdgeInsets.fromLTRB(0, 0, 5, 0),
                      child: Text(
                        dateToString(windowProperties.time),
                        style: TextStyle(
                            color: pmTextColor(windowProperties.pm2_5.value)),
                      ),
                    ),
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
                  shareLocation(windowProperties.locationDetails);
                },
                icon: const Icon(Icons.share_outlined, color: appColor),
              ),
              IconButton(
                  onPressed: () {
                    updateFavouritePlace(windowProperties.locationDetails);
                  },
                  icon: windowProperties.locationDetails.favourite
                      ? const Icon(
                          Icons.favorite,
                          color: Colors.red,
                        )
                      : const Icon(
                          Icons.favorite_border_outlined,
                          color: Colors.red,
                        )),
              GestureDetector(
                onTap: () {
                  showDetails(windowProperties.locationDetails);
                },
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

  Future<void> updateFavouritePlace(Device device) async {
    Device place;
    if (device.favourite) {
      place = await DBHelper().updateFavouritePlace(device, false);
    } else {
      place = await DBHelper().updateFavouritePlace(device, true);
    }

    setState(() {
      _showInfoWindow = false;
    });

    if (place.favourite) {
      await showSnackBarGoToMyPlaces(
          context, '${place.siteName} is added to your places');
    } else {
      await showSnackBar2(
          context, '${place.siteName} is removed from your places');
    }
  }
}
