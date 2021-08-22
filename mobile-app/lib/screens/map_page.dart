import 'dart:async';
import 'dart:collection';
import 'dart:convert';

import 'package:app/config/themes/dark_theme.dart';
import 'package:app/config/themes/light_theme.dart';
import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/date.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/help.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:app/utils/ui/share.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

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
  int _circleIdCounter = 0;
  bool isLoading = true;
  bool _isSearching = false;
  var searchedPalce;
  String query = '';
  var defaultLatLng = const LatLng(1.6183002, 32.504365);
  var defaultZoom = 6.6;
  var defaultCameraPosition = const CameraPosition(
      target: LatLng(1.6183002, 32.504365), zoom: 6.6);
  final TextEditingController _searchController = TextEditingController();

  late GoogleMapController _mapController;
  final Set<Circle> _circles = HashSet<Circle>();

  GoogleSearchProvider googleApiClient =
      GoogleSearchProvider(const Uuid().v4());

  @override
  void initState() {
    _showInfoWindow = false;
    isLoading = true;
    super.initState();
  }

  void updateInfoWindow(Measurement measurement) {
    setState(() {
      _isSearching = false;
      windowProperties = measurement;
      _showInfoWindow = true;
    });
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    _mapController = controller;
    await loadTheme();

    await _getMeasurements();
  }

  Future<void> loadTheme() async {
    var prefs = await SharedPreferences.getInstance();
    var theme = prefs.getString(appTheme);

    if (theme != null) {
      switch (theme) {
        case 'light':
          await _mapController.setMapStyle(jsonEncode(googleMapsLightTheme));
          break;
        case 'dark':
          await _mapController.setMapStyle(jsonEncode(googleMapsDarkTheme));
          break;
        default:
          await _mapController.setMapStyle(jsonEncode([]));
          break;
      }
    }
  }

  Future<void> _getMeasurements() async {
    await localFetch();

    var measurements = await AirqoApiClient(context).fetchMeasurements();

    if (measurements.isNotEmpty) {
      await setMeasurements(measurements);
      await dbHelper.insertLatestMeasurements(measurements);
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

      // var _cameraPosition = CameraPosition(
      //     target: defaultLatLng, zoom: defaultZoom);

      final controller = _mapController;
      await controller
          .animateCamera(CameraUpdate.newCameraPosition(defaultCameraPosition));

      await showSnackBar(context, 'Refresh Complete');

      await dbHelper.insertLatestMeasurements(measurements);
    }
  }

  void _setCircles(LatLng point) {
    final circleIdVal = 'circle_id_$_circleIdCounter';

    setState(() {
      _circleIdCounter++;
    });

    _circles
      ..clear()
      ..add(Circle(
        circleId: CircleId(circleIdVal),
        center: point,
        radius: 1000,
        fillColor: appColor.withOpacity(0.5),
        strokeWidth: 2,
        strokeColor: appColor));
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
              zoomControlsEnabled: true,
              initialCameraPosition: defaultCameraPosition,
              markers: _markers.values.toSet(),
              circles: _circles,
              onTap: (_) {
                setState(() {
                  _showInfoWindow = false;
                  _isSearching = false;
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
                              controller: _searchController,
                              onTap: () async {
                                setState(() {
                                  _showInfoWindow = false;
                                });
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
                              onChanged: (value) {
                                setState(() {
                                  query = value;
                                  _showInfoWindow = false;
                                  _isSearching = true;
                                });
                              },
                              onSubmitted: (value) {
                                setState(() {
                                  query = value;
                                  _showInfoWindow = false;
                                  _isSearching = true;
                                });
                              },
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
                    if (query != '' && _isSearching)
                      FutureBuilder(
                        future: googleApiClient.fetchSuggestions(query),
                        builder: (context, snapshot) {
                          // if (query == '') {
                          //   return FutureBuilder(
                          //     future: DBHelper().getSearchHistory(),
                          //     builder: (context, snapshot) {
                          //       if (snapshot.hasData) {
                          //         var results = snapshot.data
                          //         as List<Suggestion>;
                          //
                          //         if (results.isEmpty) {
                          //           return const Text('No data');
                          //         }
                          //
                          //         return ListView.builder(
                          //           itemBuilder: (context, index) =>
                          //           ListTile(
                          //             title: Text(
                          //               (results[index]).description,
                          //               style:
                          //               const TextStyle
                          //               (fontSize: 12, color:
                          //               Colors.black54),
                          //             ),
                          //             leading: const Icon(
                          //               Icons.history,
                          //               color: appColor,
                          //             ),
                          //             trailing: GestureDetector(
                          //               onTap: () {
                          //                 DBHelper()
                          //                 .deleteSearchHistory(
                          //                 results[index]);
                          //                 query = '';
                          //               },
                          //               child: const Icon(
                          //                 Icons.delete_outlined,
                          //                 color: Colors.red,
                          //               ),
                          //             ),
                          //             onTap: () {
                          //               query = (results[index]).description;
                          //               // close(context, results[index]);
                          //             },
                          //           ),
                          //           itemCount: results.length,
                          //         );
                          //       }
                          //
                          //       return const Text('No data');
                          //     },
                          //   );
                          // }

                          if (snapshot.hasError) {
                            return Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Text(
                                '${snapshot.error.toString()
                                    .replaceAll('Exception: ', '')}',
                                style: const TextStyle(
                                    color: appColor,
                                    fontSize: 16,
                                    backgroundColor: Colors.white),
                              ),
                            );
                          } else if (snapshot.hasData) {
                            print(snapshot.data);

                            var results = snapshot.data as List<Suggestion>;

                            return Padding(
                                padding: const EdgeInsets.fromLTRB(5, 5, 5, 0),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  height:
                                      MediaQuery.of(context).size.height * 0.5,
                                  child: Padding(
                                    padding:
                                        const EdgeInsets.fromLTRB(0, 5, 0, 5),
                                    child: ListView.builder(
                                      itemBuilder: (context, index) => ListTile(
                                        title: Text(
                                          (results[index]).description,
                                          style:
                                              const TextStyle(color: appColor),
                                        ),
                                        onTap: () {
                                          query = (results[index]).description;
                                          // DBHelper()
                                          // .insertSearchHistory
                                          // (results[index]);
                                          displaySearchResults(results[index]);

                                          // close(context, results[index]);
                                        },
                                      ),
                                      itemCount: results.length,
                                    ),
                                  ),
                                ));
                          } else {
                            return Align(
                                alignment: Alignment.topCenter,
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    const Padding(
                                      padding: EdgeInsets.fromLTRB(0, 5, 0, 0),
                                      child: CircularProgressIndicator(
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                                appColor),
                                      ),
                                    ),

                                    // const Text(
                                    //   'Loading...',
                                    //   style: TextStyle(color: appColor),
                                    // )
                                  ],
                                ));
                          }
                        },
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
            //           icon: const Icon(Icons.refresh_outlined,
            //           color: appColor),
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
            //                 builder: (BuildContext context)
            //                 => getHelpPage(''),
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

    print("Measurements to be set");
    print(measurements);

    _showInfoWindow = false;
    var markers = <String, Marker>{};
    for (final measurement in measurements) {
      var bitmapDescriptor = await pmToMarker(measurement.pm2_5.value);

      final marker = Marker(
        markerId: MarkerId(measurement.device.name),
        icon: bitmapDescriptor,
        position:
            LatLng((measurement.device.latitude), measurement.device.longitude),
        infoWindow: InfoWindow(
          title: measurement.pm2_5.value.toString(),
          // snippet: node.location,
        ),
        onTap: () {
          updateInfoWindow(measurement);
        },
      );
      markers[measurement.device.name] = marker;
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
            (windowProperties.device.favourite &&
                    windowProperties.device.nickName != null)
                ? windowProperties.device.nickName
                : windowProperties.device.siteName,
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
                  shareMeasurement(windowProperties);
                },
                icon: const Icon(Icons.share_outlined, color: appColor),
              ),
              IconButton(
                  onPressed: () {
                    updateFavouritePlace(windowProperties.device);
                  },
                  icon: windowProperties.device.favourite
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
                  showDetails(windowProperties.device);
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

  Future<void> displaySearchResults(Suggestion selection) async {
    setState(() {
      _isSearching = false;
      searchedPalce = selection;
      _showInfoWindow = false;
      _searchController.text = selection.description;
    });

    await googleApiClient
        .getPlaceDetailFromId(selection.placeId)
        .then((value) async {
      var latLng =
          LatLng(value.geometry.location.lat, value.geometry.location.lng);

      var _cameraPosition = CameraPosition(target: latLng, zoom: 14);

      // final controller = await _mapController.future;
      final controller = _mapController;

      await controller
          .animateCamera(CameraUpdate.newCameraPosition(_cameraPosition));

      _setCircles(latLng);

      var marker = Marker(
        markerId: const MarkerId('mysearch'),
        position: latLng,
      );

      setState(() {
        _markers['mysearch'] = marker;
        // _markers.addAll(markers);
      });
    });
  }
}
