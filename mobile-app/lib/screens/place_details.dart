import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/hourly.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/date.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:app/utils/ui/share.dart';
import 'package:app/widgets/forecast_chart.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:app/widgets/expanding_action_button.dart';
import 'package:app/widgets/historical_chart.dart';
import 'package:app/widgets/hourly_chart.dart';
import 'package:app/widgets/pollutantContainer.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:flutter/foundation.dart';

class PlaceDetailsPage extends StatefulWidget {
  PlaceDetailsPage({Key? key, required this.device}) : super(key: key);

  final Device device;

  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState(device);
}

class _PlaceDetailsPageState extends State<PlaceDetailsPage> {
  _PlaceDetailsPageState(this.device);

  bool isFavourite = false;
  var locationData;
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
    getDeviceDetails();
    getMeasurements();
    super.initState();
  }

  Future<void> checkFavourite() async {
    if (locationData != null) {
      var isFav = await DBHelper()
          .checkFavouritePlace(locationData.device.deviceNumber);

      setState(() {
        isFavourite = isFav;
      });
    }
  }

  Future<void> updatePlace() async {
    if (isFavourite) {
      await DBHelper().updateFavouritePlace(locationData.device, true);
    }
  }

  Future<void> updateFavouritePlace() async {
    var place;
    if (isFavourite) {
      place = await DBHelper()
          .updateFavouritePlace(locationData.device, false);
    } else {
      place = await DBHelper()
          .updateFavouritePlace(locationData.device, true);
    }

    setState(() {
      locationData.device = place;
      isFavourite = locationData.device.favourite;
    });

    if (isFavourite) {
      await showSnackBarGoToMyPlaces(
          context,
          '${locationData.device.siteName} '
          'is added to your places');
    } else {
      await showSnackBar2(
          context,
          '${locationData.device.siteName} '
          'is removed from your places');
    }
  }

  Future<void> getMeasurements() async {
    await localFetch();

    try {
      var measurement =
          await AirqoApiClient(context).fetchDeviceMeasurements(device);

      setState(() {
        locationData = measurement;
      });

      if (locationData != null) {
        await checkFavourite();
        await updatePlace();
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
      var measurements = await DBHelper().getMeasurement(device.channelID);

      if (measurements != null) {
        setState(() {
          locationData = measurements;
        });

        if (locationData != null) {
          await checkFavourite();
        }
      }
    } on Error catch (e) {
      print('Getting device events locally error: $e');
    }
  }

  Future<void> getDeviceDetails() async {
    try {
      var deviceDetails = await DBHelper().getDevice(device.channelID);

      print(deviceDetails);
      if (deviceDetails != null) {
        setState(() {
          device = deviceDetails;
        });
      }
    } on Error catch (e) {
      print('Getting device details locally error: $e');
    }
  }

  void updateView(Measurement measurement) {
    setState(() {
      locationData = measurement;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(appName),
        actions: [
          if (isFavourite)
          IconButton(
            icon: const Icon(
              Icons.edit_outlined,
            ),
            onPressed: () {
              updateTitleDialog(device);;
            },
          ),
        ],
      ),
      body: locationData != null
          ? Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage(pmToImage(locationData.pm2_5.value)),
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
                                if (isFavourite) {
                                  print('editing');
                                  setState(() {
                                    titleText = '';
                                  });
                                  updateTitleDialog(device);
                                }
                              },
                          child: RichText(
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            maxLines: 10,
                            text: TextSpan(
                              style: const TextStyle(
                                fontSize: 20,
                                color: appColor,
                                fontWeight: FontWeight.bold,
                              ),
                              text: (isFavourite && device.nickName != null)
                                  ? '${device.nickName} '
                                  : '${device.siteName}',
                              children: <TextSpan>[
                                // if (isFavourite)
                                //   TextSpan(
                                //     text: String.fromCharCode(0xe169),
                                //     style: const TextStyle(
                                //       fontSize: 15,
                                //       fontFamily: 'MaterialIcons',
                                //       color: appColor,
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
                          if (isFavourite) {
                            print('editing');
                            setState(() {
                              titleText = '';
                            });
                            updateTitleDialog(device);
                          }
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
                                style: const TextStyle(
                                  fontSize: 15,
                                  color: appColor,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                  ),

                  // card section
                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                    child: cardSection(locationData),
                  ),

                  // Pollutants
                  PollutantsContainer(locationData),

                  // Historical Data
                  FutureBuilder(
                      future: AirqoApiClient(context)
                          .fetchHourlyMeasurements(device.channelID),
                      builder: (context, snapshot) {
                        if (snapshot.hasData) {
                          var results = snapshot.data as List<Hourly>;

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

                          var formattedData = hourlyChartData(results);

                          return HourlyBarChart(formattedData);
                        } else {
                          return Center(
                              child: Container(
                            padding: const EdgeInsets.all(16.0),
                            child: const CircularProgressIndicator(
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(appColor),
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
                            child: const CircularProgressIndicator(
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(appColor),
                            ),
                          ));
                        }
                      }),

                  // Map
                  Container(
                      padding: const EdgeInsets.fromLTRB(0, 0, 0, 50),
                      constraints: const BoxConstraints.expand(height: 300.0),
                      child: mapSection(locationData)),

                  // LocationBarChart(),
                ],
              ),
            )
          : response != null
              ? Center(
                  child: Text(response),
                )
              : const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(appColor),
                  ),
                ),
      floatingActionButton: locationData != null
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
                    shareMeasurement(locationData);
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
      markerId: MarkerId(measurement.deviceNumber.toString()),
      icon: pmToMarkerPoint(measurement.pm2_5.value),
      position: LatLng((measurement.device.latitude),
          measurement.device.longitude),
    );
    _markers[measurement.deviceNumber.toString()] = marker;

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
            target: LatLng(measurement.device.latitude,
                measurement.device.longitude),
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
                        color: pmToColor(measurement.pm2_5.value),
                        border: Border.all(
                          color: pmToColor(measurement.pm2_5.value),
                        ),
                        borderRadius:
                            const BorderRadius.all(Radius.circular(10))),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
                          child: Image.asset(
                            pmToEmoji(measurement.pm2_5.value),
                            height: 40,
                            width: 40,
                          ),
                        ),
                        Text(
                          measurement.pm2_5.value.toString(),
                          style: TextStyle(
                            color: pmTextColor(measurement.pm2_5.value),
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                        Text(
                          pmToString(measurement.pm2_5.value),
                          textAlign: TextAlign.center,
                          softWrap: true,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: pmTextColor(measurement.pm2_5.value),
                          ),
                        ),
                      ],
                    )),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 5, 0, 0),
                child: Text('Last updated : ${dateToString(locationData.time)}',
                    style: const TextStyle(
                      fontSize: 11,
                      color: appColor,
                      fontWeight: FontWeight.w300,
                      fontStyle: FontStyle.italic,
                    )),
              ),
            ],
          ),
        )));
  }

  Widget airqoLogo() {
    return Center(
        child: Image.asset(
      'assets/icon/airqo_logo.png',
      height: 50,
      width: 50,
    ));
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
                    await DBHelper()
                        .renameFavouritePlace(device, titleText)
                        .then((value) => {getDeviceDetails()});
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
