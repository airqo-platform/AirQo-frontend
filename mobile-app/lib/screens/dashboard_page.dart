import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/settings.dart';
import 'package:app/widgets/current_location_readings.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DashboardPage extends StatefulWidget {
  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  var measurementData;
  var historicalData = <HistoricalMeasurement>[];
  var forecastData = <Predict>[];

  @override
  Widget build(BuildContext context) {
    if (measurementData == null) {
      return Container(
          color: ColorConstants.appBodyColor,
          child: Center(
            child: CircularProgressIndicator(
              color: ColorConstants.appColor,
            ),
          ));
    } else {
      return Container(
          color: ColorConstants.appBodyColor,
          child: RefreshIndicator(
              onRefresh: initialize,
              color: ColorConstants.appColor,
              child: Padding(
                padding: EdgeInsets.all(10.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    // Padding(padding: const EdgeInsets.fromLTRB(5.0, 5.0, 0, 5.0),
                    //   child: Text(getGreetings(),
                    //     textAlign: TextAlign.start,
                    //     style: const TextStyle(
                    //         fontSize: 30,
                    //         fontWeight: FontWeight.bold
                    //     ),),
                    // ),

                    Expanded(
                      child: ListView(
                        shrinkWrap: true,
                        children: <Widget>[
                          Padding(
                            padding:
                                const EdgeInsets.fromLTRB(5.0, 0.0, 0.0, 0.0),
                            child: Text(
                              getGreetings(),
                              textAlign: TextAlign.start,
                              style: const TextStyle(
                                  fontSize: 30, fontWeight: FontWeight.bold),
                            ),
                          ),
                          CurrentLocationCard(
                              measurementData: measurementData,
                              historicalData: historicalData,
                              forecastData: forecastData),
                        ],
                      ),
                    ),
                  ],
                ),
              )));
    }
  }

  Future<void> getDashBoardSiteMeasurements(String siteId) async {
    try {
      await DBHelper().getSite(siteId).then((site) => {
            if (site != null && mounted)
              {
                DBHelper().getMeasurement(siteId).then((measurement) => {
                      if (measurement != null)
                        {
                          setState(() {
                            measurementData = measurement;
                          }),
                          getLocationHistoricalMeasurements(measurement.site),
                          getLocationForecastMeasurements(measurement.site)
                        }
                      else
                        {getLocationMeasurements()}
                    }),
              }
          });
    } catch (e) {
      print('error getting data');
    }
  }

  Future<void> getLocationForecastMeasurements(Site site) async {
    try {
      await DBHelper().getForecastMeasurements(site.id).then((value) => {
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
    } finally {
      try {
        await AirqoApiClient(context).fetchForecast(site).then((value) => {
              if (value.isNotEmpty)
                {
                  if (mounted)
                    {
                      setState(() {
                        forecastData = value;
                      }),
                    },
                  DBHelper().insertForecastMeasurements(value, site.id)
                },
            });
      } catch (e) {
        print('Getting forecast data from api error: $e');
      }
    }
  }

  Future<void> getLocationHistoricalMeasurements(Site site) async {
    try {
      await AirqoApiClient(context)
          .fetchSiteHistoricalMeasurementsById(site.id)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalData = value;
                        }),
                      },
                  }
              });
    } catch (e) {
      print('Historical data is currently not available.');
    }
  }

  Future<void> getLocationMeasurements() async {
    try {
      await Settings().dashboardMeasurement().then((value) => {
            if (value != null)
              {
                if (mounted)
                  {
                    setState(() {
                      measurementData = value;
                    }),
                    getLocationHistoricalMeasurements(value.site),
                    getLocationForecastMeasurements(value.site),
                    updateCurrentLocation()
                  },
              }
            else
              {}
          });
    } catch (e) {
      print('error getting data : $e');
    }
  }

  Future<void> initialize() async {
    await getLocationMeasurements();
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  Future<void> updateCurrentLocation() async {
    try {
      var prefs = await SharedPreferences.getInstance();
      var dashboardSite = prefs.getString(PrefConstant.dashboardSite) ?? '';

      if (dashboardSite == '') {
        await LocationApi().getCurrentLocationReadings().then((value) => {
              if (value != null)
                {
                  prefs.setStringList(PrefConstant.lastKnownLocation,
                      ['${value.site.getUserLocation()}', '${value.site.id}']),
                  if (mounted)
                    {
                      setState(() {
                        measurementData = value;
                      }),
                      getLocationHistoricalMeasurements(value.site),
                      getLocationForecastMeasurements(value.site),
                    }
                },
            });
      }
    } catch (e) {}
  }

  Future<void> updateLocationMeasurements() async {
    var prefs = await SharedPreferences.getInstance();
    var dashboardMeasurement =
        prefs.getString(PrefConstant.dashboardSite) ?? '';
    if (dashboardMeasurement != '') {}
    try {
      await Settings().dashboardMeasurement().then((value) => {
            if (value != null)
              {
                if (mounted)
                  {
                    setState(() {
                      measurementData = value;
                    }),
                    getLocationHistoricalMeasurements(value.site),
                    getLocationForecastMeasurements(value.site),
                  },
              }
          });
    } catch (e) {
      print('error getting data');
    }
  }
}
