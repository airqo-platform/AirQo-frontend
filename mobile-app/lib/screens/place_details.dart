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
import 'package:app/widgets/health_recommendation.dart';
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

class PlaceMenuSwitch extends StatefulWidget {
  final bool switchValue;

  final ValueChanged valueChanged;
  final PollutantLevel pollutantLevel;

  PlaceMenuSwitch(
      {required this.switchValue,
      required this.valueChanged,
      required this.pollutantLevel});

  @override
  _PlaceMenuSwitch createState() => _PlaceMenuSwitch();
}

class _PlaceDetailsPageState extends State<PlaceDetailsPage> {
  var siteAlerts = <String>[];
  bool isFavourite = false;
  bool hazardousAlerts = false;
  bool unhealthyAlerts = false;
  bool veryUnhealthyAlerts = false;
  bool sensitiveAlerts = false;

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

  Widget bottomSheetMenu() {
    return FloatingActionButton(
      backgroundColor: ColorConstants.appColor,
      onPressed: _placeMenu,
      // isExtended: true,
      child: const Icon(Icons.menu),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '${AppConfig.name}',
          style: const TextStyle(
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

                  // Recommendations
                  HealthRecommendationSection(
                    measurement: measurementData,
                  ),

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
                                        color: ColorConstants.appColor),
                                  ),
                                ),
                              ),
                            )
                          : Center(
                              child: Container(
                              padding: const EdgeInsets.all(16.0),
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    ColorConstants.appColor),
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
                                          color: ColorConstants.appColor)),
                                ),
                              ),
                            )
                          : Center(
                              child: Container(
                              padding: const EdgeInsets.all(16.0),
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    ColorConstants.appColor),
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
                    style: TextStyle(color: ColorConstants.appColor),
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
                                  ColorConstants.appColor),
                            )),
                      ),
                      Center(
                          child: Text(
                        'Loading',
                        style: TextStyle(color: ColorConstants.appColor),
                      )),
                    ],
                  ),
                ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: measurementData != null
          ? _showMenuButton
              ? bottomSheetMenu()
              : null
          : null,
    );
  }

  Widget cardSection(Measurement measurement) {
    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Card(
            color: ColorConstants.appColor,
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
                        '${dateToString(measurement.time, true)} (Local time)',
                        style: const TextStyle(
                          fontSize: 13,
                          color: Colors.white,
                          fontWeight: FontWeight.w300,
                        )),
                  ),
                ],
              ),
            )));
  }

  Future<void> checkFavourite() async {
    if (measurementData != null) {
      var prefs = await SharedPreferences.getInstance();
      var favourites = prefs.getStringList(PrefConstant.favouritePlaces) ?? [];

      if (mounted) {
        setState(() {
          isFavourite = favourites.contains(measurementData.site.id);
        });
      }
    }
  }

  Future<void> dbFetch() async {
    try {
      await localFetch();
      await localFetchHistoricalData();
      await localFetchForecastData();
    } on Error catch (e) {
      print('Getting data locally: $e');
    }
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(() {});
    super.dispose();
  }

  Widget expandableMenu() {
    return ExpandableFab(
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
                builder: (BuildContext context) => const HelpPage(
                  initialIndex: 0,
                ),
                fullscreenDialog: true,
              ),
            );
          },
          icon: const Icon(Icons.info_outline_rounded),
        ),
      ],
    );
  }

  Widget forecastDataSection(List<Predict> measurements) {
    var forecastData = predictChartData(measurements);
    return MeasurementsBarChart(forecastData, 'Forecast');
  }

  Future<void> getForecastMeasurements() async {
    try {
      await AirqoApiClient(context)
          .fetchForecast(
              site.latitude.toString(), site.longitude.toString(), forecastDate)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          forecastData = value;
                        })
                      },
                    dbHelper.insertForecastMeasurements(value, site.id)
                  }
                else
                  {
                    if (mounted)
                      {
                        setState(() {
                          forecastResponse = 'Forecast data is currently'
                              ' not available.';
                        })
                      }
                  }
              });
    } catch (e) {
      if (mounted) {
        setState(() {
          forecastResponse = 'Forecast data is currently not available.';
        });
      }
    }
  }

  Future<void> getHistoricalMeasurements() async {
    try {
      await AirqoApiClient(context)
          .fetchSiteHistoricalMeasurements(site)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalData = value;
                        }),
                        dbHelper.insertSiteHistoricalMeasurements(
                            value, site.id)
                      },
                  }
                else
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalResponse =
                              'Historical data is currently not available.';
                        })
                      }
                  }
              });
    } catch (e) {
      if (mounted) {
        setState(() {
          historicalResponse = 'Historical data is currently not available.';
        });
      }
    }
  }

  Future<void> getMeasurements() async {
    try {
      await AirqoApiClient(context)
          .fetchSiteMeasurements(site)
          .then((value) => {
                if (mounted)
                  {
                    setState(() {
                      measurementData = value;
                    })
                  },
                if (measurementData != null) {checkFavourite()}
              });
    } catch (e) {
      var message = 'Sorry, air quality data currently is not available';

      if (mounted) {
        setState(() {
          response = message;
        });
      }
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
    if (mounted) {
      setState(() {
        _showMenuButton = false;
      });
    }
  }

  Widget historicalDataSection(List<HistoricalMeasurement> measurements) {
    var formattedData = historicalChartData(measurements);
    return MeasurementsBarChart(formattedData, 'History');
  }

  Future<void> initialize() async {
    await initializeNotifications();
    await dbFetch();
    await getMeasurements();
    await getHistoricalMeasurements();
    await getForecastMeasurements();
  }

  Future<void> initializeNotifications() async {
    await SharedPreferences.getInstance().then((value) => {
          if (mounted)
            {
              setState(() {
                siteAlerts = value.getStringList(PrefConstant.siteAlerts) ?? [];
                hazardousAlerts = siteAlerts
                    .contains(site.getTopic(PollutantLevel.hazardous));
                sensitiveAlerts = siteAlerts
                    .contains(site.getTopic(PollutantLevel.sensitive));
                unhealthyAlerts = siteAlerts
                    .contains(site.getTopic(PollutantLevel.unhealthy));
                veryUnhealthyAlerts = siteAlerts
                    .contains(site.getTopic(PollutantLevel.veryUnhealthy));
              })
            }
        });
  }

  @override
  void initState() {
    initialize();
    handleScroll();
    super.initState();
  }

  bool isChecked(PollutantLevel pollutantLevel) {
    if (siteAlerts.contains(site.getTopic(pollutantLevel))) {
      return true;
    }
    return false;
  }

  Future<void> localFetch() async {
    try {
      await dbHelper.getMeasurement(site.id).then((value) => {
            if (value != null)
              {
                if (mounted)
                  {
                    setState(() {
                      measurementData = value;
                    })
                  }
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
                if (mounted)
                  {
                    setState(() {
                      forecastData = value;
                    })
                  }
              }
          });
    } on Error catch (e) {
      print('Getting forecast data locally error: $e');
    }
  }

  Future<void> localFetchHistoricalData() async {
    try {
      await dbHelper.getHistoricalMeasurements(site.id).then((measurements) => {
            if (measurements.isNotEmpty)
              {
                if (mounted)
                  {
                    setState(() {
                      historicalData = measurements;
                    })
                  }
              }
          });
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
    if (mounted) {
      setState(() {
        _showMenuButton = true;
      });
    }
  }

  void updateAlerts(dynamic pollutantLevel) async {
    await DBHelper().updateSiteAlerts(site, pollutantLevel).then((_) => {
          initializeNotifications(),
        });
  }

  Future<void> updateFavouritePlace() async {
    var fav = await dbHelper.updateFavouritePlaces(measurementData.site);

    if (mounted) {
      setState(() {
        isFavourite = fav;
      });
    }

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

  void _placeMenu() {
    showModalBottomSheet(
        context: context,
        builder: (context) {
          return Container(
              decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(20.0),
                      topRight: Radius.circular(20.0))),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0.0, 0.0, 0.0, 30.0),
                child: SingleChildScrollView(
                    child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    ListTile(
                      title: Text('${site.getName()}',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 20,
                            color: ColorConstants.appColor,
                            fontWeight: FontWeight.bold,
                          )),
                      trailing: Icon(
                        Icons.close,
                        color: ColorConstants.appColor,
                      ),
                      onTap: () {
                        Navigator.pop(context);
                      },
                    ),
                    ListTile(
                      leading: isFavourite
                          ? const Icon(
                              Icons.favorite,
                              color: Colors.red,
                            )
                          : Icon(Icons.favorite_border_outlined,
                              color: ColorConstants.appColor),
                      title: isFavourite
                          ? Text(
                              'Remove from myPlaces',
                              style: TextStyle(
                                  color: ColorConstants.appColor,
                                  fontWeight: FontWeight.w600),
                            )
                          : Text(
                              'Add to myPlaces',
                              style: TextStyle(
                                  color: ColorConstants.appColor,
                                  fontWeight: FontWeight.w600),
                            ),
                      onTap: () {
                        Navigator.pop(context);
                        updateFavouritePlace();
                      },
                    ),
                    ListTile(
                      leading: Icon(Icons.notification_important_outlined,
                          color: ColorConstants.appColor),
                      title: Text(
                        'Notify me when air quality is ;',
                        style: TextStyle(
                            color: ColorConstants.appColor,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                    ListTile(
                      leading: const Icon(Icons.notification_important_outlined,
                          color: Colors.transparent),
                      title: Text('unhealthy for sensitive groups',
                          style: TextStyle(color: ColorConstants.appColor)),
                      trailing: PlaceMenuSwitch(
                        switchValue: sensitiveAlerts,
                        valueChanged: updateAlerts,
                        pollutantLevel: PollutantLevel.sensitive,
                      ),
                    ),
                    ListTile(
                      leading: const Icon(Icons.notification_important_outlined,
                          color: Colors.transparent),
                      title: Text('unhealthy',
                          style: TextStyle(color: ColorConstants.appColor)),
                      trailing: PlaceMenuSwitch(
                        switchValue: unhealthyAlerts,
                        valueChanged: updateAlerts,
                        pollutantLevel: PollutantLevel.unhealthy,
                      ),
                    ),
                    ListTile(
                      leading: const Icon(Icons.notification_important_outlined,
                          color: Colors.transparent),
                      title: Text('very unhealthy',
                          style: TextStyle(color: ColorConstants.appColor)),
                      trailing: PlaceMenuSwitch(
                        switchValue: veryUnhealthyAlerts,
                        valueChanged: updateAlerts,
                        pollutantLevel: PollutantLevel.veryUnhealthy,
                      ),
                    ),
                    ListTile(
                      leading: const Icon(Icons.notification_important_outlined,
                          color: Colors.transparent),
                      title: Text('hazardous',
                          style: TextStyle(color: ColorConstants.appColor)),
                      trailing: PlaceMenuSwitch(
                        switchValue: hazardousAlerts,
                        valueChanged: updateAlerts,
                        pollutantLevel: PollutantLevel.hazardous,
                      ),
                    ),
                    Divider(
                      indent: 30,
                      endIndent: 30,
                      color: ColorConstants.appColor,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        IconButton(
                          onPressed: () {
                            Navigator.pop(context);
                            reportPlace(site, context);
                          },
                          icon: Icon(Icons.report_problem_outlined,
                              color: ColorConstants.appColor),
                        ),
                        IconButton(
                          onPressed: () {
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute<void>(
                                builder: (BuildContext context) =>
                                    const HelpPage(
                                  initialIndex: 0,
                                ),
                                fullscreenDialog: true,
                              ),
                            );
                          },
                          icon: Icon(Icons.info_outline,
                              color: ColorConstants.appColor),
                        ),
                        IconButton(
                          onPressed: () {
                            Navigator.pop(context);
                            shareMeasurement(measurementData);
                          },
                          icon: Icon(Icons.share_outlined,
                              color: ColorConstants.appColor),
                        ),
                      ],
                    ),
                  ],
                )),
              ));
        });
  }
}

class _PlaceMenuSwitch extends State<PlaceMenuSwitch> {
  bool _switchValue = false;

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: _switchValue,
      activeColor: ColorConstants.appColor,
      activeTrackColor: ColorConstants.appColor.withOpacity(0.6),
      inactiveThumbColor: Colors.white,
      inactiveTrackColor: Colors.black12,
      onChanged: (bool value) {
        setState(() {
          _switchValue = value;
          widget.valueChanged(widget.pollutantLevel);
        });
      },
    );
  }

  @override
  void initState() {
    _switchValue = widget.switchValue;
    super.initState();
  }
}
