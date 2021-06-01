import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/place.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/distance.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

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
    final base = ThemeData.light();
    return base.copyWith(
      primaryColor: appColor,

      // textTheme: base.textTheme.apply(
      //   bodyColor: Colors.pink,
      //   displayColor: Colors.white,
      // ),

      visualDensity: VisualDensity.adaptivePlatformDensity,
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

                return ListView.builder(
                  itemBuilder: (context, index) => ListTile(
                    title: Text((results[index]).description,
                      style: const TextStyle(
                          fontSize: 12
                      ),
                    ),
                    leading: const Icon(
                      Icons.history,
                      color: appColor,
                    ),
                    trailing: GestureDetector(
                      onTap: (){
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
                    child: const Text('Type your location'),
                  )
              );
            },
          );
        }

        if (snapshot.hasError) {
          return Container(
            padding: const EdgeInsets.all(16.0),
            child: Text(
                '${snapshot.error.toString().replaceAll('Exception: ', '')}'),
          );
        } else if (snapshot.hasData) {
          // print(snapshot.data);

          var results = snapshot.data as List<Suggestion>;

          return ListView.builder(
            itemBuilder: (context, index) => ListTile(
              title: Text((results[index]).description,
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
                  const CircularProgressIndicator(),
                  const Text('Loading...')
                ],
              )
          ),
          );
        }
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    
    if(showAllDevices){
      return loadLocalDevices();
    }

    if (query == '') {
      return Align(
          alignment: Alignment.topCenter,
          child: Container(
            padding: const EdgeInsets.all(16.0),
            child: const Text('Type your location'),
          )
      );
    }

    print(searchPlaceId);

    if (searchPlaceId == '') {
      return Container(
        padding: const EdgeInsets.all(16.0),
        child: const Text('Failed to get location'),
      );
    }

    print('Search ID 2 $searchPlaceId');
    return FutureBuilder(
        future: googleApiClient.getPlaceDetailFromId(searchPlaceId),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Container(
              padding: const EdgeInsets.all(16.0),
              child: Text('${snapshot.error.toString()}'),
            );
          }
          else if (snapshot.hasData) {
            var place = snapshot.data as Place;

            return FutureBuilder(
                future: AirqoApiClient(context)
                    .getDevicesByCoordinates(
                    place.geometry.location.lat, place.geometry.location.lng),
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    return Container(
                      padding: const EdgeInsets.all(16.0),
                      child: Text('${snapshot.error.toString()}'),
                    );
                  }
                  else if (snapshot.hasData) {

                    var devices = snapshot.data as List<Device>;

                    if(devices.isEmpty){
                      return Align(
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text('Sorry, we dont have any sensors close to $query',
                              textAlign: TextAlign.center,),
                              ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                      primary: appColor,
                                      textStyle: const TextStyle(
                                          color: Colors.white
                                      )
                                  ),
                                  onPressed:() {
                                    showAllLocations(context);
                                  },
                                  child:
                                  const Text('Show all available sensor locations'))
                            ],
                          )
                      );
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
                              // leading: const Icon(
                              //   Icons.location_pin,
                              //   color: appColor,
                              // ),
                              trailing: Text('${kmToMeters(devices[index].distance)} meters'),
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
                            const CircularProgressIndicator(),
                            const Text('Searching for nearby sensors. Please wait...')
                          ],
                        )
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
                    const CircularProgressIndicator(),
                    const Text('Getting location details...')
                  ],
                )
            );
          }
        });
  }

  void showAllLocations(var context) {
    print('am pressed');
    showAllDevices = true;
    query = '';
    showResults(context);
  }

  Widget loadLocalDevices() {
  
    return FutureBuilder(
          future: DBHelper().getDevices(),
          builder: (context, snapshot) {
            if (snapshot.hasError) {
              return loadApiDevices();
            } 
            else if (snapshot.hasData) {
              var devices = snapshot.data as List<Device>;

              if(devices.isEmpty){
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
                        leading: const Icon(
                          Icons.location_pin,
                          color: appColor,
                        ),
                      )
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
                      const CircularProgressIndicator(),
                      const Text('Getting all locations. Please wait...')
                    ],
                  )
              );
            }
          });

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
          }

          else if (snapshot.hasData) {
            var devices = snapshot.data as List<Device>;

            if(devices.isEmpty){
              return Align(
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Text('Sorry, coundnt get locations. Try again later'),
                    ],
                  )
              );
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
                      leading: const Icon(
                        Icons.location_pin,
                        color: appColor,
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
                    const CircularProgressIndicator(),
                    const Text('Getting all locations. Please wait...')
                  ],
                )
            );
          }
        });

  }
// @override
// PreferredSizeWidget buildBottom(BuildContext context) {
//
//   return PreferredSize(
//     preferredSize: const Size.fromHeight(40.0),
//     child: Container(
//
//       padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
//       decoration: const BoxDecoration(
//         color: Colors.white,
//         // gradient: LinearGradient(
//         //   colors: [Colors.blue, Colors.pink],
//         // ),
//       ),
//       child: Row(
//         mainAxisAlignment: MainAxisAlignment.spaceEvenly,
//         children: [
//           SingleChildScrollView(
//               scrollDirection: Axis.horizontal,
//               child: Container(
//                 width: 1000,
//                 padding: EdgeInsets.all(8),
//                 child: ListView(
//                   scrollDirection: Axis.horizontal,
//                   children: [
//                     ElevatedButton(
//                       style: ElevatedButton.styleFrom(
//                           primary: appColor
//                       ),
//                       onPressed: () {
//
//                       },
//                       child: const Text('Places'),
//                     ),
//                     ElevatedButton(
//                       style: ElevatedButton.styleFrom(
//                           primary: appColor
//                       ),
//                       onPressed: () {
//
//                       },
//                       child: const Text('News'),
//                     ),
//                   ],
//                 ),
//               )
//           ),
//
//         ],
//       ),
//     ),
//   );
//
// }
}
