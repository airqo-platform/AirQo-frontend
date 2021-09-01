import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/expanding_action_button.dart';
import 'package:app/widgets/measurements_chart.dart';
import 'package:app/widgets/pollutants_container.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'help_page.dart';

class PlaceDetailsPage extends StatefulWidget {
  final Site site;

  PlaceDetailsPage({Key? key, required this.site}) : super(key: key);

  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState(site);
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

  Site site;

  _PlaceDetailsPageState(this.site);

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
          //     updateTitleDialog(site);
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
                  PollutantsSection(measurementData),

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
                            builder: (BuildContext context) =>
                                const HelpPage(initialIndex: 0,),
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
                        '${site.getName()}',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                        ),
                        textAlign: TextAlign.center,
                      )),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(1.0, 3.0, 1.0, 3.0),
                    child: Text(
                      '${site.district} ${site.country}',
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
        isFavourite = favourites.contains(measurementData.site.id);
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
    return MeasurementsBarChart(forecastData, '24 hour Forecast');
  }

  Future<void> getForecastMeasurements() async {
    await localFetchForecastData();

    try {
      await AirqoApiClient(context)
          .fetchForecast(
              site.latitude.toString(), site.longitude.toString(), forecastDate)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    setState(() {
                      forecastData = value;
                    }),
                    dbHelper.insertForecastMeasurements(value, site.id)
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
          .fetchSiteHistoricalMeasurements(site)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    setState(() {
                      historicalData = value;
                    }),
                    dbHelper.insertSiteHistoricalMeasurements(value, site.id)
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
      print('Getting site historical events error: $e');
    }
  }

  Future<void> getMeasurements() async {
    try {
      await localFetch();

      await AirqoApiClient(context)
          .fetchSiteMeasurements(site)
          .then((value) => {
                setState(() {
                  measurementData = value;
                }),
                if (measurementData != null) {checkFavourite()}
              })
          .catchError((error) => {print(error)});
    } catch (e) {
      print('Getting site latest events error: $e');

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
    return MeasurementsBarChart(formattedData, '48 hour History');
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
      await dbHelper.getMeasurement(site.id).then((value) => {
            if (value != null)
              {
                setState(() {
                  measurementData = value;
                })
              },
            if (measurementData != null) {checkFavourite()}
          });
    } on Error catch (e) {
      print('Getting site events locally error: $e');
    }
  }

  Future<void> localFetchForecastData() async {
    try {
      await dbHelper.getForecastMeasurements(site.id).then((value) => {
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
      var measurements = await dbHelper.getHistoricalMeasurements(site.id);

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
      markerId: MarkerId(measurement.site.toString()),
      icon: pmToMarkerPoint(measurement.getPm2_5Value()),
      position: LatLng((measurement.site.latitude), measurement.site.longitude),
    );
    _markers[measurement.site.toString()] = marker;

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
                    measurement.site.latitude, measurement.site.longitude),
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
    var fav = await dbHelper.updateFavouritePlaces(measurementData.site);

    setState(() {
      isFavourite = fav;
    });

    if (fav) {
      await showSnackBarGoToMyPlaces(
          context,
          '${measurementData.site.getName()} '
          'is added to your places');
    } else {
      await showSnackBar2(
          context,
          '${measurementData.site.getName()} '
          'is removed from your places');
    }
  }

  Future<void> updateTitleDialog(Site site) async {
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
              decoration: InputDecoration(hintText: site.getName()),
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
                    // await dbHelper
                    //     .renameFavouritePlace(site, titleText)
                    //     .then((value) => {getSiteDetails()});
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
