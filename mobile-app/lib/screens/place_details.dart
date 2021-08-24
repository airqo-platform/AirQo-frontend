import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/expanding_action_button.dart';
import 'package:app/widgets/forecast_chart.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:app/widgets/hourly_chart.dart';
import 'package:app/widgets/pollutantContainer.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PlaceDetailsPage extends StatefulWidget {
  PlaceDetailsPage({Key? key, required this.device}) : super(key: key);

  final Device device;

  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState(device);
}

class _PlaceDetailsPageState extends State<PlaceDetailsPage> {
  _PlaceDetailsPageState(this.device);

  bool isFavourite = false;
  var measurementData;
  var response;
  var dbHelper = DBHelper();
  var startDate = DateFormat('yyyy-MM-dd').format(DateTime(
      DateTime.now().year, DateTime.now().month - 1, DateTime.now().day));
  var forecastDate = DateFormat('yyyy-MM-dd HH:mm').format(
      DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day));
  String titleText = '';
  Device device;

  @override
  void initState() {
    getMeasurements();
    super.initState();
  }

  Future<void> checkFavourite() async {
    if (measurementData != null) {
      var prefs = await SharedPreferences.getInstance();
      var favourites =
          prefs.getStringList(PrefConstants().favouritePlaces) ?? [];

      setState(() {
        isFavourite = favourites.contains(measurementData.device.name);
      });
    }
  }

  Future<void> updateFavouritePlace() async {
    var fav = await DBHelper().updateFavouritePlaces(measurementData.device);

    setState(() {
      isFavourite = fav;
    });

    if (fav) {
      await showSnackBarGoToMyPlaces(
          context,
          '${measurementData.device.siteName} '
          'is added to your places');
    } else {
      await showSnackBar2(
          context,
          '${measurementData.device.siteName} '
          'is removed from your places');
    }
  }

  Future<void> getMeasurements() async {
    await localFetch();

    try {
      var measurement =
          await AirqoApiClient(context).fetchDeviceMeasurements(device);

      setState(() {
        measurementData = measurement;
      });

      if (measurementData != null) {
        await checkFavourite();
      }
    } catch (e) {
      print('Getting device events error: $e');

      var message = 'Sorry, information is not available';

      setState(() {
        response = message;
      });
    }
  }

  Future<void> localFetch() async {
    try {
      var measurements = await DBHelper().getMeasurement(device.name);

      if (measurements != null) {
        setState(() {
          measurementData = measurements;
        });

        if (measurementData != null) {
          await checkFavourite();
        }
      }
    } on Error catch (e) {
      print('Getting device events locally error: $e');
    }
  }

  void updateView(Measurement measurement) {
    setState(() {
      measurementData = measurement;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(appName),
        actions: [
          // if (isFavourite)
          // IconButton(
          //   icon: const Icon(
          //     Icons.edit_outlined,
          //   ),
          //   onPressed: () {
          //     updateTitleDialog(device);
          //   },
          // ),
        ],
      ),
      body: measurementData != null
          ? Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage(
                      pmToImage(measurementData.pm2_5.calibratedValue)),
                  fit: BoxFit.cover,
                ),
              ),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
                children: <Widget>[
                  // Site Name
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8.0, 20.0, 8.0, 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                            child: GestureDetector(
                          onTap: () {
                            // if (isFavourite) {
                            //   print('editing');
                            //   setState(() {
                            //     titleText = '';
                            //   });
                            //   updateTitleDialog(device);
                            // }
                          },
                          child: RichText(
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            maxLines: 10,
                            text: TextSpan(
                              style: TextStyle(
                                fontSize: 20,
                                color: ColorConstants().appColor,
                                fontWeight: FontWeight.bold,
                              ),
                              text: (isFavourite && device.nickName != '')
                                  ? '${device.nickName} '
                                  : '${device.siteName}',
                              children: <TextSpan>[
                                // if (isFavourite)
                                //   TextSpan(
                                //     text: String.fromCharCode(0xe169),
                                //     style: const TextStyle(
                                //       fontSize: 15,
                                //       fontFamily: 'MaterialIcons',
                                //       color: ColorConstants().appColor,
                                //     ),
                                //   )
                              ],
                            ),
                          ),
                        )),
                      ],
                    ),
                  ),

                  // location name
                  Padding(
                      padding: const EdgeInsets.fromLTRB(8.0, 0, 8.0, 8.0),
                      child: GestureDetector(
                        onTap: () {
                          // if (isFavourite) {
                          //   print('editing');
                          //   setState(() {
                          //     titleText = '';
                          //   });
                          //   updateTitleDialog(device);
                          // }
                        },
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              child: Text(
                                '${device.locationName}',
                                overflow: TextOverflow.ellipsis,
                                textAlign: TextAlign.center,
                                maxLines: 10,
                                style: TextStyle(
                                  fontSize: 15,
                                  color: ColorConstants().appColor,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),

                  // card section
                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                    child: cardSection(measurementData),
                  ),

                  // Pollutants
                  PollutantsContainer(measurementData),

                  // Historical Data
                  FutureBuilder(
                      future: AirqoApiClient(context)
                          .fetchDeviceHistoricalMeasurements(device),
                      builder: (context, snapshot) {
                        print(snapshot);
                        if (snapshot.hasData) {
                          var results = snapshot.data as List<Measurement>;

                          if (results.isEmpty) {
                            return Center(
                              child: Container(
                                padding: const EdgeInsets.all(16.0),
                                child: const Text(
                                  'Historical data is not available...',
                                  softWrap: true,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            );
                          }

                          var formattedData = historicalChartData(results);
                          // Crunching the latest data, just for you.
                          // Hang tight…
                          print('loading chart');
                          print(results);
                          print(formattedData);
                          return HourlyBarChart(formattedData);
                        } else {
                          return Center(
                              child: Container(
                            padding: const EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  ColorConstants().appColor),
                            ),
                          ));
                        }
                      }),

                  // Forecast Data
                  FutureBuilder(
                      future: AirqoApiClient(context).fetchForecast(
                          device.latitude.toString(),
                          device.longitude.toString(),
                          forecastDate),
                      builder: (context, snapshot) {
                        if (snapshot.hasData) {
                          var results = snapshot.data as List<Predict>;

                          if (results.isEmpty) {
                            return Center(
                              child: Container(
                                padding: const EdgeInsets.all(16.0),
                                child: const Text(
                                  'Forecast data is not available...',
                                  softWrap: true,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            );
                          }

                          var forecastData = predictChartData(results);

                          return ForecastBarChart(forecastData);

                          // return SingleChildScrollView(
                          //     scrollDirection: Axis.horizontal,
                          //     child: Container(
                          //       width: 500,
                          //       height: 400,
                          //       padding: const EdgeInsets.all(8),
                          //       child: Column(
                          //         children: [
                          //           const Padding(padding: EdgeInsets.all(2),
                          //             child: Center(
                          //               child: Text('Forecast'),
                          //             ),
                          //           ),
                          //           LocationBarChart(formattedData)
                          //         ],
                          //       ),
                          //     )
                          // );

                        } else {
                          return Center(
                              child: Container(
                            padding: const EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  ColorConstants().appColor),
                            ),
                          ));
                        }
                      }),

                  // Map
                  Container(
                      padding: const EdgeInsets.fromLTRB(0, 0, 0, 50),
                      constraints: const BoxConstraints.expand(height: 300.0),
                      child: mapSection(measurementData)),

                  // LocationBarChart(),
                ],
              ),
            )
          : response != null
              ? Center(
                  child: Text(response),
                )
              : Center(
                  child: Stack(
                    children: <Widget>[
                      Center(
                        child: Container(
                            width: 100,
                            height: 100,
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  ColorConstants().appColor),
                            )),
                      ),
                      Center(
                          child: Text(
                        'Loading',
                        style: TextStyle(color: ColorConstants().appColor),
                      )),
                    ],
                  ),
                ),
      floatingActionButton: measurementData != null
          ? ExpandableFab(
              distance: 112.0,
              children: [
                ActionButton(
                  onPressed: updateFavouritePlace,
                  icon: isFavourite
                      ? const Icon(
                          Icons.favorite,
                          color: Colors.red,
                        )
                      : const Icon(
                          Icons.favorite_border_outlined,
                        ),
                ),
                ActionButton(
                  onPressed: () {
                    shareMeasurement(measurementData);
                  },
                  icon: const Icon(Icons.share_outlined),
                ),
                ActionButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                        builder: (BuildContext context) => AQI_Dialog(),
                        fullscreenDialog: true,
                      ),
                    );
                  },
                  icon: const Icon(Icons.info_outline_rounded),
                ),
              ],
            )
          : null,
    );
  }

  Widget mapSection(Measurement measurement) {
    final _markers = <String, Marker>{};

    final marker = Marker(
      markerId: MarkerId(measurement.device.toString()),
      icon: pmToMarkerPoint(measurement.pm2_5.calibratedValue),
      position:
          LatLng((measurement.device.latitude), measurement.device.longitude),
    );
    _markers[measurement.device.toString()] = marker;

    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Card(
            child: GoogleMap(
          compassEnabled: false,
          mapType: MapType.normal,
          myLocationButtonEnabled: false,
          myLocationEnabled: false,
          rotateGesturesEnabled: false,
          tiltGesturesEnabled: false,
          mapToolbarEnabled: false,
          initialCameraPosition: CameraPosition(
            target: LatLng(
                measurement.device.latitude, measurement.device.longitude),
            zoom: 13,
          ),
          markers: _markers.values.toSet(),
        )));
  }

  Widget cardSection(Measurement measurement) {
    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Card(
            child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 5, 0, 0),
                child: Container(
                    padding: const EdgeInsets.all(5.0),
                    decoration: BoxDecoration(
                        color: pmToColor(measurement.pm2_5.calibratedValue),
                        border: Border.all(
                          color: pmToColor(measurement.pm2_5.calibratedValue),
                        ),
                        borderRadius:
                            const BorderRadius.all(Radius.circular(10))),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
                          child: Image.asset(
                            pmToEmoji(measurement.pm2_5.calibratedValue),
                            height: 40,
                            width: 40,
                          ),
                        ),
                        Text(
                          measurement.pm2_5.calibratedValue.toString(),
                          style: TextStyle(
                            color:
                                pmTextColor(measurement.pm2_5.calibratedValue),
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                        Text(
                          pmToString(measurement.pm2_5.calibratedValue),
                          textAlign: TextAlign.center,
                          softWrap: true,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color:
                                pmTextColor(measurement.pm2_5.calibratedValue),
                          ),
                        ),
                      ],
                    )),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 5, 0, 0),
                child:
                    Text('Last updated : ${dateToString(measurementData.time)}',
                        style: TextStyle(
                          fontSize: 11,
                          color: ColorConstants().appColor,
                          fontWeight: FontWeight.w300,
                          fontStyle: FontStyle.italic,
                        )),
              ),
            ],
          ),
        )));
  }

  Widget headerSection(String image, String body) {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Image.asset(
              image,
              height: 40,
              width: 40,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: Text(body,
                  softWrap: true,
                  style: const TextStyle(
                    height: 1.2,
                    // letterSpacing: 1.0
                  )),
            ),
          )
        ],
      ),
    );
  }

  Future<void> updateTitleDialog(Device device) async {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Rename place'),
            content: TextField(
              onChanged: (value) {
                setState(() {
                  titleText = value;
                });
              },
              decoration: InputDecoration(hintText: device.nickName),
            ),
            actions: <Widget>[
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    primary: Colors.red,
                    textStyle: const TextStyle(color: Colors.white)),
                onPressed: () {
                  setState(() {
                    Navigator.pop(context);
                  });
                },
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    primary: Colors.green,
                    textStyle: const TextStyle(color: Colors.white)),
                onPressed: () async {
                  if (titleText != '') {
                    // await DBHelper()
                    //     .renameFavouritePlace(device, titleText)
                    //     .then((value) => {getDeviceDetails()});
                  }
                  Navigator.pop(context);
                },
                child: const Text('Save'),
              ),
            ],
          );
        });
  }
}
