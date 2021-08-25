import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/air_quality_nav.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List<Measurement> results = [];
  bool hasFavPlaces = true;
  String error = '';

  @override
  void initState() {
    initialize();
    super.initState();
  }

  Future<void> initialize() async {
    var prefs = await SharedPreferences.getInstance();
    var favouritePlaces =
        prefs.getStringList(PrefConstants().favouritePlaces) ?? [];

    if (favouritePlaces.isEmpty) {
      setState(() {
        hasFavPlaces = false;
      });
    }

    if (favouritePlaces.isNotEmpty) {
      setState(() {
        hasFavPlaces = true;
      });

      await DBHelper().getFavouritePlaces().then((value) => {
            if (value.isNotEmpty)
              {
                setState(() {
                  results = value;
                })
              }
          });

      await AirqoApiClient(context)
          .fetchLatestDevicesMeasurements(favouritePlaces)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    setState(() {
                      results = value;
                    }),
                    DBHelper().insertLatestMeasurements(value)
                  }
                else
                  {
                    if (results.isEmpty && hasFavPlaces)
                      {
                        error = 'Sorry, we are not able to gather information'
                            ' about your places. Try again later'
                      }
                  }
              });
    }
  }

  Widget build3(BuildContext context) {
    return Container(
        child: Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
            child: hasFavPlaces
                ? FutureBuilder(
                    future: DBHelper().getFavouritePlaces(),
                    builder: (context, snapshot) {
                      if (snapshot.hasData) {
                        results = snapshot.data as List<Measurement>;

                        if (results.isEmpty) {
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
                                        ColorConstants().appColor),
                                  ),
                                  Text(
                                    'Collecting information about your places. '
                                    ' Please wait...',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: ColorConstants().appColor),
                                  )
                                ],
                              ),
                            ),
                          );
                        }

                        return RefreshIndicator(
                          onRefresh: refreshData,
                          child: ListView.builder(
                            itemBuilder: (context, index) => InkWell(
                              onTap: () async {
                                try {
                                  var device = results[index].device;

                                  await Navigator.push(context,
                                      MaterialPageRoute(builder: (context) {
                                    return PlaceDetailsPage(device: device);
                                  })).then((value) => setState(() {}));
                                } catch (e) {
                                  print(e);
                                  await showSnackBar(context,
                                      'Information not available. Try again later');
                                }
                              },
                              child: AirQualityCard(data: results[index]),
                            ),
                            itemCount: results.length,
                          ),
                        );
                      } else {
                        return Center(
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(
                                ColorConstants().appColor),
                          ),
                        );
                      }
                    })
                : Center(
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'You haven\'t added any locations you care about '
                        'to MyPlaces yet, click the search icon '
                        'or use the map to add them to your list',
                        softWrap: true,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: ColorConstants().appColor,
                        ),
                      ),
                    ),
                  )));
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Padding(
            padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
            child: hasFavPlaces
                ? results.isEmpty
                    ? error == ''
                        ? Align(
                            alignment: Alignment.center,
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        ColorConstants().appColor),
                                  ),
                                  Text(
                                    'Collecting information about your places'
                                    ' Please wait...',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: ColorConstants().appColor),
                                  )
                                ],
                              ),
                            ),
                          )
                        : Align(
                            alignment: Alignment.center,
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(
                                    '$error',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: ColorConstants().appColor),
                                  )
                                ],
                              ),
                            ),
                          )
                    : RefreshIndicator(
                        onRefresh: refreshData,
                        child: ListView.builder(
                          itemBuilder: (context, index) => InkWell(
                            onTap: () async {
                              try {
                                var device = results[index].device;

                                await Navigator.push(context,
                                    MaterialPageRoute(builder: (context) {
                                  return PlaceDetailsPage(device: device);
                                })).then((value) => setState(() {}));
                              } catch (e) {
                                print(e);
                                await showSnackBar(context,
                                    'Information not available. Try again later');
                              }
                            },
                            child: AirQualityCard(data: results[index]),
                          ),
                          itemCount: results.length,
                        ),
                      )
                : Center(
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'You haven\'t added any locations you care about '
                        'to MyPlaces yet, click the search icon '
                        'or use the map to add them to your list',
                        softWrap: true,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: ColorConstants().appColor,
                        ),
                      ),
                    ),
                  )));
  }

  Future<void> refreshData() async {
    var data = await DBHelper().getFavouritePlaces();

    setState(() {
      results = data;
    });
  }
}
