import 'package:app/constants/app_constants.dart';
import 'package:app/models/place.dart';
import 'package:app/models/site.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/distance.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import 'map_page.dart';

class LocationSearch extends SearchDelegate<Suggestion> {
  SearchApi searchApiClient = SearchApi('');

  String _searchPlaceId = '';

  bool _showAllSites = false;

  var searchHistory = <Suggestion>[];

  LocationSearch() {
    searchApiClient = SearchApi(const Uuid().v4());
  }

  String get searchPlaceId => _searchPlaceId;

  set searchPlaceId(String value) {
    _searchPlaceId = value;
  }

  bool get showAllSites => _showAllSites;

  set showAllSites(bool value) {
    _showAllSites = value;
  }

  @override
  ThemeData appBarTheme(BuildContext context) {
    final theme = Theme.of(context);
    return theme.copyWith(
      primaryColor: Colors.grey[50],
    );
  }

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        tooltip: 'Clear',
        icon: Icon(
          Icons.clear,
          color: ColorConstants.appColor,
        ),
        onPressed: () {
          query = '';
        },
      ),
      // IconButton(
      //   tooltip: 'Map',
      //   icon: Image.asset(
      //     'assets/images/world-map.png',
      //     height: 50,
      //     width: 50,
      //   ),
      //   onPressed: () {
      //     Navigator.push(context, MaterialPageRoute(builder: (context) {
      //       return MapPage();
      //     }));
      //   },
      // )
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      tooltip: 'Back',
      icon: Icon(
        Icons.arrow_back,
        color: ColorConstants.appColor,
      ),
      onPressed: () {
        close(context, Suggestion(description: '', placeId: ''));
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    if (showAllSites) {
      return loadLocalSites(context);
    }

    if (query == '') {
      return Align(
          alignment: Alignment.topCenter,
          child: Container(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Search a place',
              style: TextStyle(color: ColorConstants.appColor),
            ),
          ));
    }

    if (searchPlaceId == '') {
      return Align(
          alignment: Alignment.topCenter,
          child: Container(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Failed to locate $query, consider using a different search term',
              textAlign: TextAlign.center,
              style: TextStyle(color: ColorConstants.appColor),
            ),
          ));
    }

    return FutureBuilder(
        future: searchApiClient.getPlaceDetails(searchPlaceId),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            print('${snapshot.error.toString()}');
            return Container(
              padding: const EdgeInsets.all(16.0),
              child: const Text('Cannot full fill your request now, check your '
                  'internet connection or try again later'),
            );
          } else if (snapshot.hasData) {
            var place = snapshot.data as Place;

            return FutureBuilder(
                future: AirqoApiClient(context).getSitesByCoordinates(
                    place.geometry.location.lat, place.geometry.location.lng),
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    print('${snapshot.error.toString()}');
                    return Container(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Cannot full fill your request now',
                        style: TextStyle(color: ColorConstants.appColor),
                      ),
                    );
                  } else if (snapshot.hasData) {
                    var sites = snapshot.data as List<Site>;

                    if (sites.isEmpty) {
                      return Align(
                          alignment: Alignment.center,
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Text(
                                  'Sorry, air quality readings for'
                                      ' "$query" are not available.'
                                      '\n What do you prefer ??',
                                  textAlign: TextAlign.center,
                                  style:
                                      TextStyle(color: ColorConstants.appColor),
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
                            'Here are the locations we recommend',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: ColorConstants.appColor),
                          ),
                        ),
                        Expanded(
                            child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: sites.length,
                          itemBuilder: (context, index) {
                            return InkWell(
                                onTap: () {
                                  var site = sites[index];
                                  Navigator.push(context,
                                      MaterialPageRoute(builder: (context) {
                                    return PlaceDetailsPage(
                                      site: site,
                                    );
                                  }));
                                },
                                child: ListTile(
                                  title: Text('${sites[index].getName()}',
                                      style: TextStyle(
                                        fontSize: 17,
                                        color: ColorConstants.appColor,
                                        fontWeight: FontWeight.bold,
                                      )),
                                  subtitle:
                                      Text('${sites[index].getLocation()}',
                                          style: TextStyle(
                                            fontSize: 15,
                                            color: ColorConstants.appColor,
                                          )),
                                  // leading: const Icon(
                                  //   Icons.location_pin,
                                  //   color: ColorConstants.appColor,
                                  // ),
                                  trailing: Text(
                                    '${toDistance(sites[index].distance)}',
                                    style: TextStyle(
                                        color: ColorConstants.appColor),
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
                                  ColorConstants.appColor),
                            ),
                            Text(
                              'Crunching location readings, hang tight...',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: ColorConstants.appColor),
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
                          ColorConstants.appColor),
                    ),
                    Text(
                      'Crunching location readings, hang tight...',
                      style: TextStyle(color: ColorConstants.appColor),
                    )
                  ],
                ));
          }
        });
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return FutureBuilder(
      future: query == '' ? null : searchApiClient.fetchSuggestions(query),
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
                          style: TextStyle(color: ColorConstants.appColor),
                        ),
                      ));
                }

                return ListView.builder(
                  itemBuilder: (context, index) => ListTile(
                    title: Text(
                      (results[index]).description,
                      style: TextStyle(
                          fontSize: 12, color: ColorConstants.appColor),
                    ),
                    leading: Icon(
                      Icons.history,
                      color: ColorConstants.appColor,
                    ),
                    trailing: GestureDetector(
                      onTap: () {
                        DBHelper()
                            .deleteSearchHistory(results[index])
                            .then((value) => {query = ''});
                      },
                      child: Icon(
                        Icons.delete_outlined,
                        color: ColorConstants.red,
                      ),
                    ),
                    onTap: () {
                      query = (results[index]).description;
                      showAllSites = false;
                      searchPlaceId = (results[index]).placeId;
                      showResults(context);
                      // navigateToPlace(context, results[index]);
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
                      style: TextStyle(color: ColorConstants.appColor),
                    ),
                  ));
            },
          );
        }

        if (snapshot.hasError) {
          return Container(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Could not load suggestions. Try again later',
              style: TextStyle(color: ColorConstants.appColor),
            ),
          );
        } else if (snapshot.hasData) {
          // print(snapshot.data);

          var results = snapshot.data as List<Suggestion>;

          return ListView.builder(
            itemBuilder: (context, index) => ListTile(
              title: Text((results[index]).description,
                  style: TextStyle(color: ColorConstants.appColor)),
              onTap: () {
                query = (results[index]).description;
                showAllSites = false;
                searchPlaceId = (results[index]).placeId;
                // DBHelper().insertSearchHistory(results[index]);
                showResults(context);
                // navigateToPlace(context, results[index]);
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
                          ColorConstants.appColor),
                    ),
                  ],
                )),
          );
        }
      },
    );
  }

  Widget loadApiSites(context) {
    return FutureBuilder(
        future: AirqoApiClient(context).fetchSites(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            print('${snapshot.error.toString()}');
            return Container(
              padding: const EdgeInsets.all(16.0),
              child: const Text('Your request could not be fulfilled, '
                  'try again later'),
            );
          } else if (snapshot.hasData) {
            var sites = snapshot.data as List<Site>
              ..sort((siteA, siteB) {
                return siteA.getName().compareTo(siteB.getName().toLowerCase());
              });

            if (sites.isEmpty) {
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
              itemCount: sites.length,
              itemBuilder: (context, index) {
                return InkWell(
                    onTap: () {
                      var site = sites[index];
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return PlaceDetailsPage(
                          site: site,
                        );
                      }));
                    },
                    child: ListTile(
                      title: Text('${sites[index].getName()}',
                          style: TextStyle(
                            fontSize: 17,
                            color: ColorConstants.appColor,
                            fontWeight: FontWeight.bold,
                          )),
                      subtitle: Text('${sites[index].getLocation()}',
                          style: TextStyle(
                            fontSize: 14,
                            color: ColorConstants.appColor,
                          )),
                      leading: Icon(
                        Icons.location_pin,
                        color: ColorConstants.appColor,
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
                          ColorConstants.appColor),
                    ),
                    Text(
                      'Crunching location readings, hang tight...',
                      style: TextStyle(color: ColorConstants.appColor),
                    )
                  ],
                ));
          }
        });
  }

  Widget loadLocalSites(context) {
    return FutureBuilder(
        future: DBHelper().getSites(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            print(snapshot.error);
            return loadApiSites(context);
          } else if (snapshot.hasData) {
            var sites = snapshot.data as List<Site>
              ..sort((siteA, siteB) {
                return siteA.getName().compareTo(siteB.getName().toLowerCase());
              });

            if (sites.isEmpty) {
              return loadApiSites(context);
            }

            return ListView.builder(
              shrinkWrap: true,
              itemCount: sites.length,
              itemBuilder: (context, index) {
                return InkWell(
                    onTap: () {
                      var site = sites[index];
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return PlaceDetailsPage(
                          site: site,
                        );
                      }));
                    },
                    child: ListTile(
                      title: Text('${sites[index].getName()}',
                          style: TextStyle(
                            fontSize: 17,
                            color: ColorConstants.appColor,
                            fontWeight: FontWeight.bold,
                          )),
                      subtitle: Text('${sites[index].getLocation()}',
                          style: TextStyle(
                            fontSize: 14,
                            color: ColorConstants.appColor,
                          )),
                      leading: Icon(
                        Icons.location_pin,
                        color: ColorConstants.appColor,
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
                            ColorConstants.appColor),
                      ),
                      Text(
                        'Crunching location readings, hang tight...',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: ColorConstants.appColor),
                      )
                    ],
                  ),
                ));
          }
        });
  }

  Future<void> navigateToPlace(context, Suggestion suggestion) async {
    try {
      if (query == '' || searchPlaceId == '') {
        showResults(context);
      }

      await searchApiClient.getPlaceDetails(searchPlaceId).then((place) => {
            LocationApi()
                .getNearestSite(
                    place.geometry.location.lat, place.geometry.location.lng)
                .then((nearestSite) => {
                      if (nearestSite != null)
                        {
                          nearestSite.userLocation = place.name,
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return PlaceDetailsPage(
                              site: nearestSite,
                            );
                          }))
                        }
                      else
                        {showResults(context)}
                    }),
          });
    } catch (e) {
      print(e);
      showResults(context);
    }
  }

  void showAllLocations(var context) {
    showAllSites = true;
    query = '';
    showResults(context);
  }

  RawMaterialButton showAllLocationsCustomButton(context) {
    return RawMaterialButton(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.0),
          side: BorderSide(color: ColorConstants.appColor, width: 1)),
      fillColor: ColorConstants.appColor,
      elevation: 0,
      highlightElevation: 0,
      splashColor: Colors.black12,
      highlightColor: ColorConstants.appColor.withOpacity(0.4),
      onPressed: () {
        showAllLocations(context);
      },
      child: const Padding(
        padding: EdgeInsets.all(10.0),
        child: Text(
          'Show me all your air quality stations',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  RawMaterialButton showMapCustomButton(context) {
    return RawMaterialButton(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4.0),
          side: BorderSide(color: ColorConstants.appColor, width: 1)),
      fillColor: ColorConstants.appColor,
      elevation: 0,
      highlightElevation: 0,
      splashColor: Colors.black12,
      highlightColor: ColorConstants.appColor.withOpacity(0.4),
      onPressed: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) {
          return MapPage();
        }));
      },
      child: const Padding(
        padding: EdgeInsets.all(10.0),
        child: Text(
          'Take me to the map',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}
