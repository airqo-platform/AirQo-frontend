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
import 'package:app/widgets/forecast_chart.dart';
import 'package:app/widgets/health_recommendation.dart';
import 'package:app/widgets/measurements_chart.dart';
import 'package:app/widgets/pollutants_container.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'add_place_alert_page.dart';
import 'help_page.dart';

class PlaceDetailsPage extends StatefulWidget {
  final Measurement measurement;

  PlaceDetailsPage({Key? key, required this.measurement}) : super(key: key);

  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState(measurement);
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

  var historicalData = <HistoricalMeasurement>[];
  var forecastData = <Predict>[];

  var response = '';
  bool _showMenuButton = true;
  bool _isDashboardView = false;
  final ScrollController _scrollCtrl = ScrollController();
  var historicalResponse = '';
  var forecastResponse = '';
  var dbHelper = DBHelper();

  String titleText = '';

  Measurement measurement;

  _PlaceDetailsPageState(this.measurement);

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
        elevation: 0,
        backgroundColor: ColorConstants.appBarBgColor,
        leading: BackButton(color: ColorConstants.appColor),
        title: Text(
          '${AppConfig.name}',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: ColorConstants.appBarTitleColor,
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
      body: Container(
        color: ColorConstants.appBodyColor,
        child: ListView(
          controller: _scrollCtrl,
          padding: const EdgeInsets.fromLTRB(0, 0, 0, 0),
          children: <Widget>[
            // card section
            cardSection(measurement),

            // Pollutants
            PollutantsSection(measurement),

            const SizedBox(
              height: 10,
            ),

            // Recommendations
            HealthRecommendationSection(
              measurement: measurement,
            ),

            // if (measurement.hasWeatherData())
            //   Padding(
            //     padding: const EdgeInsets.only(left: 10, right: 10),
            //     child: WeatherSection(
            //       measurement,
            //     ),
            //   ),

            // historicalData
            if (historicalData.isNotEmpty)
              historicalDataSection(historicalData),

            // historicalData.isNotEmpty
            //     ? historicalDataSection(historicalData)
            //     : historicalResponse != ''
            //         ? Card(
            //             elevation: 20,
            //             child: Padding(
            //               padding: const EdgeInsets.all(5.0),
            //               child: Center(
            //                 child: Text(
            //                   historicalResponse,
            //                   style: TextStyle(
            //                       color: ColorConstants.appColor),
            //                 ),
            //               ),
            //             ),
            //           )
            //         : Center(
            //             child: Container(
            //             padding: const EdgeInsets.all(16.0),
            //             child: CircularProgressIndicator(
            //               valueColor: AlwaysStoppedAnimation<Color>(
            //                   ColorConstants.appColor),
            //             ),
            //           )),

            // Forecast Data

            if (forecastData.isNotEmpty) forecastDataSection(forecastData),

            // forecastData.isNotEmpty
            //     ? forecastDataSection(forecastData)
            //     : forecastResponse != ''
            //         ? Card(
            //             elevation: 20,
            //             child: Padding(
            //               padding: const EdgeInsets.all(5.0),
            //               child: Center(
            //                 child: Text(forecastResponse,
            //                     style: TextStyle(
            //                         color: ColorConstants.appColor)),
            //               ),
            //             ),
            //           )
            //         : Center(
            //             child: Container(
            //             padding: const EdgeInsets.all(16.0),
            //             child: CircularProgressIndicator(
            //               valueColor: AlwaysStoppedAnimation<Color>(
            //                   ColorConstants.appColor),
            //             ),
            //           )),
            //

            Container(
                padding: const EdgeInsets.fromLTRB(0, 0, 0, 50),
                constraints: const BoxConstraints.expand(height: 300.0),
                child: mapSection(measurement)),

            // LocationBarChart(),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: bottomSheetMenu(),
    );
  }

  Widget cardSection(Measurement measurement) {
    return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Card(
            elevation: 10,
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
                        '${measurement.site.getUserLocation()}',
                        style: TextStyle(
                          fontSize: 20,
                          color: ColorConstants.appColor,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      )),
                  if (measurement.site.getUserLocation() !=
                      measurement.site.getName())
                    Padding(
                        padding: const EdgeInsets.all(1.0),
                        child: Text(
                          '${measurement.site.getName()}',
                          style: TextStyle(
                            fontSize: 16,
                            color: ColorConstants.appColor,
                          ),
                          textAlign: TextAlign.center,
                        )),
                  if (measurement.site.getUserLocation() ==
                      measurement.site.getName())
                    Padding(
                      padding: const EdgeInsets.all(1.0),
                      child: Text(
                        '${measurement.site.getLocation()}',
                        style: TextStyle(
                          fontSize: 16,
                          color: ColorConstants.appColor,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(1.0),
                    child: Text(
                      'Air Quality '
                      '${pmToString(measurement.getPm2_5Value())}',
                      style: TextStyle(
                        fontSize: 16,
                        color: ColorConstants.appColor,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(1.0),
                    child: Text(
                        'Last updated: ${dateToString(measurement.time, true)}',
                        style: TextStyle(
                          fontSize: 13,
                          color: ColorConstants.appColor,
                          fontWeight: FontWeight.w500,
                        )),
                  ),
                ],
              ),
            )));
  }

  void checkDashboardView() async {
    var prefs = await SharedPreferences.getInstance();
    var dashboardSite = prefs.getString(PrefConstant.dashboardSite) ?? '';
    if (dashboardSite == measurement.site.id) {
      setState(() {
        _isDashboardView = true;
      });
    }
  }

  Future<void> checkFavourite() async {
    var prefs = await SharedPreferences.getInstance();
    var favourites = prefs.getStringList(PrefConstant.favouritePlaces) ?? [];

    if (!favourites.contains(measurement.site.id)) {
      await DBHelper().addFavouritePlaces(measurement.site).then((value) => {
            showSnackBar(
                context,
                '${measurement.site.getUserLocation()}'
                ' has been added to your places')
          });
    }

    if (mounted) {
      setState(() {
        isFavourite = favourites.contains(measurement.site.id);
      });
    }
  }

  Future<void> dbFetch() async {
    try {
      localFetch();
      localFetchHistoricalData();
      localFetchForecastData();
    } on Error catch (e) {
      print('Getting data locally: $e');
    }
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(() {});
    super.dispose();
  }

  Widget forecastDataSection(List<Predict> measurements) {
    var forecastData = forecastChartData(measurements);
    return ForecastBarChart(forecastData, 'Forecast');
  }

  void getForecastMeasurements() async {
    try {
      await AirqoApiClient(context)
          .fetchForecast(measurement.deviceNumber)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          forecastData = value;
                        })
                      },
                    dbHelper.insertForecastMeasurements(
                        value, measurement.site.id)
                  }
                else
                  {
                    if (mounted)
                      {
                        setState(() {
                          forecastResponse =
                              'Sorry, we could\nt retrieve the forecast';
                        })
                      }
                  }
              });
    } catch (e) {
      if (mounted) {
        setState(() {
          forecastResponse = 'Sorry, we could\nt retrieve the forecast';
        });
      }
    }
  }

  void getHistoricalMeasurements() async {
    try {
      await AirqoApiClient(context)
          .fetchSiteHistoricalMeasurements(measurement.site)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalData = value;
                        }),
                        dbHelper.insertSiteHistoricalMeasurements(
                            value, measurement.site.id)
                      },
                  }
                else
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalResponse = 'Sorry, we could\nt '
                              'retrieve historical readings.';
                        })
                      }
                  }
              });
    } catch (e) {
      if (mounted) {
        setState(() {
          historicalResponse =
              'Sorry, we could\nt retrieve historical readings';
        });
      }
    }
  }

  void getMeasurements() async {
    try {
      await AirqoApiClient(context)
          .fetchSiteMeasurements(measurement.site)
          .then((value) => {
                if (mounted)
                  {
                    setState(() {
                      measurement = value;
                    }),
                    checkFavourite()
                  },
              });
    } catch (e) {
      var message = 'Sorry, air quality data could not be retrieved.'
          '\nTry again later';

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
    return MeasurementsBarChart(measurements, 'History');
  }

  Future<void> initialize() async {
    checkDashboardView();
    // initializeNotifications();
    await dbFetch();
    getMeasurements();
    getForecastMeasurements();
    getHistoricalMeasurements();
  }

  void initializeNotifications() async {
    await SharedPreferences.getInstance().then((value) => {
          if (mounted)
            {
              setState(() {
                siteAlerts = value.getStringList(PrefConstant.siteAlerts) ?? [];
                hazardousAlerts = siteAlerts.contains(
                    measurement.site.getTopic(PollutantLevel.hazardous));
                sensitiveAlerts = siteAlerts.contains(
                    measurement.site.getTopic(PollutantLevel.sensitive));
                unhealthyAlerts = siteAlerts.contains(
                    measurement.site.getTopic(PollutantLevel.unhealthy));
                veryUnhealthyAlerts = siteAlerts.contains(
                    measurement.site.getTopic(PollutantLevel.veryUnhealthy));
              })
            }
        });
  }

  @override
  void initState() {
    super.initState();
    initialize();
    handleScroll();
  }

  bool isChecked(PollutantLevel pollutantLevel) {
    if (siteAlerts.contains(measurement.site.getTopic(pollutantLevel))) {
      return true;
    }
    return false;
  }

  void localFetch() async {
    try {
      await dbHelper.getMeasurement(measurement.site.id).then((value) => {
            if (value != null)
              {
                if (mounted)
                  {
                    setState(() {
                      measurement = value;
                    })
                  },
                checkFavourite()
              },
          });
    } on Error catch (e) {
      print('Getting site events locally error: $e');
    }
  }

  void localFetchForecastData() async {
    try {
      await dbHelper
          .getForecastMeasurements(measurement.site.id)
          .then((value) => {
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

  void localFetchHistoricalData() async {
    try {
      await dbHelper
          .getHistoricalMeasurements(measurement.site.id)
          .then((measurements) => {
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
    await DBHelper()
        .updateSiteAlerts(measurement.site, pollutantLevel)
        .then((_) => {
              initializeNotifications(),
            });
  }

  Future<void> updateDashboardView(bool value) async {
    await SharedPreferences.getInstance().then((prefs) => {
          if (value)
            {prefs.setString(PrefConstant.dashboardSite, measurement.site.id)}
          else
            {prefs.setString(PrefConstant.dashboardSite, '')}
        });

    if (mounted) {
      setState(() {
        _isDashboardView = value;
      });
    }
  }

  Future<void> updateFavouritePlace() async {
    var fav = await dbHelper.updateFavouritePlaces(measurement.site);

    if (mounted) {
      setState(() {
        isFavourite = fav;
      });
    }

    if (fav) {
      await showSnackBarGoToMyPlaces(
          context,
          '${measurement.site.getName()} '
          'is added to your places');
    } else {
      await showSnackBar(
          context,
          '${measurement.site.getName()} '
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
        backgroundColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.0),
        ),
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
                      title: Text('${measurement.site.getName()}',
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
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
                      // leading: isFavourite
                      //     ? const Icon(
                      //         Icons.favorite,
                      //         color: Colors.red,
                      //       )
                      //     : Icon(Icons.favorite_border_outlined,
                      //         color: ColorConstants.appColor),
                      trailing: isFavourite
                          ? const Icon(
                              Icons.favorite,
                              color: Colors.red,
                            )
                          : Icon(Icons.favorite_border_outlined,
                              color: ColorConstants.appColor),
                      title: isFavourite
                          ? Text(
                              'Remove from MyPlaces',
                              style: TextStyle(
                                  color: ColorConstants.appColor,
                                  fontWeight: FontWeight.w600),
                            )
                          : Text(
                              'Add to MyPlaces',
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
                      trailing: Switch(
                        value: _isDashboardView,
                        activeColor: ColorConstants.appColor,
                        activeTrackColor:
                            ColorConstants.appColor.withOpacity(0.6),
                        inactiveThumbColor: Colors.white,
                        inactiveTrackColor: Colors.black12,
                        onChanged: (bool value) {
                          setState(() {
                            _isDashboardView = value;
                            Navigator.pop(context);
                            updateDashboardView(value);
                          });
                        },
                      ),
                      title: Text(
                        'Set as default for dashboard',
                        style: TextStyle(
                            color: ColorConstants.appColor,
                            fontWeight: FontWeight.w600),
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
                            reportPlace(measurement.site, context);
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
                            shareMeasurement(measurement);
                          },
                          icon: Icon(Icons.share_outlined,
                              color: ColorConstants.appColor),
                        ),
                        IconButton(
                          onPressed: () {
                            Navigator.pop(context);
                            Navigator.push(context,
                                MaterialPageRoute(builder: (context) {
                              return AddPlaceAlertPage(site: measurement.site);
                            }));
                          },
                          icon: Icon(Icons.notifications_none_outlined,
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
