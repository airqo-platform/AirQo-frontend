import 'dart:async';
import 'dart:collection';
import 'dart:convert';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/site.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/help_page.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/themes/dark_theme.dart';
import 'package:app/themes/light_theme.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/distance.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class MapWidget extends StatefulWidget {
  @override
  State<MapWidget> createState() => MapWidgetState();
}

class MapWidgetState extends State<MapWidget> {
  bool _showInfoWindow = false;
  Map<String, Marker> _markers = {};
  var windowProperties;
  String windowColor = '';
  var dbHelper = DBHelper();
  int _circleIdCounter = 0;
  bool isLoading = false;
  bool _isSearching = false;
  var searchedPalce;
  String query = '';
  List<String> favourites = [];
  var defaultLatLng = const LatLng(1.6183002, 32.504365);
  var defaultZoom = 6.6;
  var defaultCameraPosition =
      const CameraPosition(target: LatLng(1.6183002, 32.504365), zoom: 6.6);
  final TextEditingController _searchController = TextEditingController();

  late GoogleMapController _mapController;
  final Set<Circle> _circles = HashSet<Circle>();

  SearchApi searchApiClient = SearchApi(const Uuid().v4());

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
            // Positioned(
            //   top: 50,
            //   left: 0,
            //   right: 0,
            //   child: Padding(
            //     padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
            //     child: Column(
            //       children: [
            //         Row(
            //           mainAxisAlignment: MainAxisAlignment.start,
            //           children: [
            //             IconButton(
            //               icon: Icon(Icons.arrow_back_outlined,
            //                   color: ColorConstants.appColor),
            //               onPressed: () {
            //                 Navigator.pop(context);
            //               },
            //             ),
            //             Expanded(
            //               child: Container(
            //                 decoration: BoxDecoration(
            //                   color: Colors.white,
            //                   borderRadius: BorderRadius.circular(32),
            //                 ),
            //                 child: TextField(
            //                   controller: _searchController,
            //                   onTap: () async {
            //                     setState(() {
            //                       _showInfoWindow = false;
            //                     });
            //                   },
            //                   decoration: InputDecoration(
            //                     hintStyle: const TextStyle(fontSize: 13),
            //                     hintText: 'Search',
            //                     suffixIcon: Icon(Icons.search,
            //                         color: ColorConstants.appColor),
            //                     // border: InputBorder.none,
            //                     border: const OutlineInputBorder(
            //                         borderRadius: BorderRadius.all(
            //                             Radius.circular(25.0))),
            //                     contentPadding: const EdgeInsets.all(15),
            //                   ),
            //                   onChanged: (value) {
            //                     setState(() {
            //                       query = value;
            //                       _showInfoWindow = false;
            //                       _isSearching = true;
            //                     });
            //                   },
            //                   onSubmitted: (value) {
            //                     setState(() {
            //                       query = value;
            //                       _showInfoWindow = false;
            //                       _isSearching = true;
            //                     });
            //                   },
            //                 ),
            //               ),
            //             ),
            //             IconButton(
            //               iconSize: 30.0,
            //               icon: Icon(Icons.refresh_outlined,
            //                   color: ColorConstants.appColor),
            //               onPressed: _refreshMeasurements,
            //             ),
            //           ],
            //         ),
            //         if (query != '' && _isSearching)
            //           FutureBuilder(
            //             future: searchApiClient.fetchSuggestions(query),
            //             builder: (context, snapshot) {
            //               // if (query == '') {
            //               //   return FutureBuilder(
            //               //     future: DBHelper().getSearchHistory(),
            //               //     builder: (context, snapshot) {
            //               //       if (snapshot.hasData) {
            //               //         var results = snapshot.data
            //               //         as List<Suggestion>;
            //               //
            //               //         if (results.isEmpty) {
            //               //           return const Text('No data');
            //               //         }
            //               //
            //               //         return ListView.builder(
            //               //           itemBuilder: (context, index) =>
            //               //           ListTile(
            //               //             title: Text(
            //               //               (results[index]).description,
            //               //               style:
            //               //               const TextStyle
            //               //               (fontSize: 12, color:
            //               //               Colors.black54),
            //               //             ),
            //               //             leading: const Icon(
            //               //               Icons.history,
            //               //               color: ColorConstants.appColor,
            //               //             ),
            //               //             trailing: GestureDetector(
            //               //               onTap: () {
            //               //                 DBHelper()
            //               //                 .deleteSearchHistory(
            //               //                 results[index]);
            //               //                 query = '';
            //               //               },
            //               //               child: const Icon(
            //               //                 Icons.delete_outlined,
            //               //                 color: Colors.red,
            //               //               ),
            //               //             ),
            //               //             onTap: () {
            //               //               query = (results[index]).description;
            //               //               // close(context, results[index]);
            //               //             },
            //               //           ),
            //               //           itemCount: results.length,
            //               //         );
            //               //       }
            //               //
            //               //       return const Text('No data');
            //               //     },
            //               //   );
            //               // }
            //
            //               if (snapshot.hasError) {
            //                 return Padding(
            //                   padding: const EdgeInsets.all(16.0),
            //                   child: Text(
            //                     'Unable to search on map.\nTry again later',
            //                     textAlign: TextAlign.center,
            //                     style: TextStyle(
            //                         color: ColorConstants.appColor,
            //                         fontSize: 16,
            //                         fontWeight: FontWeight.w700,
            //                         backgroundColor: Colors.white),
            //                   ),
            //                 );
            //               } else if (snapshot.hasData) {
            //                 var results = snapshot.data as List<Suggestion>;
            //
            //                 return Padding(
            //                     padding: const EdgeInsets.fromLTRB(5, 5, 5, 0),
            //                     child: Container(
            //                       decoration: BoxDecoration(
            //                         color: Colors.white,
            //                         borderRadius: BorderRadius.circular(20),
            //                       ),
            //                       height:
            //                       MediaQuery.of(context).size.height * 0.5,
            //                       child: Padding(
            //                         padding:
            //                         const EdgeInsets.fromLTRB(0, 5, 0, 5),
            //                         child: ListView.builder(
            //                           itemBuilder: (context, index) => ListTile(
            //                             title: Text(
            //                               (results[index]).description,
            //                               style: TextStyle(
            //                                   color: ColorConstants.appColor),
            //                             ),
            //                             onTap: () {
            //                               query = (results[index]).description;
            //                               // DBHelper()
            //                               // .insertSearchHistory
            //                               // (results[index]);
            //                               displaySearchResults(results[index]);
            //
            //                               // close(context, results[index]);
            //                             },
            //                           ),
            //                           itemCount: results.length,
            //                         ),
            //                       ),
            //                     ));
            //               } else {
            //                 return Align(
            //                     alignment: Alignment.topCenter,
            //                     child: Column(
            //                       mainAxisAlignment: MainAxisAlignment.center,
            //                       crossAxisAlignment: CrossAxisAlignment.center,
            //                       children: [
            //                         Padding(
            //                           padding:
            //                           const EdgeInsets.fromLTRB(0, 5, 0, 0),
            //                           child: CircularProgressIndicator(
            //                             valueColor:
            //                             AlwaysStoppedAnimation<Color>(
            //                                 ColorConstants.appColor),
            //                           ),
            //                         ),
            //
            //                         // const Text(
            //                         //   'Loading...',
            //                         //   style: TextStyle(color:
            //                         //   ColorConstants.appColor),
            //                         // )
            //                       ],
            //                     ));
            //               }
            //             },
            //           ),
            //         Visibility(
            //           visible: _showInfoWindow,
            //           child: windowProperties != null
            //               ? infoWindow()
            //               : Card(
            //               child: Padding(
            //                 padding: const EdgeInsets.all(8.0),
            //                 child: Column(
            //                   children: [
            //                     Center(
            //                       child: Text('${AppConfig.name}',
            //                           softWrap: true),
            //                     ),
            //                   ],
            //                 ),
            //               )),
            //         ),
            //       ],
            //     ),
            //   ),
            // ),
            // if (isLoading)
            //   Positioned.fill(
            //     child: Align(
            //         alignment: Alignment.center,
            //         child: SizedBox(
            //           height: 200.0,
            //           child: Stack(
            //             children: <Widget>[
            //               Center(
            //                 child: Container(
            //                     width: 70,
            //                     height: 70,
            //                     child: CircularProgressIndicator(
            //                       valueColor: AlwaysStoppedAnimation<Color>(
            //                           ColorConstants.appColor),
            //                     )),
            //               ),
            //               // Center(
            //               //     child: Text(
            //               //   'Loading',
            //               //   style: TextStyle(color: ColorConstants.appColor),
            //               // )),
            //             ],
            //           ),
            //         )),
            //   ),
          ],
        ));
  }

  RawMaterialButton detailsButton(Measurement measurement) {
    return RawMaterialButton(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
          side: const BorderSide(color: Colors.white, width: 1)),
      fillColor: Colors.white,
      elevation: 10,
      highlightElevation: 10,
      splashColor: Colors.black12,
      highlightColor: Colors.white.withOpacity(0.4),
      onPressed: () async {
        showDetails(measurement);
      },
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Text(
          'More Details',
          style: TextStyle(color: ColorConstants.appColor),
        ),
      ),
    );
  }

  Future<void> displaySearchResults(Suggestion selection) async {
    setState(() {
      _isSearching = false;
      searchedPalce = selection;
      _showInfoWindow = false;
      _searchController.text = selection.description;
    });

    await searchApiClient
        .getPlaceDetails(selection.placeId)
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

  Future<void> getFavouritePlaces() async {
    var prefs = await SharedPreferences.getInstance();

    setState(() {
      favourites = prefs.getStringList(PrefConstant.favouritePlaces) ?? [];
    });
  }

  Widget infoWindow() {
    return Card(
        elevation: 10,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Text(
                windowProperties.site.getName(),
                softWrap: true,
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: ColorConstants.appColor,
                    fontSize: 20),
                overflow: TextOverflow.ellipsis,
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
                child: Row(
                  children: [
                    RichText(
                      text: TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text:
                                '${windowProperties.getPm2_5Value().toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 17,
                              color: ColorConstants.appColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text: ' µg/m\u00B3',
                            style: TextStyle(
                              fontSize: 12,
                              color: ColorConstants.appColor,
                            ),
                          )
                        ],
                      ),
                    ),
                    const Spacer(),
                    Text(
                      pmToString(windowProperties.getPm2_5Value()),
                      maxLines: 4,
                      softWrap: true,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.appColor,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Card(
                      elevation: 10,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(150),
                      ),
                      child: IconButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute<void>(
                              builder: (BuildContext context) => const HelpPage(
                                initialIndex: 0,
                              ),
                              fullscreenDialog: true,
                            ),
                          );
                        },
                        icon: Icon(Icons.info_outline,
                            color: ColorConstants.appColor),
                      )),
                  Card(
                    elevation: 10,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(150),
                    ),
                    child: IconButton(
                      onPressed: () {
                        shareMeasurement(windowProperties);
                      },
                      icon: Icon(Icons.share_outlined,
                          color: ColorConstants.appColor),
                    ),
                  ),
                  Card(
                    elevation: 10,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(150),
                    ),
                    child: IconButton(
                        onPressed: () {
                          updateFavouritePlace(windowProperties.site);
                        },
                        icon: favourites.contains(windowProperties.site.userId
                                .trim()
                                .toLowerCase())
                            ? Icon(
                                Icons.favorite,
                                color: ColorConstants.red,
                              )
                            : Icon(
                                Icons.favorite_border_outlined,
                                color: ColorConstants.red,
                              )),
                  ),
                  detailsButton(windowProperties),
                ],
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                child: Text(
                  'Last updated: ${dateToString(windowProperties.time, true)}',
                  style: TextStyle(
                    fontSize: 13,
                    color: ColorConstants.appColor,
                  ),
                ),
              ),
            ],
          ),
        ));
  }

  @override
  void initState() {
    super.initState();
    _showInfoWindow = false;
    getFavouritePlaces();
  }

  Future<void> loadTheme() async {
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

  Future<void> localFetch() async {
    var measurements = await dbHelper.getLatestMeasurements();

    if (measurements.isNotEmpty) {
      await setMeasurements(measurements);
    }
  }

  Future<void> setMeasurements(List<Measurement> measurements) async {
    _showInfoWindow = false;
    var markers = <String, Marker>{};
    for (final measurement in measurements) {
      var bitmapDescriptor = await pmToMarkerV2(measurement.getPm2_5Value());

      final marker = Marker(
        markerId: MarkerId(measurement.site.id),
        icon: bitmapDescriptor,
        position:
            LatLng((measurement.site.latitude), measurement.site.longitude),
        infoWindow: InfoWindow(
          title: measurement.getPm2_5Value().toStringAsFixed(2),
          // snippet: node.location,
        ),
        onTap: () {
          updateInfoWindow(measurement);
        },
      );
      markers[measurement.site.id] = marker;
    }

    isLoading = false;

    if (mounted) {
      setState(() {
        _showInfoWindow = false;
        _markers.clear();
        _markers = markers;
        isLoading = false;
      });
    }
  }

  void showDetails(Measurement measurement) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(measurement: measurement);
    })).then((value) => _getMeasurements());
  }

  Future<void> updateFavouritePlace(Site site) async {
    bool favourite;

    favourite = await DBHelper().updateFavouritePlaces(site);

    await getFavouritePlaces();

    if (mounted) {
      if (favourite) {
        await showSnackBar(
            context, '${site.getName()} has been added to your places');
      } else {
        await showSnackBar(
            context, '${site.getName()} has been removed from your places');
      }
    }
  }

  void updateInfoWindow(Measurement measurement) {
    setState(() {
      _isSearching = false;
      windowProperties = measurement;
      _showInfoWindow = true;
    });
  }

  Future<void> _getMeasurements() async {
    await localFetch();

    var measurements = await AirqoApiClient(context).fetchLatestMeasurements();

    if (measurements.isNotEmpty) {
      await setMeasurements(measurements);
      await dbHelper.insertLatestMeasurements(measurements);
    }

    if (mounted) {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    _mapController = controller;
    await loadTheme();

    await _getMeasurements();
  }

  Future<void> _refreshMeasurements() async {
    var message = 'Refreshing map.... ';
    await showSnackBar(context, message);

    var measurements = await AirqoApiClient(context).fetchLatestMeasurements();

    if (measurements.isNotEmpty) {
      await setMeasurements(measurements);

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
          radius: kmIntToMetersDouble(AppConfig.searchRadius),
          fillColor: ColorConstants.appColor.withOpacity(0.5),
          strokeWidth: 2,
          strokeColor: ColorConstants.appColor));
  }
}
