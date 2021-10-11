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
  bool isLoading = true;
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
    return Stack(
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
        //                     width: 100,
        //                     height: 100,
        //                     child: CircularProgressIndicator(
        //                       valueColor: AlwaysStoppedAnimation<Color>(
        //                           ColorConstants.appColor),
        //                     )),
        //               ),
        //               Center(
        //                   child: Text(
        //                     'Loading',
        //                     style: TextStyle(color: ColorConstants.appColor),
        //                   )),
        //             ],
        //           ),
        //         )),
        //   ),
      ],
    );
  }

  RawMaterialButton detailsButton(Site site) {
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
        showDetails(site);
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
                    Text(
                      windowProperties.getPm2_5Value().toStringAsFixed(2),
                      style: TextStyle(
                        fontSize: 17,
                        color: ColorConstants.appColor,
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
                        icon: favourites.contains(
                                windowProperties.site.id.trim().toLowerCase())
                            ? Icon(
                                Icons.favorite,
                                color: ColorConstants.red,
                              )
                            : Icon(
                                Icons.favorite_border_outlined,
                                color: ColorConstants.red,
                              )),
                  ),
                  detailsButton(windowProperties.site),
                ],
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                child: Text(
                  dateToString(windowProperties.time, true),
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
    _showInfoWindow = false;
    isLoading = true;
    getFavouritePlaces();
    super.initState();
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
        await _mapController.setMapStyle(jsonEncode([]));
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
      var bitmapDescriptor = await pmToMarker(measurement.getPm2_5Value());

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

  void showDetails(Site site) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(site: site);
    })).then((value) => _getMeasurements());
  }

  Future<void> updateFavouritePlace(Site site) async {
    bool favourite;

    favourite = await DBHelper().updateFavouritePlaces(site);

    await getFavouritePlaces();

    if (mounted) {
      if (favourite) {
        await showSnackBarGoToMyPlaces(
            context, '${site.getName()} is added to your places');
      } else {
        await showSnackBar(
            context, '${site.getName()} is removed from your places');
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

    await AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (mounted && value.isNotEmpty)
            {
              setMeasurements(value),
            },
          if (value.isNotEmpty)
            {
              dbHelper.insertLatestMeasurements(value),
            }
        });

    if (mounted) {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _onMapCreated(GoogleMapController controller) async {
    if (mounted) {
      _mapController = controller;
      await loadTheme();

      // await _getMeasurements();
    }
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
