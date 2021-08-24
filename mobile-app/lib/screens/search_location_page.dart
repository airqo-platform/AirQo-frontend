import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/distance.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import 'map_page.dart';

class LocationSearch extends SearchDelegate<Suggestion> {
  LocationSearch() {
    googleApiClient = GoogleSearchProvider(const Uuid().v4());
  }

  GoogleSearchProvider googleApiClient = GoogleSearchProvider('');

  String _searchPlaceId = '';
  bool _showAllDevices = false;

  bool get showAllDevices => _showAllDevices;

  set showAllDevices(bool value) {
    _showAllDevices = value;
  }

  String get searchPlaceId => _searchPlaceId;

  set searchPlaceId(String value) {
    _searchPlaceId = value;
  }

  @override
  ThemeData appBarTheme(BuildContext context) {
    final base = Theme.of(context);

    return base.copyWith(
      primaryColor: ColorConstants().appColor,
    );
  }

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        tooltip: 'Clear',
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
        },
      ),
      IconButton(
        tooltip: 'Map',
        icon: const Icon(Icons.public_sharp),
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) {
            return MapPage();
          }));
        },
      )
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      tooltip: 'Back',
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, Suggestion(description: '', placeId: ''));
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return FutureBuilder(
      future: query == '' ? null : googleApiClient.fetchSuggestions(query),
      builder: (context, snapshot) {
        if (query == '') {
          return FutureBuilder(
            future: DBHelper().getSearchHistory(),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                var results = snapshot.data as List<Suggestion>;

                if (results.isEmpty) {
                  return Align(
                      alignment: Alignment.topCenter,
                      child: Container(
                        padding: const EdgeInsets.all(16.0),
                        child: Text(
                          'Search a place',
                          style: TextStyle(color: ColorConstants().appColor),
                        ),
                      ));
                }

                return ListView.builder(
                  itemBuilder: (context, index) => ListTile(
                    title: Text(
                      (results[index]).description,
                      style:
                          const TextStyle(fontSize: 12, color: Colors.black54),
                    ),
                    leading: Icon(
                      Icons.history,
                      color: ColorConstants().appColor,
                    ),
                    trailing: GestureDetector(
                      onTap: () {
                        DBHelper().deleteSearchHistory(results[index]);
                        query = '';
                      },
                      child: const Icon(
                        Icons.delete_outlined,
                        color: Colors.red,
                      ),
                    ),
                    onTap: () {
                      query = (results[index]).description;
                      showAllDevices = false;
                      searchPlaceId = (results[index]).placeId;
                      showResults(context);
                      // close(context, results[index]);
                    },
                  ),
                  itemCount: results.length,
                );
              }

              return Align(
                  alignment: Alignment.topCenter,
                  child: Container(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      'Search a place',
                      style: TextStyle(color: ColorConstants().appColor),
                    ),
                  ));
            },
          );
        }

        if (snapshot.hasError) {
          return Container(
            padding: const EdgeInsets.all(16.0),
            child: const Text(
                'Could not get suggestions. try again later or use the map'),
          );
        } else if (snapshot.hasData) {
          // print(snapshot.data);

          var results = snapshot.data as List<Suggestion>;

          return ListView.builder(
            itemBuilder: (context, index) => ListTile(
              title: Text(
                (results[index]).description,
              ),
              onTap: () {
                query = (results[index]).description;
                showAllDevices = false;
                searchPlaceId = (results[index]).placeId;
                DBHelper().insertSearchHistory(results[index]);
                showResults(context);
                // close(context, results[index]);
              },
            ),
            itemCount: results.length,
          );
        } else {
          return Container(
            padding: const EdgeInsets.all(16.0),
            child: Align(
                alignment: Alignment.topCenter,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                          ColorConstants().appColor),
                    ),
                    Text(
                      'Loading...',
                      style: TextStyle(color: ColorConstants().appColor),
                    )
                  ],
                )),
          );
        }
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    if (showAllDevices) {
      return loadLocalDevices();
    }

    if (query == '') {
      return Align(
          alignment: Alignment.topCenter,
          child: Container(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Search a place',
              style: TextStyle(color: ColorConstants().appColor),
            ),
          ));
    }

    print(searchPlaceId);

    if (searchPlaceId == '') {
      return Align(
          alignment: Alignment.topCenter,
          child: Container(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Failed to locate $query, search again and tap on any of the '
              'available suggestions or use the map '
              'on the top right corner',
              textAlign: TextAlign.center,
              style: TextStyle(color: ColorConstants().appColor),
            ),
          ));
    }

    return FutureBuilder(
        future: googleApiClient.getPlaceDetailFromId(searchPlaceId),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Container(
              padding: const EdgeInsets.all(16.0),
              child: Text('${snapshot.error.toString()}'),
            );
          } else if (snapshot.hasData) {
            var place = snapshot.data as Place;

            return FutureBuilder(
                future: AirqoApiClient(context).getDevicesByCoordinates(
                    place.geometry.location.lat, place.geometry.location.lng),
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    return Container(
                      padding: const EdgeInsets.all(16.0),
                      child: Text('${snapshot.error.toString()}'),
                    );
                  } else if (snapshot.hasData) {
                    var devices = snapshot.data as List<Device>;

                    if (devices.isEmpty) {
                      return Align(
                          alignment: Alignment.center,
                          child: Padding(
                            padding: const EdgeInsets.all(8),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                  'Sorry, we dont have any sensors'
                                  ' close to $query',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      color: ColorConstants().appColor),
                                ),
                                showAllLocationsCustomButton(context),
                                showMapCustomButton(context)
                              ],
                            ),
                          ));
                    }

                    return Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text(
                            'Air quality sensors near $query',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: ColorConstants().appColor),
                          ),
                        ),
                        Expanded(
                            child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: devices.length,
                          itemBuilder: (context, index) {
                            return InkWell(
                                onTap: () {
                                  var device = devices[index];
                                  Navigator.push(context,
                                      MaterialPageRoute(builder: (context) {
                                    return PlaceDetailsPage(
                                      device: device,
                                    );
                                  }));
                                },
                                child: ListTile(
                                  title: Text('${devices[index].siteName}'),
                                  subtitle:
                                      Text('${devices[index].locationName}'),
                                  // leading: const Icon(
                                  //   Icons.location_pin,
                                  //   color: ColorConstants().appColor,
                                  // ),
                                  trailing: Text(
                                    '${kmToMeters(devices[index].distance)}'
                                    ' meters',
                                    style: TextStyle(
                                        color: ColorConstants().appColor),
                                  ),
                                ) //your content here
                                );
                          },
                        ))
                      ],
                    );
                  } else {
                    return Align(
                      alignment: Alignment.center,
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  ColorConstants().appColor),
                            ),
                            Text(
                              'Searching for nearby air '
                              'quality sensors. Please wait...',
                              textAlign: TextAlign.center,
                              style:
                                  TextStyle(color: ColorConstants().appColor),
                            )
                          ],
                        ),
                      ),
                    );
                  }
                });
          } else {
            return Align(
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                          ColorConstants().appColor),
                    ),
                    Text(
                      'Getting place details...',
                      style: TextStyle(color: ColorConstants().appColor),
                    )
                  ],
                ));
          }
        });
  }

  void showAllLocations(var context) {
    showAllDevices = true;
    query = '';
    showResults(context);
  }

  Widget loadLocalDevices() {
    return FutureBuilder(
        future: DBHelper().getDevices(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            print(snapshot.error);
            return loadApiDevices();
          } else if (snapshot.hasData) {
            var devices = snapshot.data as List<Device>;

            if (devices.isEmpty) {
              return loadApiDevices();
            }

            return ListView.builder(
              shrinkWrap: true,
              itemCount: devices.length,
              itemBuilder: (context, index) {
                return InkWell(
                    onTap: () {
                      var device = devices[index];
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return PlaceDetailsPage(
                          device: device,
                        );
                      }));
                    },
                    child: ListTile(
                      title: Text('${devices[index].siteName}'),
                      subtitle: Text('${devices[index].locationName}'),
                      leading: Icon(
                        Icons.location_pin,
                        color: ColorConstants().appColor,
                      ),
                    ));
              },
            );
          } else {
            return Align(
                alignment: Alignment.center,
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                            ColorConstants().appColor),
                      ),
                      Text(
                        'Getting all air quality sensor locations. '
                        'Please wait...',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: ColorConstants().appColor),
                      )
                    ],
                  ),
                ));
          }
        });
  }

  RawMaterialButton showAllLocationsCustomButton(context) {
    return RawMaterialButton(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.0),
          side: BorderSide(color: ColorConstants().appColor, width: 1)),
      fillColor: Colors.transparent,
      elevation: 0,
      highlightElevation: 0,
      splashColor: Colors.black12,
      highlightColor: ColorConstants().appColor.withOpacity(0.4),
      onPressed: () {
        showAllLocations(context);
      },
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Text(
          'Show all sensor locations',
          style: TextStyle(color: ColorConstants().appColor),
        ),
      ),
    );
  }

  RawMaterialButton showMapCustomButton(context) {
    return RawMaterialButton(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.0),
          side: BorderSide(color: ColorConstants().appColor, width: 1)),
      fillColor: Colors.transparent,
      elevation: 0,
      highlightElevation: 0,
      splashColor: Colors.black12,
      highlightColor: ColorConstants().appColor.withOpacity(0.4),
      onPressed: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) {
          return MapPage();
        }));
      },
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Text(
          'Go to Map',
          style: TextStyle(color: ColorConstants().appColor),
        ),
      ),
    );
  }

  Widget loadApiDevices() {
    return FutureBuilder(
        future: DBHelper().getDevices(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Container(
              padding: const EdgeInsets.all(16.0),
              child: Text('${snapshot.error.toString()}'),
            );
          } else if (snapshot.hasData) {
            var devices = snapshot.data as List<Device>;

            if (devices.isEmpty) {
              return Align(
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Text(
                          'Sorry, couldn\'t get places. Try again later'),
                    ],
                  ));
            }

            return ListView.builder(
              shrinkWrap: true,
              itemCount: devices.length,
              itemBuilder: (context, index) {
                return InkWell(
                    onTap: () {
                      var device = devices[index];
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return PlaceDetailsPage(
                          device: device,
                        );
                      }));
                    },
                    child: ListTile(
                      title: Text('${devices[index].siteName}'),
                      subtitle: Text('${devices[index].locationName}'),
                      leading: Icon(
                        Icons.location_pin,
                        color: ColorConstants().appColor,
                      ),
                    ) //your content here
                    );
              },
            );
          } else {
            return Align(
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                          ColorConstants().appColor),
                    ),
                    Text(
                      'Getting all places. Please wait...',
                      style: TextStyle(color: ColorConstants().appColor),
                    )
                  ],
                ));
          }
        });
  }
}
