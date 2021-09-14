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

class DashboardPageV2 extends StatefulWidget {
  @override
  _DashboardPageV2State createState() => _DashboardPageV2State();
}

class _DashboardPageV2State extends State<DashboardPageV2> {
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
              child: Padding(padding: EdgeInsets.all(10.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(getGreetings(),
                    textAlign: TextAlign.start,
                    style: const TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.bold
                    ),),
                  Expanded(
                    child: ListView(
                      shrinkWrap: true,
                      children: <Widget>[
                        CurrentLocationCard(
                            measurementData: measurementData,
                            historicalData: historicalData,
                            forecastData: forecastData),
                      ],
                    ),
                  ),
                ],
              ),)

              ));
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
      // await DBHelper().getLocationMeasurement().then((value) => {
      //   if (value != null)
      //     {
      //       if (mounted)
      //         {
      //           setState(() {
      //             measurementData = value;
      //           }),
      //           getLocationHistoricalMeasurements(value.site),
      //           getLocationForecastMeasurements(value.site)
      //         },
      //     }
      // });
    } catch (e) {
      print('error getting data : $e');
    }
  }

  Future<void> initialize() async {
    await getLocationMeasurements();

    // var prefs = await SharedPreferences.getInstance();
    // var dashboardSite = prefs.getString(PrefConstant.dashboardSite) ?? '';
    //
    // if (dashboardSite == '') {
    //   var sites = prefs.getStringList(PrefConstant.favouritePlaces) ?? [];
    //   dashboardSite = sites.isEmpty ? '' : sites.first;
    // }
    //
    // if (dashboardSite != '') {
    //   await getDashBoardSiteMeasurements(dashboardSite);
    // } else {
    //   await getLocationMeasurements();
    // }
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  Future<void> updateCurrentLocation() async {
    var prefs = await SharedPreferences.getInstance();
    var dashboardSite = prefs.getString(PrefConstant.dashboardSite) ?? '';

    if (dashboardSite == '') {
      await LocationApi().getLocationMeasurement().then((value) => {
            if (value != null && mounted)
              {
                prefs.setStringList(PrefConstant.lastKnownLocation,
                    ['${value.site.userLocation}', '${value.site.id}']),
                setState(() {
                  measurementData = value;
                }),
                getLocationHistoricalMeasurements(value.site),
                getLocationForecastMeasurements(value.site),
              }
          });
      // var sites = prefs.getStringList(PrefConstant.favouritePlaces) ?? [];
      // dashboardSite = sites.isEmpty ? '' : sites.first;
      // await getDashBoardSiteMeasurements(dashboardSite);
    }

    // if (dashboardSite == '') {
    //
    // } else {
    //   await getLocationMeasurements();
    // }
  }

  Future<void> updateLocationMeasurements() async {
    var prefs = await SharedPreferences.getInstance();
    var dashboardMeasurement =
        prefs.getString(PrefConstant.dashboardMeasurement) ?? '';
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
      // await DBHelper().getLocationMeasurement().then((value) => {
      //   if (value != null)
      //     {
      //       if (mounted)
      //         {
      //           setState(() {
      //             measurementData = value;
      //           }),
      //           getLocationHistoricalMeasurements(value.site),
      //           getLocationForecastMeasurements(value.site)
      //         },
      //     }
      // });
    } catch (e) {
      print('error getting data');
    }
  }
}

// Widget builds(BuildContext context) {
//   return Container(
//       child: Padding(
//           padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
//           child: hasFavPlaces
//               ? results.isEmpty
//               ? error == ''
//               ? Align(
//             alignment: Alignment.center,
//             child: Padding(
//               padding: const EdgeInsets.all(8),
//               child: Column(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 crossAxisAlignment: CrossAxisAlignment.center,
//                 children: [
//                   CircularProgressIndicator(
//                     valueColor: AlwaysStoppedAnimation<Color>(
//                         ColorConstants.appColor),
//                   ),
//                   Text(
//                     'Collecting information about your places'
//                         ' Please wait...',
//                     textAlign: TextAlign.center,
//                     style: TextStyle(
//                         color: ColorConstants.appColor),
//                   )
//                 ],
//               ),
//             ),
//           )
//               : Align(
//             alignment: Alignment.center,
//             child: Padding(
//               padding: const EdgeInsets.all(8),
//               child: Column(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 crossAxisAlignment: CrossAxisAlignment.center,
//                 children: [
//                   Text(
//                     '$error',
//                     textAlign: TextAlign.center,
//                     style: TextStyle(
//                         color: ColorConstants.appColor),
//                   ),
//                   reloadButton()
//                 ],
//               ),
//             ),
//           )
//               : RefreshIndicator(
//             onRefresh: initialize,
//             color: ColorConstants.appColor,
//             child: ListView.builder(
//               itemBuilder: (context, index) => InkWell(
//                 onTap: () async {
//                   try {
//                     var site = results[index].site;
//
//                     await Navigator.push(context,
//                         MaterialPageRoute(builder: (context) {
//                           return PlaceDetailsPage(site: site);
//                         })).then((value) => setState(() {}));
//                   } catch (e) {
//                     print(e);
//                     await showSnackBar(
//                         context,
//                         'Information not available.'
//                             ' Try again later');
//                   }
//                 },
//                 child: AirQualityCard(data: results[index]),
//               ),
//               itemCount: results.length,
//             ),
//           )
//               : Container(
//             padding: const EdgeInsets.all(16.0),
//             child: Column(
//               mainAxisAlignment: MainAxisAlignment.center,
//               crossAxisAlignment: CrossAxisAlignment.center,
//               children: [
//                 Text(
//                   'You haven\'t added any locations you care about '
//                       'to MyPlaces yet, click the search icon '
//                       'or use the map to add them to your list',
//                   softWrap: true,
//                   textAlign: TextAlign.center,
//                   style: TextStyle(
//                     color: ColorConstants.appColor,
//                   ),
//                 ),
//                 reloadButton()
//               ],
//             ),
//           )));
// }
