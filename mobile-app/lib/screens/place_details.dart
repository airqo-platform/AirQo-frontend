import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/expanding_action_button.dart';
import 'package:app/widgets/forecast_chart.dart';
import 'package:app/widgets/hourly_chart.dart';
import 'package:app/widgets/pollutant_card.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'help_page.dart';

class PlaceDetailsPage extends StatefulWidget {
  final Device device;

  PlaceDetailsPage({Key? key, required this.device}) : super(key: key);

  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState(device);
}

class _PlaceDetailsPageState extends State<PlaceDetailsPage> {
  bool isFavourite = false;

  var measurementData;
  var historicalData = <HistoricalMeasurement>[];
  var forecastData = <Predict>[];
  var response = '';
  bool _showMenuButton = true;
  final ScrollController _scrollCtrl = ScrollController();
  var historicalResponse = '';
  var forecastResponse = '';
  var dbHelper = DBHelper();
  var forecastDate =
      DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now().toUtc());

  String titleText = '';

  Device device;

  _PlaceDetailsPageState(this.device);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          appName,
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
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
              child: ListView(
                controller: _scrollCtrl,
                padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
                children: <Widget>[
                  // card section
                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
                    child: cardSection(measurementData),
                  ),

                  // Pollutants
                  PollutantCard(measurementData),

                  // historicalData
                  historicalData != null && historicalData.isNotEmpty
                      ? historicalDataSection(historicalData)
                      : historicalResponse != ''
                          ? Card(
                              elevation: 20,
                              child: Padding(
                                padding: const EdgeInsets.all(5.0),
                                child: Center(
                                  child: Text(
                                    historicalResponse,
                                    style: TextStyle(
                                        color: ColorConstants().appColor),
                                  ),
                                ),
                              ),
                            )
                          : Center(
                              child: Container(
                              padding: const EdgeInsets.all(16.0),
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    ColorConstants().appColor),
                              ),
                            )),

                  // Forecast Data
                  forecastData != null && forecastData.isNotEmpty
                      ? forecastDataSection(forecastData)
                      : forecastResponse != ''
                          ? Card(
                              elevation: 20,
                              child: Padding(
                                padding: const EdgeInsets.all(5.0),
                                child: Center(
                                  child: Text(forecastResponse,
                                      style: TextStyle(
                                          color: ColorConstants().appColor)),
                                ),
                              ),
                            )
                          : Center(
                              child: Container(
                              padding: const EdgeInsets.all(16.0),
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    ColorConstants().appColor),
                              ),
                            )),
                  Container(
                      padding: const EdgeInsets.fromLTRB(0, 0, 0, 50),
                      constraints: const BoxConstraints.expand(height: 300.0),
                      child: mapSection(measurementData)),

                  // LocationBarChart(),
                ],
              ),
            )
          : response != ''
              ? Center(
                  child: Text(
                    response,
                    style: TextStyle(color: ColorConstants().appColor),
                  ),
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
          ? _showMenuButton
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
                            builder: (BuildContext context) => HelpPage(),
                            fullscreenDialog: true,
                          ),
                        );
                      },
                      icon: const Icon(Icons.info_outline_rounded),
                    ),
                  ],
                )
              : null
          : null,
    );
  }

  Widget cardSection(Measurement measurement) {
    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Card(
            color: ColorConstants().appColor,
            elevation: 20,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  Padding(
                      padding: const EdgeInsets.all(1.0),
                      child: Text(
                        '${device.locationName}',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                        ),
                        textAlign: TextAlign.center,
                      )),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(1.0, 3.0, 1.0, 3.0),
                    child: Text(
                      '${device.siteName}',
                      style: const TextStyle(
                        fontSize: 20,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(1.0),
                    child: Text(
                      'Air Quality '
                      '${pmToString(measurement.getPm2_5Value())}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(1.0),
                    child: Text(
                        ''
                        '${dateToString(measurement.time, true)}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: Colors.white,
                          fontWeight: FontWeight.w300,
                          fontStyle: FontStyle.italic,
                        )),
                  ),
                ],
              ),
            )));
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

  @override
  void dispose() {
    _scrollCtrl.removeListener(() {});
    super.dispose();
  }

  Widget forecastDataSection(List<Predict> measurements) {
    var forecastData = predictChartData(measurements);
    return ForecastBarChart(forecastData);
  }

  Future<void> getForecastMeasurements() async {
    await localFetchForecastData();

    try {
      await AirqoApiClient(context)
          .fetchForecast(device.latitude.toString(),
              device.longitude.toString(), forecastDate)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    setState(() {
                      forecastData = value;
                    }),
                    DBHelper().insertForecastMeasurements(value, device.name)
                  }
                else
                  {
                    setState(() {
                      forecastResponse = 'Forecast data is currently'
                          ' not available.';
                    })
                  }
              });
    } catch (e) {
      setState(() {
        forecastResponse = 'Forecast data is currently not available.';
      });
      print('Getting Forecast events error: $e');
    }
  }

  Future<void> getHistoricalMeasurements() async {
    await localFetchHistoricalData();

    try {
      await AirqoApiClient(context)
          .fetchDeviceHistoricalMeasurements(device)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    setState(() {
                      historicalData = value;
                    }),
                    DBHelper()
                        .insertDeviceHistoricalMeasurements(value, device.name)
                  }
                else
                  {
                    setState(() {
                      historicalResponse =
                          'Historical data is currently not available.';
                    })
                  }
              });
    } catch (e) {
      setState(() {
        historicalResponse = 'Historical data is currently not available.';
      });
      print('Getting device historical events error: $e');
    }
  }

  Future<void> getMeasurements() async {
    try {
      await localFetch();

      await AirqoApiClient(context)
          .fetchDeviceMeasurements(device)
          .then((value) => {
                setState(() {
                  measurementData = value;
                }),
                if (measurementData != null) {checkFavourite()}
              });
    } catch (e) {
      print('Getting device events error: $e');

      var message = 'Sorry, air quality data currently is not available';

      setState(() {
        response = message;
      });
    }
  }

  void handleScroll() async {
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.userScrollDirection == ScrollDirection.reverse) {
        hideMenuButton();
      }
      if (_scrollCtrl.position.userScrollDirection == ScrollDirection.forward) {
        showMenuButton();
      }
    });
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

  void hideMenuButton() {
    setState(() {
      _showMenuButton = false;
    });
  }

  Widget historicalDataSection(List<HistoricalMeasurement> measurements) {
    var formattedData = historicalChartData(measurements);
    // Crunching the latest data, just for you.
    // Hang tight…
    return HourlyBarChart(formattedData);
  }

  Future<void> initialize() async {
    await getMeasurements();
    await getHistoricalMeasurements();
    await getForecastMeasurements();
  }

  @override
  void initState() {
    initialize();
    handleScroll();
    super.initState();
  }

  Future<void> localFetch() async {
    try {
      await DBHelper().getMeasurement(device.name).then((value) => {
            if (value != null)
              {
                setState(() {
                  measurementData = value;
                })
              },
            if (measurementData != null) {checkFavourite()}
          });
    } on Error catch (e) {
      print('Getting device events locally error: $e');
    }
  }

  Future<void> localFetchForecastData() async {
    try {
      await DBHelper().getForecastMeasurements(device.name).then((value) => {
            if (value.isNotEmpty)
              {
                setState(() {
                  forecastData = value;
                })
              }
          });
    } on Error catch (e) {
      print('Getting forecast data locally error: $e');
    }
  }

  Future<void> localFetchHistoricalData() async {
    try {
      var measurements =
          await DBHelper().getHistoricalMeasurements(device.name);

      if (measurements.isNotEmpty) {
        setState(() {
          historicalData = measurements;
        });
      }
    } on Error catch (e) {
      print('Getting historical data locally error: $e');
    }
  }

  Widget mapSection(Measurement measurement) {
    final _markers = <String, Marker>{};

    final marker = Marker(
      markerId: MarkerId(measurement.device.toString()),
      icon: pmToMarkerPoint(measurement.getPm2_5Value()),
      position:
          LatLng((measurement.device.latitude), measurement.device.longitude),
    );
    _markers[measurement.device.toString()] = marker;

    return Padding(
        padding: const EdgeInsets.fromLTRB(0.0, 2.0, 0.0, 2.0),
        child: Card(
            elevation: 20,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
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

  void showMenuButton() {
    setState(() {
      _showMenuButton = true;
    });
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

  void updateView(Measurement measurement) {
    setState(() {
      measurementData = measurement;
    });
  }
}
